require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// --- ایمپورت روت‌ها و کنترلرها ---
const adminRoutes = require('./routes/adminRoutes');
const userController = require('./controllers/userController');

// --- تنظیمات اولیه ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- میدل‌ورهای حیاتی ---
app.use(cors());
app.use(express.json()); // خواندن بادی درخواست‌ها

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- اتصال به دیتابیس ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Successfully'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err.message));


// ==========================================
// 📌 تعریف مدل‌ها (Models)
// ==========================================

// 1. User Model
const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true, required: true },
  phone: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }, // admin, user, banned
  tokens: { type: Number, default: 5 },
  jobType: { type: String, default: 'unknown' },
  mustChangePassword: { type: Boolean, default: false }
}, { timestamps: true });
const User = mongoose.models.User || mongoose.model('User', userSchema);

// 2. License Model
const licenseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  tokens: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  expiresAt: Date
});
const License = mongoose.models.License || mongoose.model('License', licenseSchema);

// 3. KnowledgeBase Model
const kbSchema = new mongoose.Schema({
  title: String,
  content: String,
  category: String,
  subCategory: String,
  tags: [String]
});
const KnowledgeBase = mongoose.models.KnowledgeBase || mongoose.model('KnowledgeBase', kbSchema);

// 4. ChatSession Model (جدید: برای مدیریت نشست‌های گفتگو) 🔥
const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  botType: String, // مثلاً bee, dog
  title: String,   // عنوان چت
}, { timestamps: true });
const ChatSession = mongoose.models.ChatSession || mongoose.model('ChatSession', sessionSchema);

// 5. ChatLog Model (آپدیت شده با sessionId)
const chatLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatSession' }, // ارتباط با سشن
  botType: { type: String, default: 'General' },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  reference: { type: String },
  licenseUsed: { type: String },
  isFallbackResponse: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});
const ChatLog = mongoose.models.ChatLog || mongoose.model('ChatLog', chatLogSchema);

// 6. Ticket Model
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

// 7. Notification Model
const notifSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String, message: String, link: String, isRead: { type: Boolean, default: false }
}, { timestamps: true });
const Notification = mongoose.models.Notification || mongoose.model('Notification', notifSchema);

// 8. Transaction Model
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
// 🛡️ ثابت‌ها
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
// 🛡️ میدل‌ور احراز هویت
// ==========================================
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
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
// 🌐 روت‌های اصلی (API Routes)
// ==========================================

app.get('/', (req, res) => res.send('<h1>✅ Iran Vet AI Backend is Running!</h1>'));

// ------------------------------------------
// 1️⃣ احراز هویت (Auth)
// ------------------------------------------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'این ایمیل قبلاً ثبت شده است.' });
    
    const newUser = await User.create({ fullName, email, phone, password, tokens: 5 });
    
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
        return res.status(403).json({ 
            message: '⛔ حساب کاربری شما مسدود شده است. لطفاً با پشتیبانی تماس بگیرید.' 
        });
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
// 2️⃣ چت هوشمند (Sessions + History + RAG) 🧠💾
// ------------------------------------------
app.post('/api/chat', authenticateToken, async (req, res) => {
  try {
    // sessionId هم از فرانت می‌آید (اگر null باشد یعنی چت جدید)
    let { message, botType, licenseCode, sessionId } = req.body; 
    const user = req.user;

    // --- مدیریت سشن (New Chat vs History) ---
    let currentSession;
    let isNewSession = false;

    if (sessionId) {
        // اگر ID فرستاد، پیداش کن
        currentSession = await ChatSession.findById(sessionId);
        if (!currentSession || currentSession.user.toString() !== user.id) {
            return res.status(404).json({ message: 'نشست گفتگو یافت نشد.' });
        }
    } else {
        // اگر ID نفرستاد، یکی بساز (New Chat)
        isNewSession = true;
        // عنوان چت را از ۱۰ کلمه اول پیام می‌سازیم
        const generatedTitle = message.split(' ').slice(0, 6).join(' ') + '...';
        currentSession = await ChatSession.create({
            user: user._id,
            botType: botType,
            title: generatedTitle
        });
        sessionId = currentSession._id;
    }

    // --- سلام و احوالپرسی ---
    const greetings = ['سلام', 'درود', 'خسته نباشید', 'چطوری', 'خوبی', 'صبح بخیر', 'شب بخیر', 'hi', 'hello'];
    const isGreeting = greetings.some(g => message.trim().toLowerCase().startsWith(g)) && message.length < 30;

    if (isGreeting) {
        const botName = BOT_TITLES[botType] || 'دامپزشکی';
        return res.json({ 
            response: `سلام! من دستیار هوشمند ${botName} هستم. لطفاً علائم و مشکل حیوان را توضیح دهید تا بررسی کنم.`, 
            remainingTokens: user.tokens, 
            isFallback: false,
            sessionId: currentSession._id, // شناسه سشن را برمی‌گردانیم
            title: currentSession.title
        });
    }

    // --- بررسی اعتبار ---
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

    // --- حافظه: فقط پیام‌های همین سشن! ---
    const historyLogs = await ChatLog.find({ session: sessionId })
        .sort({ timestamp: -1 })
        .limit(6); // ۶ پیام آخر همین گفتگو

    const historyMessages = historyLogs.reverse().flatMap(log => [
        { role: "user", content: log.question },
        { role: "assistant", content: log.answer }
    ]);

    // --- RAG (جستجو) ---
    const stopWords = ['اقا', 'آقا', 'من', 'تو', 'ما', 'شما', 'است', 'که', 'در', 'با', 'از', 'به', 'را', 'این', 'آن', 'زنبور', 'عسل', 'دارم', 'داره', 'هست']; 
    const cleanMessage = message.replace(/[،؛:!?.()]/g, ''); 
    const words = cleanMessage.split(/\s+/).filter(w => w.length > 2 && !stopWords.includes(w));

    let searchCondition = {};
    if (words.length > 0) {
        searchCondition = {
            category: botType,
            $or: words.map(word => ({ content: { $regex: word, $options: 'i' } }))
        };
    } else {
        searchCondition = { category: botType, content: { $regex: message, $options: 'i' } };
    }

    const relatedDocs = await KnowledgeBase.find(searchCondition).limit(3);

    let aiAnswer = "";
    let referenceText = "";
    let shouldDeductToken = false; 

    // --- لاجیک هوشمند ---
    const isFollowUp = historyMessages.length > 0 && relatedDocs.length === 0;

    if (relatedDocs.length === 0 && !isFollowUp) {
        aiAnswer = "متاسفانه با این کلمات کلیدی، اطلاعاتی در پایگاه دانش تخصصی یافت نشد. لطفاً علائم را با جزئیات بیشتری توضیح دهید.";
        referenceText = "بدون منبع";
        shouldDeductToken = false;
    } else {
        shouldDeductToken = true;
        
        const contextData = relatedDocs.map(doc => doc.content).join("\n---\n");
        referenceText = relatedDocs.length > 0 ? relatedDocs.map(doc => doc.title).join(", ") : "حافظه گفتگو";
        const botTitle = BOT_TITLES[botType] || botType;

        const systemPrompt = `
            شما یک "دامپزشک متخصص" و هوشمند در زمینه "${botTitle}" هستید.
            
            اطلاعات مرجع (CONTEXT):
            ${contextData ? contextData : "اطلاعات جدیدی یافت نشد، فقط به حافظه گفتگو (History) مراجعه کن."}

            دستورالعمل حیاتی (Diagnosis Protocol):
            1. به ۵ پیام آخر این گفتگو (History) دسترسی داری.
            2. سوال کاربر را در ادامه گفتگو تحلیل کن.
            3. اگر کاربر علائم ناقص گفت، سوال بپرس.
            4. فقط از CONTEXT و History استفاده کن. دانش عمومی ممنوع.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                ...historyMessages,
                { role: "user", content: message }
            ],
            temperature: 0.3, 
        });

        aiAnswer = response.choices[0].message.content;
    }

    // --- کسر اعتبار ---
    if (shouldDeductToken) {
        if (useUserTokens) {
            user.tokens -= 1;
            await user.save();
        } else if (activeLicense) {
            activeLicense.tokens -= 1;
            await activeLicense.save();
        }
    }

    // --- ذخیره پیام در این سشن ---
    await ChatLog.create({
        user: user._id,
        session: sessionId, // 👈 ذخیره با شناسه سشن
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
        sessionId: sessionId, // ID سشن را برمی‌گردانیم تا فرانت ذخیره کند
        title: currentSession.title
    });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ message: 'خطا در پردازش هوش مصنوعی' });
  }
});


// ==========================================
// 3️⃣ روت‌های مدیریت تاریخچه (Sidebar) 📂
// ==========================================

// دریافت لیست سشن‌ها (برای سایدبار)
app.get('/api/chat/sessions', authenticateToken, async (req, res) => {
    try {
        const { botType } = req.query; // مثلا ?botType=bee
        const filter = { user: req.user.id };
        if (botType) filter.botType = botType;

        const sessions = await ChatSession.find(filter)
            .sort({ updatedAt: -1 }) // آخرین گفتگوها اول
            .limit(20);
            
        res.json(sessions);
    } catch (error) { res.status(500).json({ message: 'خطا در دریافت لیست گفتگوها' }); }
});

// دریافت پیام‌های یک سشن خاص (وقتی روی سایدبار کلیک میشه)
app.get('/api/chat/sessions/:id', authenticateToken, async (req, res) => {
    try {
        const messages = await ChatLog.find({ 
            session: req.params.id, 
            user: req.user.id 
        }).sort({ timestamp: 1 }); // از قدیم به جدید برای نمایش
        
        res.json(messages);
    } catch (error) { res.status(500).json({ message: 'خطا در بارگذاری گفتگو' }); }
});

// حذف یک سشن
app.delete('/api/chat/sessions/:id', authenticateToken, async (req, res) => {
    try {
        await ChatSession.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        await ChatLog.deleteMany({ session: req.params.id }); // پاک کردن پیام‌هایش
        res.json({ message: 'گفتگو حذف شد' });
    } catch (error) { res.status(500).json({ message: 'خطا' }); }
});


// ------------------------------------------
// 4️⃣ سیستم تیکت (Tickets)
// ------------------------------------------
app.post('/api/tickets', authenticateToken, async (req, res) => {
    try {
        await Ticket.create({ 
            user: req.user.id, 
            subject: req.body.subject, 
            messages: [{ sender: 'user', text: req.body.message }] 
        });
        res.status(201).json({ message: 'تیکت شما با موفقیت ثبت شد.' });
    } catch (error) { res.status(500).json({ message: 'Error creating ticket' }); }
});

app.get('/api/tickets', authenticateToken, async (req, res) => {
    const tickets = await Ticket.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tickets);
});

app.get('/api/tickets/:id', authenticateToken, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'یافت نشد' });
        if (ticket.user.toString() !== req.user.id) return res.status(403).json({ message: 'دسترسی ندارید' });
        res.json(ticket);
    } catch (error) { res.status(500).json({ message: 'خطا' }); }
});

app.post('/api/tickets/:id/reply', authenticateToken, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'یافت نشد' });
        
        if (ticket.user.toString() !== req.user.id) return res.status(403).json({ message: 'دسترسی ندارید' });

        ticket.messages.push({ sender: 'user', text: req.body.text });
        ticket.status = 'open'; 
        await ticket.save();
        res.json({ message: 'پاسخ شما ارسال شد' });
    } catch (error) { res.status(500).json({ message: 'خطا در ارسال پاسخ' }); }
});


// ------------------------------------------
// 5️⃣ نوتیفیکیشن‌ها (Notifications)
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
// 6️⃣ روت ایمپورت دیتابیس (CSV Import)
// ------------------------------------------
app.get('/api/setup/import-bee', async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'data', 'bee_data.csv');
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: '❌ فایل bee_data.csv در پوشه backend/data یافت نشد.' });
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
                const symptoms = cols[2]?.trim();
                const treatment = cols[3]?.trim();
                const extra = cols[4]?.trim() || '';

                const content = `بیماری: ${title}\nعلائم: ${symptoms}\nدرمان: ${treatment}\nتوضیحات: ${extra}`;
                
                const exists = await KnowledgeBase.findOne({ title });
                if (!exists) {
                    await KnowledgeBase.create({
                        title,
                        category: 'bee',
                        subCategory,
                        content,
                        tags: ['bee', 'disease', subCategory]
                    });
                    count++;
                }
            }
        }
        res.json({ message: `✅ عملیات موفق! ${count} رکورد جدید به پایگاه دانش اضافه شد.`, status: 'success' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'خطا در ایمپورت: ' + error.message });
    }
});


// ------------------------------------------
// 7️⃣ روت‌های ماژولار (Admin & User Profile)
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
