const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const License = require('../models/License');
const Ticket = require('../models/Ticket');
const FileMeta = require('../models/FileMeta'); // مدل متا دیتا اضافه شد

// ۱. آمار کلی (بدون تغییر)
router.get('/stats', protect, admin, async (req, res) => {
    const userCount = await User.countDocuments();
    const activeLicenses = await License.countDocuments({ isActive: true });
    const ticketCount = await Ticket.countDocuments({ status: 'Open' });
    res.json({ userCount, activeLicenses, ticketCount });
});

// ۲. دریافت وضعیت همگام‌سازی فایل‌های اکسل (جدید)
router.get('/sync-status', protect, admin, async (req, res) => {
    try {
        const files = await FileMeta.find().sort({ lastUpdated: -1 });
        res.json(files);
    } catch (error) {
        res.status(500).json({ message: 'خطا در دریافت وضعیت فایل‌ها' });
    }
});

// ۳. مدیریت لایسنس و تیکت (بدون تغییر)
router.post('/create-license', protect, admin, async (req, res) => {
    const { userId, tokens, tier, days } = req.body;
    const code = 'VET-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(days));

    const license = await License.create({
        code, user: userId, tokens, expiryDate, tier
    });
    res.json(license);
});

router.put('/reply-ticket/:id', protect, admin, async (req, res) => {
    const { reply } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if(ticket) {
        ticket.reply = reply;
        ticket.status = 'Answered';
        await ticket.save();
        res.json(ticket);
    } else {
        res.status(404).json({ message: 'تیکت یافت نشد' });
    }
});

// دریافت تمام چت‌ها (برای بررسی پاسخ‌های Fallback)
router.get('/all-chats', protect, admin, async (req, res) => {
    // فقط ۱۰۰ چت آخر را برمی‌گردانیم که سنگین نشود
    const logs = await ChatLog.find().sort({ timestamp: -1 }).limit(100).populate('user', 'fullName');
    res.json(logs);
});

module.exports = router;
