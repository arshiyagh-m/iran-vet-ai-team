require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const OpenAI = require('openai');
const fs = require('fs'); // اضافه شده برای خواندن فایل
const path = require('path'); // اضافه شده برای آدرس‌دهی فایل
const adminRoutes = require('./routes/adminRoutes');
const userController = require('./controllers/userController');


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

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true, required: true },
  phone: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  tokens: { type: Number, default: 5 },
  jobType: { type: String, default: 'unknown' },
  mustChangePassword: { type: Boolean, default: false }
}, { timestamps: true });
const User = mongoose.models.User || mongoose.model('User', userSchema);

const licenseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  tokens: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  expiresAt: Date
});
const License = mongoose.models.License || mongoose.model('License', licenseSchema);

const kbSchema = new mongoose.Schema({
  title: String,
  content: String,
  category: String,
  subCategory: String,
  tags: [String]
});
const KnowledgeBase = mongoose.models.KnowledgeBase || mongoose.model('KnowledgeBase', kbSchema);

const chatLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  botType: { type: String, default: 'General' },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  reference: { type: String },
  licenseUsed: { type: String },
  isFallbackResponse: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});
const ChatLog = mongoose.models.ChatLog || mongoose.model('ChatLog', chatLogSchema);

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
// 🛡️ تنظیمات قلمرو ربات‌ها (BOT SCOPES)
// ==========================================
const BOT_SCOPES = {
    bee: {
        title: "زنبور عسل",
        allowed: "کندو، ملکه، عسل، موم، ژل رویال، بیماری‌های زنبور، گرده، زنبورستان",
        forbidden: "سگ، گربه، دام، طیور، اسب، ماهی"
    },
    dog: {
        title: "سگ‌ها",
        allowed: "سگ، توله، نژادها، واکسن سگ، پاروا، دیستمپر، تربیت سگ",
        forbidden: "زنبور، گربه (مگر مرتبط با سگ)، دام بزرگ، پرندگان"
    },
    cat: {
        title: "گربه‌ها",
        allowed: "گربه، بچه گربه، واکسن، تغذیه گربه، ریزش مو، عقیم‌سازی",
        forbidden: "سگ، زنبور، اسب، گاو"
    },
    cow: {
        title: "دام بزرگ (گاو)",
        allowed: "گاو، گوساله، شیردهی، ورم پستان، تب برفکی، تغذیه دام",
        forbidden: "حیوانات خانگی، زنبور، ماهی"
    },
    horse: {
        title: "اسب و تک‌سمیان",
        allowed: "اسب، کره اسب، لنگش، قولنج، نعل‌بندی، تغذیه اسب",
        forbidden: "زنبور، ماهی، طیور"
    },
    poultry: {
        title: "طیور صنعتی",
        allowed: "مرغ، جوجه، تخم‌گذار، گوشتی، نیوکاسل، آنفولانزا، سالن مرغداری",
        forbidden: "سگ، گربه، دام بزرگ"
    },
    fish: {
        title: "آبزیان",
        allowed: "ماهی، قزل‌آلا، کپور، آکواریوم، کیفیت آب، بیماری آبزیان",
        forbidden: "حیوانات خشکی‌زی، زنبور"
    },
    general: {
        title: "دامپزشکی عمومی",
        allowed: "تمامی حیوانات",
        forbidden: "سیاست، ورزش، ارز، برنامه‌نویسی"
    }
};


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

app.get('/', (req, res) => res.send('<h1>✅ Iran Vet AI Backend is Running!</h1>'));

// 1️⃣ احراز هویت (Auth)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'ایمیل تکراری است' });
    
    const newUser = await User.create({ fullName, email, phone, password, tokens: 5 });
    
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


// 2️⃣ چت هوشمند (RAG + License + Fallback + Strict Scopes) 🧠✅✅
app.post('/api/chat', authenticateToken, async (req, res) => {
  try {
    const { message, botType, licenseCode } = req.body; 
    const userId = req.user.id;
    let user = await User.findById(userId);

    // --- گام صفر: بررسی سلام ---
    const greetings = ['سلام', 'درود', 'خسته نباشید', 'چطوری', 'خوبی', 'صبح بخیر', 'شب بخیر', 'hi', 'hello'];
    const isGreeting = greetings.some(g => message.trim().toLowerCase().startsWith(g)) && message.length < 30;

    if (isGreeting) {
        return res.json({ 
            response: `سلام! من دستیار هوشمند ${BOT_SCOPES[botType]?.title || 'دامپزشکی'} هستم. چطور می‌توانم کمک کنم؟`, 
            remainingTokens: user.tokens, 
            isFallback: false 
        });
    }

    // --- گام یک: بررسی اعتبار ---
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

    // --- گام دو: جستجو در دیتابیس (RAG) ---
    const relatedDocs = await KnowledgeBase.find({
        category: botType,
        content: { $regex: message, $options: 'i' }
    }).limit(3);

    let systemPrompt = "";
    let isFallback = false;
    let referenceText = "";
    let shouldDeductToken = true; 

    // دریافت تنظیمات اسکوپ ربات
    const scope = BOT_SCOPES[botType] || BOT_SCOPES.general;

    if (relatedDocs.length > 0) {
        // ✅ اطلاعات در دیتابیس هست
        const contextData = relatedDocs.map(doc => doc.content).join("\n---\n");
        referenceText = relatedDocs.map(doc => doc.title).join(", ");
        
        systemPrompt = `
            شما متخصص "${scope.title}" هستید.
            فقط از اطلاعات زیر استفاده کن و پاسخ بده:
            ${contextData}
        `;
    } else {
        // ⚠️ اطلاعات نیست (Fallback) -> فعال کردن گاردریل سخت‌گیرانه
        isFallback = true;
        referenceText = "دانش عمومی هوش مصنوعی";
        
        systemPrompt = `
            🔴 دستورالعمل امنیتی (STRICT MODE):
            
            تو فقط متخصص "${scope.title}" هستی.
            
            1. موضوعات مجاز: ${scope.allowed}
            2. موضوعات ممنوع: ${scope.forbidden}، سیاست، ورزش، تکنولوژی و هر چیزی غیر از ${scope.title}.
            
            وظیفه:
            - اگر سوال درباره "${scope.title}" است: علمی و دقیق پاسخ بده.
            - اگر سوال درباره "${scope.forbidden}" یا موارد نامرتبط است: فقط بگو "OUT_OF_SCOPE".
        `;
    }

    // --- گام سه: ارسال به OpenAI ---
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
        ],
        temperature: isFallback ? 0.3 : 0.2,
    });

    let aiAnswer = response.choices[0].message.content;

    // --- گام چهار: پردازش پاسخ ---
    if (aiAnswer.includes("OUT_OF_SCOPE")) {
        aiAnswer = `⛔ من ربات تخصصی **${scope.title}** هستم و صلاحیت پاسخگویی به سوالات مربوط به سایر حیوانات یا موضوعات متفرقه را ندارم. لطفاً سوال مرتبط بپرسید.`;
        shouldDeductToken = false; 
        isFallback = false; 
    } 
    else if (isFallback) {
        const warningStart = "⚠️ **توجه:** این پاسخ بر اساس دانش عمومی هوش مصنوعی است و هنوز در دیتابیس اختصاصی ما تایید نشده است.\n\n";
        const warningEnd = "\n\n🔴 **هشدار:** لطفاً پیش از هرگونه اقدام درمانی، با دامپزشک مشورت کنید.";
        aiAnswer = warningStart + aiAnswer + warningEnd;
    }

    // --- گام پنج: کسر اعتبار ---
    if (shouldDeductToken) {
        if (useUserTokens) {
            user.tokens -= 1;
            await user.save();
        } else if (activeLicense) {
            activeLicense.tokens -= 1;
            await activeLicense.save();
        }
    }

    // --- گام شش: ذخیره لاگ ---
    await ChatLog.create({
        user: userId,
        botType: botType,
        question: message,
        answer: aiAnswer,
        reference: referenceText,
        licenseUsed: licenseCode || 'UserTokens',
        isFallbackResponse: isFallback && shouldDeductToken
    });

    res.json({ 
        response: aiAnswer, 
        remainingTokens: useUserTokens ? user.tokens : (activeLicense ? activeLicense.tokens : 0),
        isFallback 
    });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ message: 'خطا در پردازش هوش مصنوعی' });
  }
});


// 3️⃣ تاریخچه چت
app.get('/api/chat/history', authenticateToken, async (req, res) => {
    try {
        const history = await ChatLog.find({ user: req.user.id }).sort({ timestamp: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'خطا در دریافت تاریخچه' });
    }
});


// 4️⃣ سیستم تیکت
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

app.get('/api/tickets/:id', authenticateToken, async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);
    if (ticket.user.toString() !== req.user.id) return res.status(403).json({ message: 'دسترسی ندارید' });
    res.json(ticket);
});

app.post('/api/tickets/:id/reply', authenticateToken, async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);
    ticket.messages.push({ sender: 'user', text: req.body.text });
    ticket.status = 'open';
    await ticket.save();
    res.json({ message: 'پاسخ ارسال شد' });
});


// 5️⃣ نوتیفیکیشن‌ها
app.get('/api/notifications', authenticateToken, async (req, res) => {
    const notifs = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notifs);
});


// ==========================================
// 🔥 روت ویژه: وارد کردن دیتابیس زنبور (بدون ترمینال)
// ==========================================
app.get('/api/setup/import-bee', async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'data', 'bee_data.csv');
        
        // 1. چک کردن وجود فایل
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: '❌ فایل bee_data.csv در پوشه backend/data پیدا نشد.' });
        }

        // 2. خواندن فایل
        const data = fs.readFileSync(filePath, 'utf8');
        const rows = data.split('\n').slice(1); // حذف هدر
        let count = 0;

        for (const row of rows) {
            if (!row.trim()) continue;
            
            // پارس کردن ساده CSV
            // فرض می‌کنیم ستون‌ها با ویرگول جدا شدند و ترتیبشان مثل فایل شماست:
            // نام بیماری، دسته‌بندی، علائم، درمان، توضیحات
            
            // نکته: اگر در متن ویرگول باشد، این روش ساده خطا می‌دهد. برای CSV پیچیده باید از کتابخانه csv-parser استفاده کرد.
            // اما چون خواستی بدون ترمینال باشد، این نسخه ساده را می‌گذارم:
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
                        category: 'bee', // 🐝 اختصاصی زنبور
                        subCategory,
                        content,
                        tags: ['bee', 'disease', subCategory]
                    });
                    count++;
                }
            }
        }

        res.json({ 
            message: `✅ عملیات موفق! ${count} رکورد جدید به دیتابیس زنبور اضافه شد.`,
            status: 'success'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'خطا در ایمپورت: ' + error.message });
    }
});


// روت‌های ادمین
app.use('/api/admin', adminRoutes);


// --- روت‌های پروفایل کاربر (جدید) ---
app.put('/api/users/profile', authenticateToken, userController.updateProfile);
app.get('/api/users/profile', authenticateToken, userController.getProfile);


// اجرای سرور
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
