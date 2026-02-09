require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// --- ایمپورت روت‌ها و کنترلرها ---
// مطمئن شوید فایل‌های adminRoutes.js و userController.js در پوشه‌های مربوطه وجود دارند
const adminRoutes = require('./routes/adminRoutes');
const userController = require('./controllers/userController');

// --- تنظیمات اولیه سرور ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- میدل‌ورهای حیاتی ---
app.use(cors());
app.use(express.json()); // برای خواندن داده‌های JSON در درخواست‌ها

// تنظیم OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- اتصال به دیتابیس MongoDB ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Successfully'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err.message));


// ==========================================
// 📌 تعریف مدل‌ها (Models)
// ==========================================

// 1. User Model (کاربران)
const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true, required: true },
  phone: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }, // نقش‌ها: admin, user, banned
  tokens: { type: Number, default: 5 }, // اعتبار اولیه
  jobType: { type: String, default: 'unknown' },
  mustChangePassword: { type: Boolean, default: false }
}, { timestamps: true });

// جلوگیری از تعریف تکراری مدل‌ها
const User = mongoose.models.User || mongoose.model('User', userSchema);

// 2. License Model (لایسنس‌ها)
const licenseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  tokens: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  expiresAt: Date
});
const License = mongoose.models.License || mongoose.model('License', licenseSchema);

// 3. KnowledgeBase Model (پایگاه دانش)
// فیلدها با مقادیر پیش‌فرض تنظیم شدند تا ایمپورت به مشکل نخورد
const kbSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, default: 'general' },
  tags: [String],
  sourceFile: { type: String, default: 'manual_entry' }, 
  topic: { type: String, default: 'general' }
});
kbSchema.index({ content: 'text', title: 'text', tags: 'text' }); // ایندکس برای جستجو
const KnowledgeBase = mongoose.models.KnowledgeBase || mongoose.model('KnowledgeBase', kbSchema);

// 4. ChatSession Model (مدیریت نشست‌های گفتگو)
const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  botType: String, // مثلاً bee, dog
  title: String,   // عنوان چت
}, { timestamps: true });
const ChatSession = mongoose.models.ChatSession || mongoose.model('ChatSession', sessionSchema);

// 5. ChatLog Model (لاگ چت + فیدبک)
const chatLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatSession' }, // ارتباط با سشن
  botType: { type: String, default: 'General' },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  reference: { type: String, default: null },
  licenseUsed: { type: String },
  isFallbackResponse: { type: Boolean, default: false },
  
  // فیلدهای سیستم فیدبک (لایک و دیس‌لایک)
  feedback: { type: String, enum: ['like', 'dislike', null], default: null },
  feedbackReason: { type: String, default: null },
  feedbackComment: { type: String, default: null },

  timestamp: { type: Date, default: Date.now }
});
const ChatLog = mongoose.models.ChatLog || mongoose.model('ChatLog', chatLogSchema);

// 6. Ticket Model (تیکت پشتیبانی)
const ticketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subject: String,
  status: { type: String, enum: ['open', 'pending', 'closed', 'answered'], default: 'open' },
  messages: [{
    sender: String, // 'user' or 'admin'
    text: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });
const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);

// 7. Notification Model (اعلان‌ها)
const notifSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String, 
  message: String, 
  link: String, 
  isRead: { type: Boolean, default: false }
}, { timestamps: true });
const Notification = mongoose.models.Notification || mongoose.model('Notification', notifSchema);

// 8. Transaction Model (تراکنش‌های مالی)
const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  tokens: { type: Number, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now }
});
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);


// ==========================================
// 🛡️ میدل‌ور احراز هویت (Authentication)
// ==========================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ message: 'دسترسی غیرمجاز: توکن وجود ندارد' });
  
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: 'توکن نامعتبر است' });

    try {
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: 'کاربر یافت نشد' });

        if (user.role === 'banned') {
            return res.status(403).json({ message: '⛔ حساب شما مسدود شده است.' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({ message: 'خطای سرور در احراز هویت' });
    }
  });
};


// ==========================================
// 🌐 ثابت‌ها (Constants)
// ==========================================
const BOT_TITLES = {
    bee: "زنبور عسل",
    dog: "سگ‌ها",
    cat: "گربه‌ها",
    cow: "دام بزرگ",
    horse: "اسب",
    poultry: "طیور",
    fish: "آبزیان",
    general: "دامپزشکی عمومی"
};


// ==========================================
// 🚀 روت‌های API
// ==========================================

// تست سلامت سرور
app.get('/', (req, res) => {
    res.send('<h1>✅ Iran Vet AI Backend is Running!</h1>');
});

// ------------------------------------------
// 1️⃣ احراز هویت (Auth)
// ------------------------------------------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    
    // بررسی تکراری بودن ایمیل
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'این ایمیل قبلاً ثبت شده است.' });
    
    // ایجاد کاربر جدید با ۵ توکن هدیه
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


// ------------------------------------------
// 2️⃣ چت هوشمند (هسته اصلی) 🧠
// ------------------------------------------
app.post('/api/chat', authenticateToken, async (req, res) => {
  try {
    let { message, botType, licenseCode, sessionId } = req.body; 
    const user = req.user;

    // الف) مدیریت سشن (ایجاد یا بازیابی)
    let currentSession;
    if (sessionId) {
        currentSession = await ChatSession.findById(sessionId);
        // بررسی اینکه سشن متعلق به همین کاربر باشد
        if (!currentSession || currentSession.user.toString() !== user.id) {
            return res.status(404).json({ message: 'نشست گفتگو یافت نشد.' });
        }
    } else {
        // ایجاد سشن جدید
        const generatedTitle = message.split(' ').slice(0, 6).join(' ') + '...';
        currentSession = await ChatSession.create({
            user: user._id,
            botType: botType,
            title: generatedTitle
        });
        sessionId = currentSession._id;
    }

    // ب) پاسخ سریع به احوالپرسی
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

    // پ) بررسی اعتبار (توکن یا لایسنس)
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

    // ت) دریافت تاریخچه گفتگو (برای حافظه)
    // فقط ۶ پیام آخر همین سشن را برمی‌داریم
    const historyLogs = await ChatLog.find({ session: sessionId })
        .sort({ timestamp: -1 })
        .limit(6);

    const historyMessages = historyLogs.reverse().flatMap(log => [
        { role: "user", content: log.question },
        { role: "assistant", content: log.answer }
    ]);

    // ث) استخراج کلمات کلیدی هوشمند (Query Expansion)
    const botTitle = BOT_TITLES[botType] || botType;
    const searchPrompt = `
        کاربر سوالی در مورد "${botTitle}" پرسیده است: "${message}"
        وظیفه تو:
        1. کلمات کلیدی، هم‌معنی‌های تخصصی و نام بیماری‌های مرتبط را استخراج کن.
        2. اگر کاربر اصطلاح عامیانه گفت، معادل علمی آن را اضافه کن.
        3. فقط کلمات را با فاصله (Space) جدا کن.
    `;

    const keywordExtraction = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: "فقط کلمات کلیدی استخراج کن." }, { role: "user", content: searchPrompt }],
        temperature: 0.3,
    });

    const smartKeywords = keywordExtraction.choices[0].message.content.split(/\s+/);

    // ج) جستجو در پایگاه دانش (RAG)
    let searchCondition = {
        category: botType,
        $or: [
            { content: { $regex: message, $options: 'i' } }, // عین جمله کاربر
            ...smartKeywords.map(word => ({ content: { $regex: word, $options: 'i' } })) // کلمات هوشمند
        ]
    };

    const relatedDocs = await KnowledgeBase.find(searchCondition).limit(4);

    // چ) تولید پاسخ نهایی توسط هوش مصنوعی
    let aiAnswer = "";
    let referenceText = "";
    let shouldDeductToken = false; 

    // منطق فالوآپ: اگر دیتابیس خالی بود ولی کاربر دارد ادامه چت قبلی را می‌دهد، قطع نکن
    const isFollowUp = historyMessages.length > 0 && relatedDocs.length === 0;

    if (relatedDocs.length === 0 && !isFollowUp) {
        aiAnswer = "متاسفانه اطلاعات دقیقی در پایگاه دانش تخصصی یافت نشد. لطفاً علائم را با جزئیات بیشتری توضیح دهید.";
        referenceText = "بدون منبع";
        shouldDeductToken = false;
    } else {
        shouldDeductToken = true;
        
        const contextData = relatedDocs.map(doc => doc.content).join("\n---\n");
        referenceText = relatedDocs.length > 0 ? relatedDocs.map(doc => doc.title).join(", ") : "حافظه گفتگو";

        const systemPrompt = `
            شما یک "دامپزشک متخصص" و هوشمند در زمینه "${botTitle}" هستید.
            
            اطلاعات علمی (CONTEXT):
            ${contextData ? contextData : "اطلاعات جدیدی یافت نشد، فقط به حافظه گفتگو مراجعه کن."}

            دستورالعمل:
            1. به ۵ پیام آخر (History) دسترسی داری.
            2. اگر کاربر تایید کرد (مثلا گفت "بله")، به سوال قبلی خودت در History نگاه کن.
            3. پاسخ باید کاملاً علمی، دلسوزانه و به زبان فارسی باشد.
            4. فقط از CONTEXT و History استفاده کن.
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

    // ح) کسر اعتبار
    if (shouldDeductToken) {
        if (useUserTokens) {
            user.tokens -= 1;
            await user.save();
        } else if (activeLicense) {
            activeLicense.tokens -= 1;
            await activeLicense.save();
        }
    }

    // خ) ذخیره پیام در دیتابیس
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

    // خروجی نهایی به فرانت
    res.json({ 
        response: aiAnswer, 
        remainingTokens: useUserTokens ? user.tokens : (activeLicense ? activeLicense.tokens : 0),
        sessionId: sessionId, 
        title: currentSession.title,
        messageId: newLog._id // 🔥 بازگشت آیدی برای ثبت فیدبک
    });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ message: 'خطا در پردازش هوش مصنوعی' });
  }
});


// ------------------------------------------
// 3️⃣ ثبت بازخورد (لایک/دیس‌لایک) 👍👎
// ------------------------------------------
app.post('/api/chat/:id/feedback', authenticateToken, async (req, res) => {
    try {
        const { feedback, reason, comment } = req.body;
        const chatLog = await ChatLog.findById(req.params.id);

        if (!chatLog) return res.status(404).json({ message: 'پیام یافت نشد' });
        
        // فقط مالک پیام می‌تواند فیدبک دهد
        if (chatLog.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'غیرمجاز' });
        }

        // آپدیت فیلدها
        chatLog.feedback = feedback;
        chatLog.feedbackReason = reason;
        chatLog.feedbackComment = comment;
        await chatLog.save();

        res.json({ message: 'بازخورد شما ثبت شد.' });
    } catch (error) {
        res.status(500).json({ message: 'خطا در ثبت بازخورد' });
    }
});


// ------------------------------------------
// 4️⃣ مدیریت تاریخچه و سشن‌ها (Sidebar)
// ------------------------------------------
// لیست سشن‌ها
app.get('/api/chat/sessions', authenticateToken, async (req, res) => {
    try {
        const { botType } = req.query; 
        const filter = { user: req.user.id };
        if (botType) filter.botType = botType;

        const sessions = await ChatSession.find(filter)
            .sort({ updatedAt: -1 }) 
            .limit(20);
            
        res.json(sessions);
    } catch (error) { res.status(500).json({ message: 'خطا در دریافت لیست' }); }
});

// جزئیات پیام‌های یک سشن
app.get('/api/chat/sessions/:id', authenticateToken, async (req, res) => {
    try {
        const messages = await ChatLog.find({ 
            session: req.params.id, 
            user: req.user.id 
        }).sort({ timestamp: 1 }); // از قدیم به جدید
        
        res.json(messages);
    } catch (error) { res.status(500).json({ message: 'خطا در بارگذاری گفتگو' }); }
});

// حذف سشن
app.delete('/api/chat/sessions/:id', authenticateToken, async (req, res) => {
    try {
        // حذف سشن
        await ChatSession.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        // حذف تمام پیام‌های داخل آن سشن
        await ChatLog.deleteMany({ session: req.params.id }); 
        res.json({ message: 'گفتگو حذف شد' });
    } catch (error) { res.status(500).json({ message: 'خطا در حذف' }); }
});


// ------------------------------------------
// 5️⃣ سیستم تیکت (پشتیبانی)
// ------------------------------------------
app.post('/api/tickets', authenticateToken, async (req, res) => {
    try {
        await Ticket.create({ 
            user: req.user.id, 
            subject: req.body.subject, 
            messages: [{ sender: 'user', text: req.body.message }] 
        });
        res.status(201).json({ message: 'تیکت شما با موفقیت ثبت شد.' });
    } catch (error) { res.status(500).json({ message: 'خطا' }); }
});

app.get('/api/tickets', authenticateToken, async (req, res) => {
    const tickets = await Ticket.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tickets);
});

app.get('/api/tickets/:id', authenticateToken, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket || ticket.user.toString() !== req.user.id) return res.status(403).json({ message: 'دسترسی ندارید' });
        res.json(ticket);
    } catch (error) { res.status(500).json({ message: 'خطا' }); }
});

app.post('/api/tickets/:id/reply', authenticateToken, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket || ticket.user.toString() !== req.user.id) return res.status(403).json({ message: 'دسترسی ندارید' });

        ticket.messages.push({ sender: 'user', text: req.body.text });
        ticket.status = 'open'; 
        await ticket.save();
        res.json({ message: 'پاسخ شما ارسال شد' });
    } catch (error) { res.status(500).json({ message: 'خطا در ارسال پاسخ' }); }
});


// ------------------------------------------
// 6️⃣ نوتیفیکیشن‌ها
// ------------------------------------------
app.get('/api/notifications', authenticateToken, async (req, res) => {
    const notifs = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notifs);
});

app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
});


// ------------------------------------------
// 7️⃣ ایمپورت دیتابیس (CSV)
// ------------------------------------------
app.get('/api/setup/import-bee', async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'data', 'bee_data.csv');
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: '❌ فایل bee_data.csv یافت نشد.' });
        }

        const data = fs.readFileSync(filePath, 'utf8');
        const rows = data.split('\n').slice(1); 
        let count = 0;

        for (const row of rows) {
            if (!row.trim()) continue;
            const cols = row.split(','); 
            if (cols.length >= 4) {
                const title = cols[0]?.trim();
                const subCategory = cols[1]?.trim();
                const content = `بیماری: ${title}\nعلائم: ${cols[2]}\nدرمان: ${cols[3]}\nتوضیحات: ${cols[4] || ''}`;
                
                const exists = await KnowledgeBase.findOne({ title });
                if (!exists) {
                    await KnowledgeBase.create({
                        title,
                        category: 'bee',
                        subCategory,
                        content,
                        tags: ['bee', 'disease', subCategory],
                        sourceFile: 'bee_data.csv',
                        topic: subCategory || 'general'
                    });
                    count++;
                }
            }
        }
        res.json({ message: `✅ ${count} رکورد جدید اضافه شد.`, status: 'success' });

    } catch (error) {
        res.status(500).json({ message: 'خطا در ایمپورت: ' + error.message });
    }
});


// ------------------------------------------
// 8️⃣ روت‌های ماژولار (ادمین و پروفایل)
// ------------------------------------------
app.use('/api/admin', adminRoutes);
app.put('/api/users/profile', authenticateToken, userController.updateProfile);
app.get('/api/users/profile', authenticateToken, userController.getProfile);


// ------------------------------------------
// 🚀 اجرای سرور
// ------------------------------------------
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API is ready at http://localhost:${PORT}`);
});
