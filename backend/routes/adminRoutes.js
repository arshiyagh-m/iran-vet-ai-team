const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// فراخوانی مدل‌ها (که در server.js تعریف شده‌اند)
const User = mongoose.model('User');
const ChatLog = mongoose.model('ChatLog');
const Ticket = mongoose.model('Ticket');
const Transaction = mongoose.model('Transaction');
const KnowledgeBase = mongoose.model('KnowledgeBase');

// 🛡️ میدل‌ور محافظتی (فقط ادمین)
const protectAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'دسترسی غیرمجاز: فقط مدیران' });
    }
};

// اعمال محافظت روی تمام روت‌های پایین
router.use(protectAdmin);

// ==========================================
// 1️⃣ داشبورد (آمار کلی)
// ==========================================
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalChats = await ChatLog.countDocuments();
        const fallbackChats = await ChatLog.countDocuments({ isFallbackResponse: true });
        
        // محاسبه درآمد
        const transactions = await Transaction.find();
        const totalRevenue = transactions.reduce((acc, curr) => acc + curr.amount, 0);

        res.json({
            users: totalUsers,
            chats: totalChats,
            revenue: totalRevenue,
            fallbackRate: totalChats > 0 ? Math.round((fallbackChats / totalChats) * 100) : 0
        });
    } catch (error) {
        res.status(500).json({ message: 'خطا در آمار' });
    }
});

// ==========================================
// 2️⃣ چت‌ها (اصلاح شده برای مانیتورینگ) 🔥
// ==========================================
router.get('/chat-logs', async (req, res) => { // 👈 نام مسیر با فرانت‌اند یکی شد
    try {
        const { filter } = req.query; 

        let query = {};
        if (filter === 'fallback') query.isFallbackResponse = true; // فقط قرمزها
        if (filter === 'database') query.isFallbackResponse = false; // فقط سبزها

        const logs = await ChatLog.find(query)
            .populate('user', 'fullName email phone') // 👈 نام کاربر حیاتی است
            .sort({ timestamp: -1 })
            .limit(100);

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'خطا در دریافت چت‌ها' });
    }
});

// ==========================================
// 3️⃣ کاربران
// ==========================================
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'خطا' });
    }
});

router.post('/users/ban', async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'کاربر یافت نشد' });

        user.role = user.role === 'banned' ? 'user' : 'banned';
        await user.save();
        res.json({ message: `وضعیت کاربر تغییر کرد: ${user.role}` });
    } catch (error) {
        res.status(500).json({ message: 'خطا' });
    }
});

// شارژ توکن کاربر (اصلاح شده)
router.post('/users/charge', async (req, res) => { // 👈 متد POST بهتر است
    try {
        const { userId, tokens } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'کاربر یافت نشد' });

        user.tokens = (user.tokens || 0) + parseInt(tokens);
        await user.save();
        
        // ثبت تراکنش دستی
        await Transaction.create({
            user: userId,
            admin: req.user._id,
            amount: 0, // چون دستی شارژ شده
            tokens: parseInt(tokens),
            description: 'شارژ دستی توسط مدیریت'
        });

        res.json({ message: 'شارژ انجام شد', newBalance: user.tokens });
    } catch (error) {
        res.status(500).json({ message: 'خطا در شارژ' });
    }
});

// ==========================================
// 4️⃣ تیکت‌ها
// ==========================================
router.get('/tickets', async (req, res) => {
    try {
        const tickets = await Ticket.find()
            .populate('user', 'fullName email')
            .sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'خطا' });
    }
});

router.post('/tickets/:id/reply', async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'تیکت نیست' });

        ticket.messages.push({ sender: 'admin', text: req.body.text });
        ticket.status = 'answered';
        await ticket.save();
        res.json({ message: 'پاسخ ارسال شد' });
    } catch (error) {
        res.status(500).json({ message: 'خطا' });
    }
});

// ==========================================
// 5️⃣ مالی
// ==========================================
router.get('/finance', async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('user', 'fullName')
            .sort({ date: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'خطا' });
    }
});

module.exports = router;
