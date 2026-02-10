const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// 🔥 دریافت مدل‌ها از mongoose (چون در server.js تعریف شده‌اند)
const User = mongoose.model('User');
const ChatLog = mongoose.model('ChatLog');
const Ticket = mongoose.model('Ticket');
const Transaction = mongoose.model('Transaction');
// اگر مدل KnowledgeBase استفاده نمی‌شود، نیازی به خط زیر نیست، اما بودنش ضرر ندارد
const KnowledgeBase = mongoose.models.KnowledgeBase || mongoose.model('KnowledgeBase'); 

// 🛡️ میدل‌ور محافظتی (فقط ادمین)
// نکته: این تابع فرض می‌کند req.user قبلاً توسط authenticateToken پر شده است
const protectAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'دسترسی غیرمجاز: شما مدیر نیستید.' });
    }
};

// اعمال محافظت روی تمام روت‌های این فایل
router.use(protectAdmin);

// ==========================================
// 1️⃣ داشبورد (آمار کلی)
// ==========================================
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalChats = await ChatLog.countDocuments();
        const fallbackChats = await ChatLog.countDocuments({ isFallbackResponse: true });
        
        // محاسبه درآمد کل
        const transactions = await Transaction.find();
        const totalRevenue = transactions.reduce((acc, curr) => acc + curr.amount, 0);

        res.json({
            users: totalUsers,
            chats: totalChats,
            revenue: totalRevenue,
            fallbackRate: totalChats > 0 ? Math.round((fallbackChats / totalChats) * 100) : 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'خطا در دریافت آمار' });
    }
});

// ==========================================
// 2️⃣ چت‌ها (مانیتورینگ)
// ==========================================
router.get('/chat-logs', async (req, res) => {
    try {
        const { filter } = req.query; 

        let query = {};
        if (filter === 'fallback') query.isFallbackResponse = true; // فقط پاسخ‌های هوش مصنوعی (قرمز)
        if (filter === 'database') query.isFallbackResponse = false; // فقط پاسخ‌های دیتابیس (سبز)

        const logs = await ChatLog.find(query)
            .populate('user', 'fullName email phone') // اطلاعات کاربر را بچسبان
            .sort({ timestamp: -1 }) // جدیدترین‌ها اول
            .limit(100);

        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'خطا در دریافت لاگ چت‌ها' });
    }
});

// ==========================================
// 3️⃣ مدیریت کاربران
// ==========================================
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'خطا در دریافت کاربران' });
    }
});

// تغییر وضعیت بن کاربر
router.post('/users/ban', async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'کاربر یافت نشد' });

        user.role = user.role === 'banned' ? 'user' : 'banned';
        await user.save();
        res.json({ message: `وضعیت کاربر تغییر کرد: ${user.role}` });
    } catch (error) {
        res.status(500).json({ message: 'خطا در تغییر وضعیت' });
    }
});

// شارژ دستی توکن کاربر
router.post('/users/charge', async (req, res) => {
    try {
        const { userId, tokens } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'کاربر یافت نشد' });

        user.tokens = (user.tokens || 0) + parseInt(tokens);
        await user.save();
        
        // ثبت تراکنش صوری (جهت گزارش‌گیری)
        await Transaction.create({
            user: userId,
            admin: req.user._id,
            amount: 0, 
            tokens: parseInt(tokens),
            description: 'شارژ دستی توسط مدیریت'
        });

        res.json({ message: 'شارژ با موفقیت انجام شد', newBalance: user.tokens });
    } catch (error) {
        res.status(500).json({ message: 'خطا در شارژ حساب' });
    }
});

// ==========================================
// 4️⃣ مدیریت تیکت‌ها
// ==========================================
router.get('/tickets', async (req, res) => {
    try {
        const tickets = await Ticket.find()
            .populate('user', 'fullName email')
            .sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'خطا در دریافت تیکت‌ها' });
    }
});

router.post('/tickets/:id/reply', async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'تیکت یافت نشد' });

        ticket.messages.push({ sender: 'admin', text: req.body.text });
        ticket.status = 'answered';
        await ticket.save();
        res.json({ message: 'پاسخ ارسال شد' });
    } catch (error) {
        res.status(500).json({ message: 'خطا در ارسال پاسخ' });
    }
});

// ==========================================
// 5️⃣ گزارشات مالی
// ==========================================
router.get('/finance', async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('user', 'fullName')
            .sort({ date: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'خطا در دریافت تراکنش‌ها' });
    }
});

module.exports = router;
