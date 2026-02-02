require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const OpenAI = require('openai');

// --- ایمپورت مدل‌ها ---
const User = require('./models/User');
const KnowledgeBase = require('./models/KnowledgeBase');
const ChatLog = require('./models/ChatLog'); // ✅ اضافه شد برای ذخیره تاریخچه
const importData = require('./importData');

// --- ایمپورت روت‌های ادمین ---
const adminRoutes = require('./routes/adminRoutes'); // ✅ اضافه شد

const app = express();
const PORT = process.env.PORT || 5000;

// تنظیمات
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

// --- ۱. اتصال به دیتابیس ---
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    await importData(); // سینک کردن فایل‌های اکسل
  })
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- ۲. میدل‌ور احراز هویت (ساده) ---
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'دسترسی غیرمجاز' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'توکن نامعتبر است' });
    req.user = user;
    next();
  });
};

// --- ۳. روت‌های احراز هویت (Login/Register) ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  // نکته: در آینده حتما از bcrypt استفاده کن
  const user = await User.findOne({ email, password });

  if (user) {
    // اگر توکن null بود، پیشفرض ۵ بذار
    if (user.tokens === undefined) user.tokens = 5; 
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user: { name: user.fullName, role: user.role, tokens: user.tokens } });
  } else {
    res.status(401).json({ message: 'ایمیل یا رمز عبور اشتباه است' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    // چک کردن تکراری نبودن ایمیل
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) return res.status(400).json({ message: 'این ایمیل قبلاً ثبت شده است' });

    const newUser = new User(req.body);
    await newUser.save();
    res.json({ message: 'ثبت نام موفقیت‌آمیز بود' });
  } catch (error) {
    res.status(500).json({ message: 'خطا در ثبت نام: ' + error.message });
  }
});

// --- ۴. اتصال روت‌های ادمین ---
// تمام درخواست‌هایی که با /api/admin شروع می‌شوند میرن به فایل adminRoutes
app.use('/api/admin', adminRoutes); // ✅ این خط پنل ادمین را زنده می‌کند

// --- ۵. هوش مصنوعی (RAG + Log + Token) ---
app.post('/api/chat/message', authenticateToken, async (req, res) => {
  const { prompt } = req.body;

  try {
    // الف: چک کردن موجودی توکن کاربر
    const currentUser = await User.findById(req.user.id);
    if (currentUser.tokens <= 0 && currentUser.role !== 'admin') {
        return res.status(403).json({ 
            reply: "اعتبار توکن شما تمام شده است. لطفاً اشتراک تهیه کنید.",
            reference: "System"
        });
    }

    // ب: جستجو در دیتابیس (RAG)
    const contextDocs = await KnowledgeBase.find({
      $or: [
        { title: { $regex: prompt, $options: 'i' } },
        { content: { $regex: prompt, $options: 'i' } },
        { tags: { $in: [new RegExp(prompt, 'i')] } }
      ]
    }).limit(3);

    let contextText = "";
    let reference = "General AI Knowledge";
    
    if (contextDocs.length > 0) {
      contextText = contextDocs.map(d => `${d.title}: ${d.content}`).join("\n");
      reference = `منبع داخلی: ${contextDocs[0].sourceFile} - ${contextDocs[0].title}`;
    }

    // ج: ارسال به OpenAI
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "شما دستیار دامپزشکی هستید. فقط بر اساس اطلاعات داده شده پاسخ دهید. اگر اطلاعات کافی نیست، بگویید." },
        { role: "system", content: `Context:\n${contextText}` },
        { role: "user", content: prompt }
      ],
      model: "gpt-3.5-turbo",
    });

    const aiReply = completion.choices[0].message.content;

    // د: ذخیره در ChatLog (برای نمایش در پنل ادمین) ✅
    await ChatLog.create({
        user: req.user.id,
        question: prompt,
        answer: aiReply,
        reference: reference,
        isFallbackResponse: contextDocs.length === 0 // اگر دیتابیس خالی بود true میشه
    });

    // ه: کسر توکن (برای کاربران غیر ادمین) ✅
    if (currentUser.role !== 'admin') {
        await User.findByIdAndUpdate(req.user.id, { $inc: { tokens: -1 } });
    }

    res.json({ reply: aiReply, reference });

  } catch (error) {
    console.error("AI Error:", error);
    res.json({ 
      reply: "متاسفانه سیستم موقتاً در دسترس نیست.", 
      reference: "Server Error" 
    });
  }
});

// روت صفحه اصلی (برای تست سالم بودن سرور)
app.get('/', (req, res) => {
    res.send('<h1>✅ Server is Running Successfully!</h1><p>Iran Vet AI Backend</p>');
});

// استارت
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
