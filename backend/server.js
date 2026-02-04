require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const OpenAI = require('openai');

// --- ایمپورت مدل‌ها ---
const User = require('./models/User');
const KnowledgeBase = require('./models/KnowledgeBase');
const ChatLog = require('./models/ChatLog');
const importData = require('./importData');

// --- ایمپورت روت‌های ادمین ---
const adminRoutes = require('./routes/adminRoutes');

const app = express();
// پورت ۳۰۰۰ معمولاً برای Render بهتر جواب می‌دهد، اما ۵۰۰۰ هم کار می‌کند
const PORT = process.env.PORT || 3000; 

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
    // await importData(); // فعلاً غیرفعال تا سرعت استارت بالا برود
  })
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- ۲. میدل‌ور احراز هویت ---
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

// ✅ اصلاح شده: ثبت نام با اعتبارسنجی دقیق و شماره موبایل
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // الف: چک کردن اینکه همه فیلدها پر شده باشند
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ message: 'لطفاً تمام فیلدها (نام، ایمیل، موبایل و رمز) را پر کنید.' });
    }

    // ب: چک کردن ایمیل تکراری
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'این ایمیل قبلاً ثبت شده است.' });
    }

    // ج: چک کردن شماره موبایل تکراری
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: 'این شماره موبایل قبلاً ثبت شده است.' });
    }

    // د: ساخت کاربر جدید
    const newUser = new User({
      fullName,
      email,
      phone,
      password, // نکته: در نسخه نهایی بهتر است هش شود
      role: 'user', // پیش‌فرض کاربر عادی
      tokens: 5     // ۵ توکن هدیه
    });

    await newUser.save();
    res.status(201).json({ message: 'ثبت نام با موفقیت انجام شد' });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: 'خطای سرور: ' + error.message });
  }
});

// ✅ لاگین
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email, password });

    if (user) {
      // اگر توکن نداشت (کاربر قدیمی)، مقدار ۵ بده
      if (user.tokens === undefined) user.tokens = 5; 
      
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
      
      res.json({ 
        token, 
        user: { 
          name: user.fullName, 
          role: user.role, 
          tokens: user.tokens 
        } 
      });
    } else {
      res.status(401).json({ message: 'ایمیل یا رمز عبور اشتباه است' });
    }
  } catch (error) {
    res.status(500).json({ message: 'خطای سرور در ورود' });
  }
});

// --- ۴. اتصال روت‌های ادمین ---
app.use('/api/admin', adminRoutes);

// --- ۵. هوش مصنوعی (RAG + Log + Token) ---
app.post('/api/chat/message', authenticateToken, async (req, res) => {
  const { prompt } = req.body;

  try {
    // الف: چک کردن موجودی
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) return res.status(404).json({ reply: "کاربر یافت نشد", reference: "Error" });

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
        { role: "system", content: "شما دستیار دامپزشکی هستید. فقط بر اساس اطلاعات داده شده پاسخ دهید." },
        { role: "system", content: `Context:\n${contextText}` },
        { role: "user", content: prompt }
      ],
      model: "gpt-3.5-turbo",
    });

    const aiReply = completion.choices[0].message.content;

    // د: ذخیره لاگ
    await ChatLog.create({
        user: req.user.id,
        question: prompt,
        answer: aiReply,
        reference: reference,
        isFallbackResponse: contextDocs.length === 0
    });

    // ه: کسر توکن
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

// روت صفحه اصلی (برای تست سالم بودن سرور در Render)
app.get('/', (req, res) => {
    res.send('<h1>✅ Server is Running Successfully!</h1><p>Iran Vet AI Backend</p>');
});

// استارت
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
