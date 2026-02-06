require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const OpenAI = require('openai');

// --- ایمپورت فایل‌های جداگانه (اگر فایل‌ها را داری) ---
// const adminRoutes = require('./routes/adminRoutes'); // 👈 اگر فایلش هست، آن‌کامنت کن

// --- تنظیمات اولیه ---
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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
  role: { type: String, default: 'user' },
  tokens: { type: Number, default: 5 }, // توکن‌های شخصی
  jobType: { type: String, default: 'unknown' },
  mustChangePassword: { type: Boolean, default: false }
}, { timestamps: true });
const User = mongoose.models.User || mongoose.model('User', userSchema);

// 2. License Model (اضافه شد ✅)
const licenseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  tokens: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // اگر لایسنس اختصاصی است
  expiresAt: Date
});
const License = mongoose.models.License || mongoose.model('License', licenseSchema);

// 3. KnowledgeBase Model (برای RAG)
const kbSchema = new mongoose.Schema({
  title: String,
  content: String,
  category: String, // e.g., 'bee', 'dog'
  subCategory: String,
  tags: [String]
});
// ایندکس متنی برای جستجوی سریع
// kbSchema.index({ content: 'text', title: 'text' }); 
const KnowledgeBase = mongoose.models.KnowledgeBase || mongoose.model('KnowledgeBase', kbSchema);

// 4. ChatLog Model (کامل با فیلدهای درخواستی ✅)
const chatLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  botType: { type: String, default: 'General' },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  reference: { type: String }, // منبع دیتابیس
  licenseUsed: { type: String }, // کد لایسنس استفاده شده
  isFallbackResponse: { type: Boolean, default: false }, // آیا از دانش عمومی استفاده شده؟
  timestamp: { type: Date, default: Date.now }
});
const ChatLog = mongoose.models.ChatLog || mongoose.model('ChatLog', chatLogSchema);

// 5. Ticket & Notification Models
const ticketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subject: String,
  status: { type: String, default: 'open' },
  messages: [{ sender: String, text: String, createdAt: { type: Date, default: Date.now } }]
}, { timestamps: true });
const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);

const notifSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String, message: String, link: String, isRead: { type: Boolean, default: false }
}, { timestamps: true });
const Notification = mongoose.models.Notification || mongoose.model('Notification', notifSchema);


// ==========================================
// 🛡️ میدل‌ور (Middleware)
// ==========================================
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'دسترسی غیرمجاز' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'توکن نامعتبر است' });
    req.user = user;
    next();
  });
};


// ==========================================
// 🌐 روت‌ها (Routes)
// ==========================================

// 1️⃣ احراز هویت (Auth)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'ایمیل تکراری است' });
    
    const newUser = await User.create({ fullName, email, phone, password, tokens: 5 });
    
    // نوتیفیکیشن خوش‌آمد
    await Notification.create({ user: newUser._id, title: 'خوش آمدید', message: 'حساب شما ایجاد شد.' });

    const token = jwt.sign({ id: newUser._id, role: 'user' }, process.env.JWT_SECRET);
    res.status(201).json({ message: 'ثبت نام موفق', token, user: newUser });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ message: 'اطلاعات اشتباه است' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user: { name: user.fullName, role: user.role, tokens: user.tokens } });
  } catch (error) { res.status(500).json({ message: 'خطای سرور' }); }
});


// 2️⃣ چت هوشمند (RAG + License + Fallback) 🧠✅
// این دقیقاً همان کدی است که خواسته بودی و ناقص شده بود
app.post('/api/chat', authenticateToken, async (req, res) => {
  try {
    const { message, botType, licenseCode } = req.body; 
    const userId = req.user.id;
    let user = await User.findById(userId);

    // --- الف: بررسی اعتبار (لایسنس یا توکن کاربر) ---
    let activeLicense = null;
    let useUserTokens = false;

    if (licenseCode) {
        // اگر کاربر کد لایسنس فرستاده
        activeLicense = await License.findOne({ code: licenseCode, isActive: true });
        if (!activeLicense || activeLicense.tokens < 1) {
            return res.status(400).json({ message: 'لایسنس نامعتبر یا فاقد اعتبار است.' });
        }
    } else {
        // اگر لایسنس نفرستاده، از توکن شخصی استفاده کن
        if (user.tokens < 1) {
            return res.status(403).json({ message: 'اعتبار توکن حساب شما تمام شده است.' });
        }
        useUserTokens = true;
    }

    // --- ب: جستجو در دیتابیس (RAG) ---
    // جستجو بر اساس نوع ربات (category) و متن سوال
    const relatedDocs = await KnowledgeBase.find({
        category: botType, // مثلاً 'bee'
        content: { $regex: message, $options: 'i' } // جستجوی ساده (برای پیشرفته باید ایندکس بسازی)
    }).limit(3);

    let systemPrompt = "";
    let isFallback = false;
    let referenceText = "";

    if (relatedDocs.length > 0) {
        // ✅ حالت اول: اطلاعات در دیتابیس هست
        const contextData = relatedDocs.map(doc => doc.content).join("\n---\n");
        referenceText = relatedDocs.map(doc => doc.title).join(", ");
        
        systemPrompt = `
            شما دستیار دامپزشک متخصص در زمینه ${botType} هستید.
            اطلاعات علمی تایید شده:
            ${contextData}
            
            دستورالعمل: فقط و فقط بر اساس اطلاعات بالا پاسخ بده. اگر در متن نبود بگو نمیدانم.
        `;
    } else {
        // ⚠️ حالت دوم: اطلاعات نیست (Fallback)
        isFallback = true;
        referenceText = "دانش عمومی هوش مصنوعی";
        
        systemPrompt = `
            شما یک دستیار هوشمند دامپزشکی باتجربه هستید.
            کاربر سوالی درباره ${botType} پرسیده که در دیتابیس اختصاصی ما موجود نیست.
            لطفاً با تکیه بر دانش عمومی خودت به عنوان یک هوش مصنوعی پیشرفته پاسخ بده.
            پاسخ باید علمی، محتاطانه و دقیق باشد.
        `;
    }

    // --- ج: ارسال به OpenAI ---
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // یا gpt-4
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
        ],
        temperature: isFallback ? 0.7 : 0.3, // تنظیم خلاقیت
    });

    let aiAnswer = response.choices[0].message.content;

    // --- د: اضافه کردن هشدار در حالت Fallback ---
    if (isFallback) {
        const warningStart = "⚠️ **توجه:** این پاسخ بر اساس دانش عمومی هوش مصنوعی است و از دیتابیس اختصاصی ما نیست.\n\n";
        const warningEnd = "\n\n🔴 **هشدار:** لطفاً پیش از هرگونه اقدام درمانی، با دامپزشک مشورت کنید.";
        aiAnswer = warningStart + aiAnswer + warningEnd;
    }

    // --- ه: کسر اعتبار ---
    if (useUserTokens) {
        user.tokens -= 1;
        await user.save();
    } else if (activeLicense) {
        activeLicense.tokens -= 1;
        await activeLicense.save();
    }

    // --- و: ذخیره لاگ ---
    await ChatLog.create({
        user: userId,
        botType: botType,
        question: message,
        answer: aiAnswer,
        reference: referenceText,
        licenseUsed: licenseCode || 'UserTokens',
        isFallbackResponse: isFallback
    });

    res.json({ 
        response: aiAnswer, 
        remainingTokens: useUserTokens ? user.tokens : activeLicense.tokens,
        isFallback 
    });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ message: 'خطا در پردازش هوش مصنوعی' });
  }
});


// 3️⃣ تیکت و نوتیفیکیشن (سایر روت‌ها)
app.post('/api/tickets', authenticateToken, async (req, res) => {
    try {
        await Ticket.create({ user: req.user.id, subject: req.body.subject, messages: [{ sender: 'user', text: req.body.message }] });
        res.status(201).json({ message: 'تیکت ثبت شد' });
    } catch (error) { res.status(500).json({ message: 'Error' }); }
});

app.get('/api/tickets', authenticateToken, async (req, res) => {
    const tickets = await Ticket.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tickets);
});

app.get('/api/notifications', authenticateToken, async (req, res) => {
    const notifs = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notifs);
});

// ✅ دریافت تاریخچه چت‌های کاربر (واقعی)
app.get('/api/chat/history', authenticateToken, async (req, res) => {
    try {
        // جدیدترین‌ها اول باشند
        const history = await ChatLog.find({ user: req.user.id }).sort({ timestamp: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'خطا در دریافت تاریخچه' });
    }
});



// 4️⃣ روت‌های ادمین (اگر فایلش رو داری)
// app.use('/api/admin', adminRoutes); 👈 این خط را وقتی فایل adminRoutes را ساختی فعال کن


// اجرای سرور
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
