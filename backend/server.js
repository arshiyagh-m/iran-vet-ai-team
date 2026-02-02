require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const OpenAI = require('openai');

// ایمپورت مدل‌ها و ابزارها
const User = require('./models/User');
const KnowledgeBase = require('./models/KnowledgeBase');
const importData = require('./importData'); // همان فایل ایمپورتر که قبلاً ساختی

const app = express();
const PORT = process.env.PORT || 5000;

// تنظیمات امنیتی و پارسر
app.use(cors());
app.use(express.json());

// تنظیم OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

// --- ۱. اتصال به دیتابیس و اجرای ایمپورتر ---
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    // هر بار که سرور روشن میشه، فایل‌های اکسل رو چک میکنه
    await importData();
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

// --- ۳. روت‌های کاربری (Auth) ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  // نکته: در نسخه نهایی باید پسوردها هش شده باشند (bcrypt)
  const user = await User.findOne({ email, password });

  if (user) {
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user: { name: user.name, role: user.role, tokens: user.tokens } });
  } else {
    res.status(401).json({ message: 'ایمیل یا رمز عبور اشتباه است' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.json({ message: 'ثبت نام موفقیت‌آمیز بود' });
  } catch (error) {
    res.status(500).json({ message: 'خطا در ثبت نام' });
  }
});

// --- ۴. روت هوش مصنوعی (RAG: جستجو + پاسخ) ---
app.post('/api/chat/message', authenticateToken, async (req, res) => {
  const { prompt } = req.body;

  try {
    // الف: اول در دیتابیس خودمان جستجو کن (RAG)
    // جستجوی ساده متنی (Regex)
    const contextDocs = await KnowledgeBase.find({
      $or: [
        { title: { $regex: prompt, $options: 'i' } },
        { content: { $regex: prompt, $options: 'i' } },
        { tags: { $in: [new RegExp(prompt, 'i')] } }
      ]
    }).limit(3);

    // ساخت کانتکست برای هوش مصنوعی
    let contextText = "";
    let reference = "General Knowledge";
    
    if (contextDocs.length > 0) {
      contextText = contextDocs.map(d => `${d.title}: ${d.content}`).join("\n");
      reference = `برگرفته از: ${contextDocs[0].sourceFile} - ${contextDocs[0].title}`;
    }

    // ب: ارسال به OpenAI
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "شما یک دستیار هوشمند دامپزشکی هستید. با استفاده از اطلاعات زیر به سوال کاربر پاسخ دهید." },
        { role: "system", content: `اطلاعات علمی موجود:\n${contextText}` },
        { role: "user", content: prompt }
      ],
      model: "gpt-3.5-turbo",
    });

    const aiReply = completion.choices[0].message.content;

    // ج: کسر توکن از کاربر (اختیاری)
    // await User.findByIdAndUpdate(req.user.id, { $inc: { tokens: -1 } });

    res.json({ reply: aiReply, reference });

  } catch (error) {
    console.error("AI Error:", error);
    // فال‌بک (اگر کلید OpenAI کار نکرد یا تمام شد)
    res.json({ 
      reply: "سیستم هوشمند موقتاً در دسترس نیست، اما جستجوی دیتابیس انجام شد.", 
      reference: "خطای سرور" 
    });
  }
});

// --- ۵. روت‌های ادمین ---
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const users = await User.find({}, '-password'); // پسورد را برنگردان
  res.json(users);
});

// استارت سرور
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
