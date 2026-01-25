const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const License = require('../models/License');
const Ticket = require('../models/Ticket');

// دریافت آمار کلی
router.get('/stats', protect, admin, async (req, res) => {
    const userCount = await User.countDocuments();
    const activeLicenses = await License.countDocuments({ isActive: true });
    const ticketCount = await Ticket.countDocuments({ status: 'Open' });
    res.json({ userCount, activeLicenses, ticketCount });
});

// مدیریت لایسنس‌ها: ساخت لایسنس جدید
router.post('/create-license', protect, admin, async (req, res) => {
    const { userId, tokens, tier, days } = req.body;
    
    // تولید کد رندوم
    const code = 'VET-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(days));

    const license = await License.create({
        code,
        user: userId, // می‌تواند خالی باشد تا بعدا کاربر وارد کند
        tokens,
        expiryDate,
        tier
    });

    res.json(license);
});

// پاسخ به تیکت
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

module.exports = router;

