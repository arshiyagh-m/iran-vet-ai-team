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

// 4. ChatLog Model
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

// 5. Ticket Model
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

// 6. Notification Model
const notifSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String, message: String, link: String, isRead: { type: Boolean, default: false }
}, { timestamps: true });
const Notification = mongoose.models.Notification || mongoose.model('Notification', notifSchema);

// 7. Transaction Model
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
// 2️⃣ چت هوشمند (RAG + History Memory) 🧠💾
// ------------------------------------------
app.post('/api/chat', authenticateToken, async (req, res) => {
  try {
    const { message, botType, licenseCode } = req.body; 
    const user = req.user;

    // الف) پاسخ به سلام (بدون هزینه)
    const greetings = ['سلام', 'درود', 'خسته نباشید', 'چطوری', 'خوبی', 'صبح بخیر', 'شب بخیر', 'hi', 'hello'];
    const isGreeting = greetings.some(g => message.trim().toLowerCase().startsWith(g)) && message.length < 30;

    if (isGreeting) {
        const botName = BOT_TITLES[botType] || 'دامپزشکی';
        return res.json({ 
            response: `سلام! من دستیار هوشمند ${botName} هستم. لطفاً علائم و مشکل حیوان را توضیح دهید تا بررسی کنم.`, 
            remainingTokens: user.tokens, 
            isFallback: false 
        });
    }

    // ب) بررسی اعتبار
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

    // 🔥🔥🔥 پ) دریافت ۵ پیام آخر (Memory) 🔥🔥🔥
    // این بخش باعث می‌شود ربات پیام‌های قبلی را به یاد بیاورد
    const historyLogs = await ChatLog.find({ user: user._id, botType })
        .sort({ timestamp: -1 }) // جدیدترین‌ها اول
        .limit(5); // ۵ تعامل آخر (۱۰ پیام: ۵ سوال + ۵ جواب)
    
    // تبدیل به فرمت OpenAI و مرتب‌سازی از قدیمی به جدید
    const historyMessages = historyLogs.reverse().flatMap(log => [
        { role: "user", content: log.question },
        { role: "assistant", content: log.answer }
    ]);

    // ت) جستجو در دیتابیس (RAG - Keyword Search)
    const stopWords = ['اقا', 'آقا', 'من', 'تو', 'ما', 'شما', 'است', 'که', 'در', 'با', 'از', 'به', 'را', 'این', 'آن', 'زنبور', 'عسل', 'دارم', 'داره', 'هست', 'اره', 'آره', 'بله', 'خیر', 'نه', 'ندارم', 'ولی']; 
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

    // ⛔ لاجیک هوشمند: (Search vs Memory)
    // اگر دیتابیس خالی بود اما کاربر دارد به سوال قبلی جواب می‌دهد (تاریخچه داریم)، نباید خطا بدهیم.
    const isFollowUp = historyMessages.length > 0 && relatedDocs.length === 0;

    if (relatedDocs.length === 0 && !isFollowUp) {
        // حالت ۱: نه دیتایی هست، نه حافظه‌ای (بحث جدید و نامربوط)
        aiAnswer = "متاسفانه با این کلمات، اطلاعاتی در پایگاه دانش تخصصی یافت نشد. لطفاً علائم را کامل‌تر توضیح دهید.";
        referenceText = "بدون منبع";
        shouldDeductToken = false; 
    } else {
        // حالت ۲: یا دیتای جدید داریم، یا داریم از حافظه (History) استفاده می‌کنیم
        shouldDeductToken = true;
        
        const contextData = relatedDocs.map(doc => doc.content).join("\n---\n");
        referenceText = relatedDocs.length > 0 ? relatedDocs.map(doc => doc.title).join(", ") : "حافظه گفتگو";
        const botTitle = BOT_TITLES[botType] || botType;

        // 🔥 پرامپت دکتر با حافظه ۵ تایی 🔥
        const systemPrompt = `
            شما یک "دامپزشک متخصص" و هوشمند در زمینه "${botTitle}" هستید.
            
            منابع دانش جدید (CONTEXT):
            ${contextData ? contextData : "اطلاعات جدیدی یافت نشد، فقط به حافظه گفتگو (History) مراجعه کن."}

            دستورالعمل حیاتی (Diagnosis Protocol):
            1. شما به ۵ پیام آخر گفتگو دسترسی دارید.
            2. اگر کاربر پاسخی کوتاه داد (مثل "بله"، "خیر"، "همینطوره")، آن را در کنار سوال قبلی خودت در History تحلیل کن.
            3. تشخیص بیماری:
               - اگر با ترکیب پاسخ جدید کاربر و اطلاعات قبلی، بیماری قطعی شد -> درمان را کامل توضیح بده.
               - اگر هنوز شک داری -> سوال بعدی را بپرس تا علائم شفاف شود.
            
            4. فقط از اطلاعات CONTEXT و History استفاده کن. دانش عمومی ممنوع.
            5. لحن: دلسوزانه و علمی.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                ...historyMessages, // 👈 تزریق تاریخچه پیام‌های قبلی
                { role: "user", content: message } // پیام جدید
            ],
            temperature: 0.3, 
        });

        aiAnswer = response.choices[0].message.content;
    }

    // ث) کسر اعتبار
    if (shouldDeductToken) {
        if (useUserTokens) {
            user.tokens -= 1;
            await user.save();
        } else if (activeLicense) {
            activeLicense.tokens -= 1;
            await activeLicense.save();
        }
    }

    // ج) ذخیره لاگ
    await ChatLog.create({
        user: user._id,
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
        isFallback: relatedDocs.length === 0 && !isFollowUp
    });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ message: 'خطا در پردازش هوش مصنوعی' });
  }
});


// ------------------------------------------
// 3️⃣ تاریخچه چت (API)
// ------------------------------------------
app.get('/api/chat/history', authenticateToken, async (req, res) => {
    try {
        const history = await ChatLog.find({ user: req.user.id }).sort({ timestamp: -1 });
        res.json(history);
    } catch (error) { res.status(500).json({ message: 'خطا در دریافت تاریخچه' }); }
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
