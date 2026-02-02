const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const SECRET_KEY = 'secret-key-iran-vet-ai'; // در پروژه واقعی ببر توی env

app.use(cors());
app.use(express.json());

// --- ۱. دیتابیس موقت (چون هنوز دیتابیس اصلی وصل نیست) ---
let users = [
  { id: 1, name: 'ارشیا قنبری', email: 'admin@test.com', password: '123', role: 'admin', tokens: 9999 },
  { id: 2, name: 'امین پاشایی', email: 'amin@test.com', password: '123', role: 'admin', tokens: 9999 },
  { id: 3, name: 'کاربر تست', email: 'user@test.com', password: '123', role: 'user', tokens: 10 }
];

// دیتابیس شبیه‌سازی شده بیماری‌ها (برای جلوگیری از توهم)
const diseaseDB = {
  'تب': { reply: 'تب بالا در دام می‌تواند نشانه تب برفکی یا پنومونی باشد. تجویز: پنی‌سیلین و تب‌بر.', ref: 'رفرنس داخلی: پروتکل تب برفکی ص ۴۰' },
  'لنگش': { reply: 'لنگش معمولاً نشانه گندیدگی سم (Foot Rot) است. شستشو با سولفات مس توصیه می‌شود.', ref: 'رفرنس داخلی: کتاب بیماری‌های اندام حرکتی' },
  'اسهال': { reply: 'اسهال در گوساله زیر یک ماه معمولاً ویروسی یا کلی‌باسیلوزی است. مایع‌درمانی فوری الزامی است.', ref: 'رفرنس داخلی: طب داخلی دام بزرگ' }
};

// --- ۲. میدل‌ور احراز هویت (Security) ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- ۳. روت‌های Auth (ورود و ثبت‌نام) ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY);
    res.json({ token, user: { name: user.name, role: user.role, tokens: user.tokens } });
  } else {
    res.status(401).json({ message: 'ایمیل یا رمز عبور اشتباه است' });
  }
});

app.post('/api/auth/register', (req, res) => {
  // اینجا فقط شبیه‌سازی می‌کنیم
  res.json({ message: 'ثبت نام انجام شد' });
});

// --- ۴. روت هوش مصنوعی (Chat) ---
app.post('/api/chat/message', authenticateToken, (req, res) => {
  const { prompt } = req.body;
  
  // شبیه‌سازی تاخیر هوش مصنوعی
  setTimeout(() => {
    // جستجو در دیتابیس (Keyword Search)
    let response = { 
      reply: 'متاسفانه برای این علائم در دیتابیس فعلی اطلاعاتی یافت نشد. لطفاً با دامپزشک تماس بگیرید.', 
      reference: 'سیستم هوشمند' 
    };

    // منطق ساده جستجو
    if (prompt.includes('تب') || prompt.includes('داغ')) response = diseaseDB['تب'];
    else if (prompt.includes('لنگ') || prompt.includes('پا')) response = diseaseDB['لنگش'];
    else if (prompt.includes('اسهال') || prompt.includes('شکم')) response = diseaseDB['اسهال'];

    res.json(response);
  }, 1000);
});

// --- ۵. روت‌های ادمین (Admin) ---
app.get('/api/admin/users', authenticateToken, (req, res) => {
  // فقط ادمین‌ها دسترسی دارند
  if (req.user.role !== 'admin') return res.sendStatus(403);
  res.json(users);
});

// تغییر رمز کاربر توسط ادمین
app.post('/api/admin/reset-password', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  // در واقعیت اینجا دیتابیس آپدیت میشه
  res.json({ message: 'رمز عبور با موفقیت ریست شد' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
