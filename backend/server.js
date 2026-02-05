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
const Notification = require('./models/Notification');

const app = express();
const PORT = process.env.PORT || 3000; 

// تنظیمات
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

// --- ۱. اتصال به دیتابیس ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Successfully');
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

// --- ۲. روت‌های تست و سلامت سرور ---
app.get('/', (req, res) => {
    res.send('<h1>✅ Server is Running Successfully!</h1><p>Iran Vet AI Backend</p>');
});

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

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ message: 'لطفاً تمام فیلدها را پر کنید.' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'این ایمیل قبلاً ثبت شده است.' });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: 'این شماره موبایل قبلاً ثبت شده است.' });
    }

    const newUser = new User({
      fullName,
      email,
      phone,
      password, 
      role: 'user',
      tokens: 5,
      mustChangePassword: false
    });

    await newUser.save();
    
    // ارسال نوتیفیکیشن خوش‌آمدگویی
    await Notification.create({
      user: newUser._id,
      title: 'خوش آمدید! 🎉',
      message: 'حساب کاربری شما با موفقیت ساخته شد. از بخش چت هوشمند استفاده کنید.',
      link: '/dashboard/profile'
    });

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
  const userAgent = req.headers['user-agent'] || 'دستگاه ناشناس';
  
  try {
    const user = await User.findOne({ email, password });

    if (user) {
      if (user.tokens === undefined) user.tokens = 5; 
      
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
      
      // ثبت نوتیفیکیشن ورود
      const loginTime = new Date().toLocaleString('fa-IR');
      await Notification.create({
        user: user._id,
        title: 'هشدار امنیتی: ورود به حساب',
        message: `ورود موفق در تاریخ ${loginTime} با دستگاه: ${userAgent}`,
        link: '/dashboard/profile'
      });

      console.log("✅ ورود موفق:", email);
      res.json({ 
        token, 
        user: { 
          name: user.fullName, 
          role: user.role, 
          tokens: user.tokens,
          jobType: user.jobType,
          mustChangePassword: user.mustChangePassword
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

// ✅ تغییر رمز عبور
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (user.password !== currentPassword) {
      return res.status(400).json({ message: 'رمز عبور فعلی اشتباه است' });
    }

    user.password = newPassword;
    user.mustChangePassword = false; // غیرفعال کردن اجبار تغییر رمز
    await user.save();

    // نوتیفیکیشن تغییر رمز
    await Notification.create({
      user: user._id,
      title: 'تغییر رمز عبور',
      message: 'رمز عبور شما با موفقیت تغییر کرد.',
      isRead: false
    });

    res.json({ message: 'رمز عبور با موفقیت تغییر کرد' });
  } catch (error) {
    res.status(500).json({ message: 'خطا در تغییر رمز' });
  }
});

// ✅ ویرایش پروفایل
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, email, phone, jobType } = req.body;
    const userId = req.user.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName, email, phone, jobType },
      { new: true } 
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'کاربر یافت نشد' });
    }

    res.json({ 
      message: 'پروفایل با موفقیت آپدیت شد',
      user: {
        name: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        tokens: updatedUser.tokens,
        jobType: updatedUser.jobType
      }
    });

  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: 'خطا در ویرایش اطلاعات' });
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

// --- ۷. سیستم تیکت پشتیبانی (چت) ---

// ثبت تیکت جدید
app.post('/api/tickets', authenticateToken, async (req, res) => {
  try {
    const { subject, message } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ message: 'موضوع و متن پیام الزامی است.' });
    }

    const newTicket = new Ticket({
      user: req.user.id,
      subject,
      status: 'open',
      messages: [{ sender: 'user', text: message }]
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
    const tickets = await Ticket.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'خطا در دریافت تیکت‌ها' });
  }
});

// دریافت جزئیات یک تیکت
app.get('/api/tickets/:id', authenticateToken, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'تیکت یافت نشد' });

    // فقط کاربر صاحب تیکت یا ادمین می‌تونن ببینن
    if (ticket.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'خطا' });
  }
});

// پاسخ دادن به تیکت (Reply)
app.post('/api/tickets/:id/reply', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    const senderRole = req.user.role === 'admin' ? 'admin' : 'user';

    ticket.messages.push({ sender: senderRole, text });
    
    // اگر ادمین پاسخ داد، به کاربر نوتیفیکیشن بده
    if (senderRole === 'admin') {
        ticket.status = 'pending'; // در انتظار مشاهده کاربر
        
        await Notification.create({
            user: ticket.user,
            title: 'پاسخ جدید پشتیبانی',
            message: `به تیکت "${ticket.subject}" پاسخ داده شد.`,
            link: `/dashboard/tickets/${ticket._id}`
        });
    } else {
        ticket.status = 'open'; // کاربر پاسخ داده، باز شود
    }

    await ticket.save();
    res.json({ message: 'پاسخ ارسال شد', ticket });
  } catch (error) {
    res.status(500).json({ message: 'خطا' });
  }
});

// --- ۸. مدیریت نوتیفیکیشن‌ها ---

// دریافت لیست
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const notifs = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notifs);
  } catch (error) { res.status(500).json({ message: 'Error' }); }
});

// خواندن نوتیفیکیشن
app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ message: 'Error' }); }
});

// استارت سرور
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
