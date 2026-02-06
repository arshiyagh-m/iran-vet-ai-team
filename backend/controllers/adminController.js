const User = require('../models/User');
const ChatLog = require('../models/ChatLog');
const KnowledgeBase = require('../models/KnowledgeBase');
const Ticket = require('../models/Ticket');

// ۱. آمار داشبورد
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalChats = await ChatLog.countDocuments();
    const pendingTickets = await Ticket.countDocuments({ status: 'open' });
    const totalKnowledge = await KnowledgeBase.countDocuments();
    // محاسبه درآمد فرضی (مثلاً هر توکن ۲۰۰۰ تومان) - چون مدل تراکنش نداریم تقریبی میگیم
    const totalIncome = 0; // فعلا صفر تا مدل مالی بسازیم

    res.json({ totalUsers, totalChats, pendingTickets, totalKnowledge, totalIncome });
  } catch (error) { res.status(500).json({ message: 'Error' }); }
};

// ۲. مدیریت کاربران
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) { res.status(500).json({ message: 'Error' }); }
};

exports.updateUserTokens = async (req, res) => {
  try {
    const { userId, tokens } = req.body;
    const user = await User.findById(userId);
    user.tokens = (user.tokens || 0) + parseInt(tokens);
    await user.save();
    res.json({ message: 'شارژ شد' });
  } catch (error) { res.status(500).json({ message: 'Error' }); }
};

exports.banUser = async (req, res) => {
  try {
    const { userId, ban } = req.body; // ban = true/false
    // اینجا میتونی یک فیلد isBanned به مدل یوزر اضافه کنی. فعلا پسورد رو عوض میکنیم که نتونه بیاد
    if (ban) {
        await User.findByIdAndUpdate(userId, { password: 'BANNED_USER_' + Date.now() });
        res.json({ message: 'کاربر مسدود شد (رمز عبور تغییر کرد)' });
    }
  } catch (error) { res.status(500).json({ message: 'Error' }); }
};

// ۳. مدیریت دانش
exports.addKnowledge = async (req, res) => {
  try {
    await KnowledgeBase.create(req.body);
    res.status(201).json({ message: 'اضافه شد' });
  } catch (error) { res.status(500).json({ message: 'Error' }); }
};

exports.getAllKnowledge = async (req, res) => {
    try {
        const docs = await KnowledgeBase.find().sort({ createdAt: -1 });
        res.json(docs);
    } catch (error) { res.status(500).json({ message: 'Error' }); }
};

exports.deleteKnowledge = async (req, res) => {
    try {
        await KnowledgeBase.findByIdAndDelete(req.params.id);
        res.json({ message: 'حذف شد' });
    } catch (error) { res.status(500).json({ message: 'Error' }); }
};

// ۴. مانیتورینگ چت‌ها
exports.getChatLogs = async (req, res) => {
    try {
        const { filter } = req.query; // filter = 'fallback'
        let query = {};
        if (filter === 'fallback') query.isFallbackResponse = true;
        
        const logs = await ChatLog.find(query)
            .populate('user', 'fullName email') // اطلاعات کاربر رو هم بیار
            .sort({ timestamp: -1 })
            .limit(100); // ۱۰۰ تا آخر
        res.json(logs);
    } catch (error) { res.status(500).json({ message: 'Error' }); }
};

// ۵. مدیریت تیکت‌ها
exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find().populate('user', 'fullName').sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) { res.status(500).json({ message: 'Error' }); }
};

exports.replyTicket = async (req, res) => {
    try {
        const { text } = req.body;
        const ticket = await Ticket.findById(req.params.id);
        ticket.messages.push({ sender: 'admin', text });
        ticket.status = 'answered'; // تغییر وضعیت
        await ticket.save();
        res.json({ message: 'پاسخ ارسال شد' });
    } catch (error) { res.status(500).json({ message: 'Error' }); }
};
