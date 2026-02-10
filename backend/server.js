require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// ==========================================
// ⚙️ تنظیمات اولیه سرور
// ==========================================
const app = express();
const PORT = process.env.PORT || 3000;

// تنظیمات میدل‌ور (Middlewares)
app.use(cors());
app.use(express.json()); // قابلیت خواندن JSON در بادی درخواست‌ها

// تنظیم OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// اتصال به دیتابیس MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Successfully'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err.message));


// ==========================================
// 🗄️ بخش اول: تعریف مدل‌های دیتابیس (Models)
// ==========================================

// 1. مدل کاربر (User)
const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true, required: true },
  phone: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }, // مقادیر: admin, user, banned
  tokens: { type: Number, default: 5 }, // اعتبار اولیه ۵ عدد
  jobType: { type: String, default: 'unknown' },
  mustChangePassword: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

// 2. مدل لایسنس (License) - برای شارژ حساب با کد
const licenseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  tokens: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  expiresAt: Date
});
const License = mongoose.models.License || mongoose.model('License', licenseSchema);

// 3. مدل پایگاه دانش (KnowledgeBase) - مغز هوش مصنوعی
const kbSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true }, // bee, dog, cat, ...
  subCategory: { type: String, default: 'general' },
  tags: [String],
  sourceFile: { type: String, default: 'manual_entry' }, 
  topic: { type: String, default: 'general' }
}, { timestamps: true });

// ایندکس‌گذاری برای جستجوی سریع متنی
kbSchema.index({ content: 'text', title: 'text', tags: 'text' });
const KnowledgeBase = mongoose.models.KnowledgeBase || mongoose.model('KnowledgeBase', kbSchema);

// 4. مدل نشست گفتگو (ChatSession) - لیست چت‌ها در سایدبار
const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  botType: String, // نوع ربات
  title: String,   // عنوان تولید شده برای چت
}, { timestamps: true });
const ChatSession = mongoose.models.ChatSession || mongoose.model('ChatSession', sessionSchema);

// 5. مدل پیام‌ها (ChatLog) - شامل سوال، جواب و فیدبک
const chatLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatSession' }, 
  botType: { type: String, default: 'General' },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  reference: { type: String, default: null }, // منبع پاسخ
  licenseUsed: { type: String },
  isFallbackResponse: { type: Boolean, default: false }, // آیا هوش مصنوعی از خودش گفته؟
  
  // سیستم فیدبک (لایک و دیس‌لایک)
  feedback: { type: String, enum: ['like', 'dislike', null], default: null },
  feedbackReason: { type: String, default: null },
  feedbackComment: { type: String, default: null },

  timestamp: { type: Date, default: Date.now }
});
const ChatLog = mongoose.models.ChatLog || mongoose.model('ChatLog', chatLogSchema);

// 6. مدل تیکت پشتیبانی (Ticket)
const ticketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subject: String,
  status: { type: String, enum: ['open', 'pending', 'closed', 'answered'], default: 'open' },
  messages: [{
    sender: String, // 'user' یا 'admin'
    text: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });
const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);

// 7. مدل اعلان‌ها (Notification)
const notifSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String, 
  message: String, 
  link: String, 
  isRead: { type: Boolean, default: false }
}, { timestamps: true });
const Notification = mongoose.models.Notification || mongoose.model('Notification', notifSchema);

// 8. مدل تراکنش مالی (Transaction)
const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ادمینی که شارژ کرده
  amount: { type: Number, required: true },
  tokens: { type: Number, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now }
});
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);


// ==========================================
// 🛡️ بخش دوم: میدل‌ورهای امنیتی
// ==========================================

const BOT_TITLES = {
    bee: "زنبور عسل", dog: "سگ‌ها", cat: "گربه‌ها", cow: "دام بزرگ",
    horse: "اسب", poultry: "طیور", fish: "آبزیان", general: "دامپزشکی عمومی"
};

// 1. میدل‌ور بررسی توکن (Authentication)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // فرمت: Bearer TOKEN

  if (!token) return res.status(401).json({ message: 'دسترسی غیرمجاز: توکن وجود ندارد' });
  
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: 'توکن نامعتبر است' });

    try {
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: 'کاربر یافت نشد' });

        if (user.role === 'banned') {
            return res.status(403).json({ message: '⛔ حساب شما مسدود شده است.' });
        }

        req.user = user; // کاربر را به درخواست می‌چسبانیم
        next();
    } catch (error) {
        return res.status(500).json({ message: 'خطای سرور در احراز هویت' });
    }
  });
};

// 2. میدل‌ور بررسی ادمین (Admin Check)
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'دسترسی غیرمجاز: فقط مدیران' });
    }
};


// ==========================================
// 🌐 بخش سوم: روت‌های عمومی و احراز هویت
// ==========================================

// تست سلامت سرور
app.get('/', (req, res) => {
    res.send('<h1>✅ Iran Vet AI Backend is Running!</h1>');
});

// ثبت نام کاربر
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    
    // بررسی تکراری بودن ایمیل
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'این ایمیل قبلاً ثبت شده است.' });
    
    // ایجاد کاربر جدید
    const newUser = await User.create({ fullName, email, phone, password, tokens: 5 });
    
    // ارسال نوتیفیکیشن خوش‌آمدگویی
    await Notification.create({ 
        user: newUser._id, 
        title: 'خوش آمدید', 
        message: 'حساب کاربری شما با موفقیت ایجاد شد. ۵ توکن هدیه دریافت کردید.' 
    });

    const token = jwt.sign({ id: newUser._id, role: 'user' }, process.env.JWT_SECRET);
    res.status(201).json({ message: 'ثبت نام موفق', token, user: newUser });
  } catch (error) { 
      res.status(500).json({ message: 'خطا در ثبت نام: ' + error.message }); 
  }
});

// ورود کاربر
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password }); 
    
    if (!user) return res.status(401).json({ message: 'ایمیل یا رمز عبور اشتباه است.' });

    if (user.role === 'banned') {
        return res.status(403).json({ message: '⛔ حساب کاربری شما مسدود شده است.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    
    res.json({ 
        token, 
        user: { 
            name: user.fullName, 
            role: user.role, 
            tokens: user.tokens,
            email: user.email,
            phone: user.phone,
            jobType: user.jobType,
            mustChangePassword: user.mustChangePassword
        } 
    });
  } catch (error) { res.status(500).json({ message: 'خطای سرور' }); }
});


// ==========================================
// 🤖 بخش چهارم: هوش مصنوعی و چت (RAG System)
// ==========================================

app.post('/api/chat', authenticateToken, async (req, res) => {
  try {
    let { message, botType, licenseCode, sessionId } = req.body; 
    const user = req.user;

    // 1. مدیریت نشست گفتگو (Session)
    let currentSession;
    if (sessionId) {
        currentSession = await ChatSession.findById(sessionId);
        if (!currentSession || currentSession.user.toString() !== user.id) {
            return res.status(404).json({ message: 'نشست گفتگو یافت نشد.' });
        }
    } else {
        // ایجاد سشن جدید با عنوان خودکار
        const generatedTitle = message.split(' ').slice(0, 6).join(' ') + '...';
        currentSession = await ChatSession.create({
            user: user._id,
            botType: botType,
            title: generatedTitle
        });
        sessionId = currentSession._id;
    }

    // 2. پاسخ سریع به احوالپرسی (برای صرفه‌جویی در هزینه)
    const greetings = ['سلام', 'درود', 'خسته نباشید', 'چطوری', 'خوبی', 'صبح بخیر', 'شب بخیر', 'hi', 'hello'];
    const isGreeting = greetings.some(g => message.trim().toLowerCase().startsWith(g)) && message.length < 30;

    if (isGreeting) {
        const botName = BOT_TITLES[botType] || 'دامپزشکی';
        return res.json({ 
            response: `سلام! من دستیار هوشمند ${botName} هستم. لطفاً مشکل یا سوال خود را بفرمایید.`, 
            remainingTokens: user.tokens, 
            isFallback: false,
            sessionId: currentSession._id, 
            title: currentSession.title
        });
    }

    // 3. بررسی اعتبار (توکن کاربر یا لایسنس)
    let activeLicense = null;
    let useUserTokens = false;

    if (licenseCode) {
        activeLicense = await License.findOne({ code: licenseCode, isActive: true });
        if (!activeLicense || activeLicense.tokens < 1) {
            return res.status(400).json({ message: 'لایسنس نامعتبر یا فاقد اعتبار است.' });
        }
    } else {
        if (user.tokens < 1) {
            return res.status(403).json({ message: 'اعتبار توکن حساب شما تمام شده است.' });
        }
        useUserTokens = true;
    }

    // 4. دریافت تاریخچه گفتگو (برای حافظه کوتاه‌مدت)
    const historyLogs = await ChatLog.find({ session: sessionId })
        .sort({ timestamp: -1 })
        .limit(6);

    const historyMessages = historyLogs.reverse().flatMap(log => [
        { role: "user", content: log.question },
        { role: "assistant", content: log.answer }
    ]);

    // 5. استخراج کلمات کلیدی هوشمند (Query Expansion)
    const botTitle = BOT_TITLES[botType] || botType;
    const searchPrompt = `
        کاربر سوالی در مورد "${botTitle}" پرسیده است: "${message}"
        وظیفه تو: کلمات کلیدی، هم‌معنی‌های تخصصی و نام بیماری‌های مرتبط را استخراج کن.
        فقط کلمات را با فاصله (Space) جدا کن.
    `;

    const keywordExtraction = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: "Keywords only." }, { role: "user", content: searchPrompt }],
        temperature: 0.3,
    });

    const smartKeywords = keywordExtraction.choices[0].message.content.split(/\s+/);

    // 6. جستجو در پایگاه دانش (RAG)
    let searchCondition = {
        category: botType,
        $or: [
            { content: { $regex: message, $options: 'i' } }, // جستجوی عین جمله
            ...smartKeywords.map(word => ({ content: { $regex: word, $options: 'i' } })) // جستجوی کلمات کلیدی
        ]
    };

    const relatedDocs = await KnowledgeBase.find(searchCondition).limit(4);

    // 7. تولید پاسخ نهایی توسط هوش مصنوعی
    let aiAnswer = "";
    let referenceText = "";
    let shouldDeductToken = true; 

    // اگر دیتابیس خالی بود ولی کاربر دارد ادامه بحث قبلی را می‌کند، نباید قطع کنیم
    const isFollowUp = historyMessages.length > 0 && relatedDocs.length === 0;

    if (relatedDocs.length === 0 && !isFollowUp) {
        aiAnswer = "متاسفانه اطلاعات دقیقی در پایگاه دانش تخصصی یافت نشد. لطفاً علائم را با جزئیات بیشتری توضیح دهید.";
        referenceText = "بدون منبع";
        shouldDeductToken = false; // توکن کسر نمی‌شود
    } else {
        const contextData = relatedDocs.map(doc => doc.content).join("\n---\n");
        referenceText = relatedDocs.length > 0 ? relatedDocs.map(doc => doc.title).join(", ") : "حافظه گفتگو";

        const systemPrompt = `
            شما یک "دامپزشک متخصص" و هوشمند در زمینه "${botTitle}" هستید.
            
            اطلاعات علمی (CONTEXT):
            ${contextData}

            دستورالعمل:
            1. به ۵ پیام آخر (History) دسترسی داری.
            2. پاسخ باید کاملاً علمی، دلسوزانه و به زبان فارسی باشد.
            3. فقط از CONTEXT و History استفاده کن.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                ...historyMessages,
                { role: "user", content: message }
            ],
            temperature: 0.4, 
        });

        aiAnswer = response.choices[0].message.content;
    }

    // 8. کسر اعتبار
    if (shouldDeductToken) {
        if (useUserTokens) {
            user.tokens -= 1;
            await user.save();
        } else if (activeLicense) {
            activeLicense.tokens -= 1;
            await activeLicense.save();
        }
    }

    // 9. ذخیره پیام در دیتابیس
    const newLog = await ChatLog.create({
        user: user._id,
        session: sessionId,
        botType: botType,
        question: message,
        answer: aiAnswer,
        reference: referenceText,
        licenseUsed: licenseCode || 'UserTokens',
        isFallbackResponse: relatedDocs.length === 0 && !isFollowUp
    });

    res.json({ 
        response: aiAnswer, 
        remainingTokens: useUserTokens ? user.tokens : (activeLicense ? activeLicense.tokens : 0),
        sessionId: sessionId, 
        title: currentSession.title,
        messageId: newLog._id // برای ثبت فیدبک
    });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ message: 'خطا در پردازش هوش مصنوعی' });
  }
});

// ثبت بازخورد (لایک/دیس‌لایک)
app.post('/api/chat/:id/feedback', authenticateToken, async (req, res) => {
    try {
        const { feedback, reason, comment } = req.body;
        const chatLog = await ChatLog.findById(req.params.id);

        if (!chatLog) return res.status(404).json({ message: 'پیام یافت نشد' });
        
        if (chatLog.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'غیرمجاز' });
        }

        chatLog.feedback = feedback;
        chatLog.feedbackReason = reason;
        chatLog.feedbackComment = comment;
        await chatLog.save();

        res.json({ message: 'بازخورد ثبت شد.' });
    } catch (error) {
        res.status(500).json({ message: 'خطا در ثبت بازخورد' });
    }
});


// ==========================================
// 🛡️ بخش پنجم: روت‌های ادمین (Full Admin Panel)
// ==========================================

// 1. آمار داشبورد (این بخش باعث کار نکردن پیشخوان شده بود)
app.get('/api/admin/stats', authenticateToken, isAdmin, async (req, res) => {
    try {
        // شمارش‌ها
        const totalUsers = await User.countDocuments();
        const totalChats = await ChatLog.countDocuments();
        const pendingTickets = await Ticket.countDocuments({ status: 'open' });
        const fallbackChats = await ChatLog.countDocuments({ isFallbackResponse: true });
        
        // محاسبه درآمد کل
        const transactions = await Transaction.find();
        const totalRevenue = transactions.reduce((acc, curr) => acc + curr.amount, 0);

        // تولید داده برای نمودار ۷ روز گذشته
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            
            const startOfDay = new Date(dateStr);
            const endOfDay = new Date(new Date(dateStr).getTime() + 86400000);
            
            const count = await User.countDocuments({ 
                createdAt: { $gte: startOfDay, $lt: endOfDay } 
            });
            chartData.push({ date: dateStr, count });
        }

        res.json({ 
            users: totalUsers, 
            chats: totalChats, 
            revenue: totalRevenue, 
            pendingTickets: pendingTickets,
            fallbackRate: totalChats > 0 ? Math.round((fallbackChats / totalChats) * 100) : 0, 
            chartData: chartData // ارسال داده‌های نمودار
        });
    } catch (error) {
        console.error("Admin Stats Error:", error);
        res.status(500).json({ message: 'خطا در دریافت آمار' });
    }
});

// 2. مدیریت دیتابیس هوشمند (Knowledge Base CRUD)
app.get('/api/admin/knowledge', authenticateToken, isAdmin, async (req, res) => {
    try {
        const docs = await KnowledgeBase.find().sort({ createdAt: -1 });
        res.json(docs);
    } catch (error) { res.status(500).json({ message: 'خطا در دریافت دیتابیس' }); }
});

app.post('/api/admin/knowledge', authenticateToken, isAdmin, async (req, res) => {
    try {
        await KnowledgeBase.create(req.body);
        res.json({ message: 'رکورد جدید اضافه شد' });
    } catch (error) { res.status(500).json({ message: 'خطا در افزودن' }); }
});

app.delete('/api/admin/knowledge/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await KnowledgeBase.findByIdAndDelete(req.params.id);
        res.json({ message: 'رکورد حذف شد' });
    } catch (error) { res.status(500).json({ message: 'خطا در حذف' }); }
});

// 3. مانیتورینگ چت‌ها (با فیلتر)
app.get('/api/admin/chat-logs', authenticateToken, isAdmin, async (req, res) => {
    try {
        let query = {};
        if (req.query.filter === 'fallback') query.isFallbackResponse = true;
        if (req.query.filter === 'database') query.isFallbackResponse = false;
        
        const logs = await ChatLog.find(query)
            .populate('user', 'fullName email phone')
            .sort({ timestamp: -1 })
            .limit(100);
        res.json(logs);
    } catch (error) { res.status(500).json({ message: 'خطا در دریافت لاگ‌ها' }); }
});

// 4. مدیریت کاربران (لیست، بن، شارژ)
app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
});

app.post('/api/admin/users/ban', authenticateToken, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.body.userId);
        if (!user) return res.status(404).json({ message: 'کاربر نیست' });
        
        user.role = user.role === 'banned' ? 'user' : 'banned';
        await user.save();
        res.json({ message: `وضعیت کاربر تغییر کرد: ${user.role}` });
    } catch (error) { res.status(500).json({ message: 'خطا' }); }
});

app.post('/api/admin/users/charge', authenticateToken, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.body.userId);
        if (!user) return res.status(404).json({ message: 'کاربر نیست' });

        user.tokens += parseInt(req.body.tokens);
        await user.save();
        
        await Transaction.create({ 
            user: user._id, 
            admin: req.user._id, 
            amount: 0, 
            tokens: parseInt(req.body.tokens), 
            description: 'شارژ دستی توسط مدیریت' 
        });
        res.json({ message: 'شارژ انجام شد' });
    } catch (error) { res.status(500).json({ message: 'خطا' }); }
});

// 5. تیکت‌های پشتیبانی (Admin)
app.get('/api/admin/tickets', authenticateToken, isAdmin, async (req, res) => {
    const tickets = await Ticket.find().populate('user', 'fullName email').sort({ createdAt: -1 });
    res.json(tickets);
});

app.post('/api/admin/tickets/:id/reply', authenticateToken, isAdmin, async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);
    ticket.messages.push({ sender: 'admin', text: req.body.text });
    ticket.status = 'answered'; 
    await ticket.save();
    res.json({ message: 'پاسخ ارسال شد' });
});

// 6. گزارشات مالی
app.get('/api/admin/finance', authenticateToken, isAdmin, async (req, res) => {
    const trans = await Transaction.find().populate('user', 'fullName').sort({ date: -1 });
    res.json(trans);
});


// ==========================================
// 👤 بخش ششم: روت‌های کاربر (User Routes)
// ==========================================

// دریافت پروفایل
app.get('/api/users/profile', authenticateToken, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
});

// آپدیت پروفایل
app.put('/api/users/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (req.body.fullName) user.fullName = req.body.fullName;
        if (req.body.phone) user.phone = req.body.phone;
        if (req.body.email) user.email = req.body.email;
        
        if (req.body.password && req.body.password.trim().length > 0) {
            user.password = req.body.password;
            user.mustChangePassword = false;
        }
        
        await user.save();
        res.json({ 
            message: 'پروفایل آپدیت شد', 
            user, 
            token: req.headers.authorization.split(' ')[1] 
        });
    } catch (error) { res.status(500).json({ message: 'خطا در آپدیت پروفایل' }); }
});

// دریافت لیست سشن‌ها
app.get('/api/chat/sessions', authenticateToken, async (req, res) => {
    const { botType } = req.query; 
    const filter = { user: req.user.id };
    if (botType) filter.botType = botType;
    const sessions = await ChatSession.find(filter).sort({ updatedAt: -1 }).limit(20);
    res.json(sessions);
});

// دریافت پیام‌های یک سشن
app.get('/api/chat/sessions/:id', authenticateToken, async (req, res) => {
    const msgs = await ChatLog.find({ session: req.params.id, user: req.user.id }).sort({ timestamp: 1 });
    res.json(msgs);
});

// حذف سشن
app.delete('/api/chat/sessions/:id', authenticateToken, async (req, res) => {
    await ChatSession.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    await ChatLog.deleteMany({ session: req.params.id });
    res.json({ message: 'حذف شد' });
});

// ثبت تیکت جدید توسط کاربر
app.post('/api/tickets', authenticateToken, async (req, res) => {
    try {
        await Ticket.create({ 
            user: req.user.id, 
            subject: req.body.subject, 
            messages: [{ sender: 'user', text: req.body.message }] 
        });
        res.status(201).json({ message: 'تیکت ثبت شد' });
    } catch (error) { res.status(500).json({ message: 'Error' }); }
});

// دریافت تیکت‌های کاربر
app.get('/api/tickets', authenticateToken, async (req, res) => {
    const tickets = await Ticket.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tickets);
});
app.get('/api/tickets/:id', authenticateToken, async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket || ticket.user.toString() !== req.user.id) return res.status(403).json({ message: 'غیرمجاز' });
    res.json(ticket);
});
app.post('/api/tickets/:id/reply', authenticateToken, async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);
    if (ticket.user.toString() !== req.user.id) return res.status(403).json({ message: 'غیرمجاز' });
    ticket.messages.push({ sender: 'user', text: req.body.text });
    ticket.status = 'open'; await ticket.save();
    res.json({ message: 'پاسخ ارسال شد' });
});

// نوتیفیکیشن‌ها
app.get('/api/notifications', authenticateToken, async (req, res) => {
    const notifs = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notifs);
});
app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
});


// ==========================================
// 📥 بخش هفتم: ایمپورت دیتابیس (Setup)
// ==========================================
app.get('/api/setup/import-bee', async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'data', 'bee_data.csv');
        if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'فایل یافت نشد' });
        
        const data = fs.readFileSync(filePath, 'utf8');
        const rows = data.split('\n').slice(1); 
        let count = 0;

        for (const row of rows) {
            if (!row.trim()) continue;
            const cols = row.split(','); 
            if (cols.length >= 4) {
                const title = cols[0]?.trim();
                const subCategory = cols[1]?.trim();
                const exists = await KnowledgeBase.findOne({ title });
                if (!exists) {
                    await KnowledgeBase.create({
                        title, 
                        category: 'bee', 
                        subCategory: subCategory, 
                        content: `بیماری: ${title}\nعلائم: ${cols[2]}\nدرمان: ${cols[3]}`,
                        tags: ['bee', 'disease', subCategory], 
                        sourceFile: 'bee_data.csv',
                        topic: subCategory || 'general'
                    });
                    count++;
                }
            }
        }
        res.json({ message: `✅ ${count} رکورد جدید اضافه شد.`, status: 'success' });
    } catch (error) { res.status(500).json({ message: 'خطا در ایمپورت' }); }
});


// ==========================================
// 🚀 اجرای سرور
// ==========================================
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API is ready at http://localhost:${PORT}`);
});
