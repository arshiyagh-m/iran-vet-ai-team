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
const adminRoutes = require('./routes/adminRoutes');
const Ticket = require('./models/Ticket'); 

const app = express();
const PORT = process.env.PORT || 3000; 

// تنظیمات
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

// --- ۱. اتصال به دیتابیس (با لاگ دقیق) ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Successfully');
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

// --- ۲. روت‌های تست (اصلاح شده برای حل مشکل دکمه تست) ---

// الف: وقتی آدرس سایت رو توی مرورگر میزنی
app.get('/', (req, res) => {
    res.send('<h1>✅ Server is Running Successfully!</h1><p>Iran Vet AI Backend</p>');
});

// ب: وقتی دکمه "تست اتصال" رو توی فرانت‌اند میزنی (این همون تیکه گمشده بود!)
app.get('/api', (req, res) => {
    res.status(200).json({ message: '✅ ارتباط با سرور برقرار است (API Ready)' });
});


// --- ۳. میدل‌ور احراز هویت ---
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'دسترسی غیرمجاز' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'توکن نامعتبر است' });
    req.user = user;
    next();
  });
};

// --- ۴. روت‌های احراز هویت ---

// ✅ ثبت نام
app.post('/api/auth/register', async (req, res) => {
  console.log("📩 درخواست ثبت نام دریافت شد:", req.body); 

  try {
    const { fullName, email, phone, password } = req.body;

    // الف: چک کردن فیلدها
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ message: 'لطفاً تمام فیلدها را پر کنید.' });
    }

    // ب: چک کردن ایمیل تکراری
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.log("⛔ تکراری: ایمیل " + email);
      return res.status(400).json({ message: 'این ایمیل قبلاً ثبت شده است.' });
    }

    // ج: چک کردن موبایل تکراری
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      console.log("⛔ تکراری: موبایل " + phone);
      return res.status(400).json({ message: 'این شماره موبایل قبلاً ثبت شده است.' });
    }

    // د: ساخت کاربر
    const newUser = new User({
      fullName,
      email,
      phone,
      password, 
      role: 'user',
      tokens: 5
    });

    await newUser.save();
    console.log("✅ کاربر جدید ساخته شد:", email);
    
    res.status(201).json({ message: 'ثبت نام با موفقیت انجام شد' });

  } catch (error) {
    console.error("❌ خطا در ثبت نام:", error);
    res.status(500).json({ message: `خطای سرور: ${error.message}` });
  }
});

// ✅ لاگین
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email, password });

    if (user) {
      if (user.tokens === undefined) user.tokens = 5; 
      
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
      
      console.log("✅ ورود موفق:", email);
      res.json({ 
        token, 
        user: { 
          name: user.fullName, 
          role: user.role, 
          tokens: user.tokens 
        } 
      });
    } else {
      console.log("⛔ ورود ناموفق:", email);
      res.status(401).json({ message: 'ایمیل یا رمز عبور اشتباه است' });
    }
  } catch (error) {
    console.error("❌ خطا در لاگین:", error);
    res.status(500).json({ message: 'خطای سرور در ورود' });
  }
});

// --- ۵. روت‌های ادمین ---
app.use('/api/admin', adminRoutes);

// --- ۶. هوش مصنوعی ---
app.post('/api/chat/message', authenticateToken, async (req, res) => {
  const { prompt } = req.body;

  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) return res.status(404).json({ reply: "کاربر یافت نشد", reference: "Error" });

    if (currentUser.tokens <= 0 && currentUser.role !== 'admin') {
        return res.status(403).json({ 
            reply: "اعتبار توکن شما تمام شده است.",
            reference: "System"
        });
    }

    const contextDocs = await KnowledgeBase.find({
      $or: [
        { title: { $regex: prompt, $options: 'i' } },
        { content: { $regex: prompt, $options: 'i' } },
        { tags: { $in: [new RegExp(prompt, 'i')] } }
      ]
    }).limit(3);

    let contextText = "";
    let reference = "AI Knowledge";
    
    if (contextDocs.length > 0) {
      contextText = contextDocs.map(d => `${d.title}: ${d.content}`).join("\n");
      reference = `منبع: ${contextDocs[0].sourceFile} - ${contextDocs[0].title}`;
    }

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "شما دستیار دامپزشکی هستید." },
        { role: "system", content: `Context:\n${contextText}` },
        { role: "user", content: prompt }
      ],
      model: "gpt-3.5-turbo",
    });

    const aiReply = completion.choices[0].message.content;

    await ChatLog.create({
        user: req.user.id,
        question: prompt,
        answer: aiReply,
        reference: reference,
        isFallbackResponse: contextDocs.length === 0
    });

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

// --- ۷. سیستم تیکت پشتیبانی ---

// ارسال تیکت جدید
app.post('/api/tickets', authenticateToken, async (req, res) => {
  try {
    const { subject, message } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ message: 'موضوع و متن پیام الزامی است.' });
    }

    const newTicket = new Ticket({
      user: req.user.id,
      subject,
      message,
      status: 'open'
    });

    await newTicket.save();
    res.status(201).json({ message: 'تیکت شما با موفقیت ثبت شد.' });

  } catch (error) {
    res.status(500).json({ message: 'خطا در ثبت تیکت' });
  }
});

// دریافت لیست تیکت‌های کاربر
app.get('/api/tickets', authenticateToken, async (req, res) => {
  try {
    // تیکت‌های خود کاربر رو پیدا کن و بر اساس تاریخ (جدیدترین اول) مرتب کن
    const tickets = await Ticket.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'خطا در دریافت تیکت‌ها' });
  }
});


// استارت
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
