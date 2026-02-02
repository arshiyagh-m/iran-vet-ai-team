const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

// ایمپورت مدل‌ها
const User = require('../models/User');
const License = require('../models/License');
const Ticket = require('../models/Ticket');
const FileMeta = require('../models/FileMeta');
const ChatLog = require('../models/ChatLog');

// ۱. آمار کلی
router.get('/stats', protect, admin, async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const activeLicenses = await License.countDocuments({ isActive: true });
        const ticketCount = await Ticket.countDocuments({ status: 'Open' });
        res.json({ userCount, activeLicenses, ticketCount });
    } catch (error) {
        res.status(500).json({ message: 'خطا در دریافت آمار' });
    }
});

// ۲. وضعیت همگام‌سازی اکسل‌ها
router.get('/sync-status', protect, admin, async (req, res) => {
    try {
        const files = await FileMeta.find().sort({ lastUpdated: -1 });
        res.json(files);
    } catch (error) {
        res.status(500).json({ message: 'خطا در دریافت وضعیت فایل‌ها' });
    }
});

// ۳. ساخت لایسنس جدید
router.post('/create-license', protect, admin, async (req, res) => {
    try {
        const { userId, tokens, tier, days } = req.body;
        const code = 'VET-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + parseInt(days));

        const license = await License.create({
            code, 
            user: userId, 
            tokens: parseInt(tokens), 
            expiryDate, 
            tier,
            isActive: true
        });
        
        // شارژ کردن توکن کاربر
        await User.findByIdAndUpdate(userId, { $inc: { tokens: parseInt(tokens) } });

        res.json(license);
    } catch (error) {
        res.status(500).json({ message: 'خطا در ساخت لایسنس' });
    }
});

// ۴. پاسخ به تیکت
router.put('/reply-ticket/:id', protect, admin, async (req, res) => {
    try {
        const { reply } = req.body;
        const ticket = await Ticket.findById(req.params.id);
        if(ticket) {
            ticket.reply = reply;
            ticket.status = 'Answered';
            ticket.updatedAt = Date.now();
            await ticket.save();
            res.json(ticket);
        } else {
            res.status(404).json({ message: 'تیکت یافت نشد' });
        }
    } catch (error) {
        res.status(500).json({ message: 'خطا در پاسخ به تیکت' });
    }
});

// ۵. دریافت لاگ چت‌ها
router.get('/all-chats', protect, admin, async (req, res) => {
    try {
        const logs = await ChatLog.find()
            .sort({ timestamp: -1 })
            .limit(100)
            .populate('user', 'name email');
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'خطا در دریافت چت‌ها' });
    }
});

// ۶. تغییر رمز کاربر توسط ادمین (Force Reset) -> این بخش اضافه شد ✅
router.post('/reset-user-password', protect, admin, async (req, res) => {
    try {
        const { userId, newPassword } = req.body;
        
        // پیدا کردن کاربر
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'کاربر یافت نشد' });
        }

        // تغییر رمز (در فاز بعدی حتماً از bcrypt برای هش کردن استفاده کن)
        user.password = newPassword; 
        await user.save();

        res.json({ message: `رمز عبور برای کاربر ${user.name} با موفقیت تغییر کرد.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'خطا در تغییر رمز عبور' });
    }
});

module.exports = router;
