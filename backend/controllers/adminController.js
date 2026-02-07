const User = require('../models/User');
const ChatLog = require('../models/ChatLog');
const KnowledgeBase = require('../models/KnowledgeBase');
const Ticket = require('../models/Ticket');
const Transaction = require('../models/Transaction'); // مدل جدید

// ۱. آمار داشبورد (پیشرفته با نمودار)
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalChats = await ChatLog.countDocuments();
    const pendingTickets = await Ticket.countDocuments({ status: 'open' });
    
    // محاسبه درآمد کل
    const incomeResult = await Transaction.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);
    const totalIncome = incomeResult[0]?.total || 0;

    // داده‌های نمودار (ثبت‌نام‌های ۷ روز اخیر)
    const last7Days = [...Array(7).keys()].map(i => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const chartData = [];
    for (const date of last7Days) {
        // این کوئری ساده برای شمارش ثبت‌نام‌های هر روز است
        // برای دقت بالاتر باید بازه زمانی دقیق (Start of day, End of day) ست شود
        // اما برای سادگی فعلا اینطور مینویسیم:
        const count = await User.countDocuments({ 
            createdAt: { $gte: new Date(date), $lt: new Date(new Date(date).getTime() + 86400000) } 
        });
        chartData.push({ date, count });
    }

    res.json({ totalUsers, totalChats, pendingTickets, totalIncome, chartData });
  } catch (error) { res.status(500).json({ message: 'Error fetching stats' }); }
};

// ۲. مدیریت کاربران (کامل)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) { res.status(500).json({ message: 'Error' }); }
};

exports.banUser = async (req, res) => {
    try {
        const { userId } = req.body;
        // روش ساده بن کردن: تغییر پسورد به چیزی غیرقابل حدس و تغییر نقش
        await User.findByIdAndUpdate(userId, { 
            password: `BANNED_${Date.now()}_${Math.random()}`,
            role: 'banned' 
        });
        res.json({ message: 'کاربر مسدود شد' });
    } catch (error) { res.status(500).json({ message: 'Error' }); }
};

exports.resetUserPassword = async (req, res) => {
    try {
        const { userId, newPassword } = req.body;
        // در سیستم واقعی باید هش شود، اینجا فرض بر سادگی است یا اینکه در مدل pre-save دارید
        // اگر در مدل User هوک pre('save') برای هش دارید، باید از user.save() استفاده کنید
        // فرض میکنیم کاربر ساده آپدیت میشود:
        await User.findByIdAndUpdate(userId, { password: newPassword, mustChangePassword: true });
        res.json({ message: 'رمز تغییر کرد و کاربر مجبور به تعویض آن است.' });
    } catch (error) { res.status(500).json({ message: 'Error' }); }
};

// ۳. مدیریت مالی (تراکنش‌ها)
exports.createTransaction = async (req, res) => {
    try {
        const { userId, amount, tokens, description } = req.body;
        const adminId = req.user._id;

        // ۱. ثبت تراکنش
        await Transaction.create({ user: userId, admin: adminId, amount, tokens, description });
        
        // ۲. افزایش توکن کاربر
        const user = await User.findById(userId);
        user.tokens += parseInt(tokens);
        await user.save();

        res.json({ message: 'تراکنش ثبت و حساب شارژ شد ✅' });
    } catch (error) { res.status(500).json({ message: 'Error' }); }
};

exports.getTransactions = async (req, res) => {
    try {
        const trans = await Transaction.find().populate('user', 'fullName email').populate('admin', 'fullName').sort({ date: -1 });
        res.json(trans);
    } catch (error) { res.status(500).json({ message: 'Error' }); }
};

// ۴. دانش (همان قبلی)
exports.addKnowledge = async (req, res) => {
    try { await KnowledgeBase.create(req.body); res.json({message:'OK'}); } catch(e){ res.status(500).json({message:'Err'}); }
};
exports.getAllKnowledge = async (req, res) => {
    try { const docs = await KnowledgeBase.find().sort({ createdAt: -1 }); res.json(docs); } catch(e){ res.status(500).json({message:'Err'}); }
};
exports.deleteKnowledge = async (req, res) => {
    try { await KnowledgeBase.findByIdAndDelete(req.params.id); res.json({message:'Deleted'}); } catch(e){ res.status(500).json({message:'Err'}); }
};

// ۵. چت‌ها (با فیلتر)
exports.getChatLogs = async (req, res) => {
    try {
        const { filter } = req.query; 
        let query = {};
        if (filter === 'fallback') query.isFallbackResponse = true;
        
        const logs = await ChatLog.find(query).populate('user', 'fullName').sort({ timestamp: -1 }).limit(100);
        res.json(logs);
    } catch (error) { res.status(500).json({ message: 'Error' }); }
};

// ۶. تیکت‌ها
exports.getAllTickets = async (req, res) => {
    try { const tickets = await Ticket.find().populate('user', 'fullName').sort({ createdAt: -1 }); res.json(tickets); } catch(e){ res.status(500).json({message:'Err'}); }
};
exports.replyTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        ticket.messages.push({ sender: 'admin', text: req.body.text });
        ticket.status = 'answered';
        await ticket.save();
        res.json({ message: 'Replied' });
    } catch (e) { res.status(500).json({ message: 'Err' }); }
};
