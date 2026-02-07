const User = require('../models/User');
const ChatLog = require('../models/ChatLog');
const KnowledgeBase = require('../models/KnowledgeBase');
const Ticket = require('../models/Ticket');
const Transaction = require('../models/Transaction');

// ۱. آمار داشبورد
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalChats = await ChatLog.countDocuments();
    const pendingTickets = await Ticket.countDocuments({ status: 'open' });
    
    const incomeResult = await Transaction.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);
    const totalIncome = incomeResult[0]?.total || 0;

    const last7Days = [...Array(7).keys()].map(i => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const chartData = [];
    for (const date of last7Days) {
        const startOfDay = new Date(date);
        const endOfDay = new Date(new Date(date).getTime() + 86400000);
        const count = await User.countDocuments({ 
            createdAt: { $gte: startOfDay, $lt: endOfDay } 
        });
        chartData.push({ date, count });
    }

    res.json({ totalUsers, totalChats, pendingTickets, totalIncome, chartData });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

// ۲. مدیریت کاربران
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// ۳. شارژ توکن
exports.updateUserTokens = async (req, res) => {
  try {
    const { userId, tokens } = req.body;
    const amount = parseInt(tokens);
    
    if (isNaN(amount)) return res.status(400).json({ message: 'مقدار باید عدد باشد' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'کاربر یافت نشد' });

    user.tokens = (user.tokens || 0) + amount;
    await user.save();

    // ثبت تراکنش سیستمی (اختیاری)
    await Transaction.create({
        user: userId,
        admin: req.user._id,
        amount: 0,
        tokens: amount,
        description: 'شارژ دستی سریع از پنل کاربران'
    });

    res.json({ message: 'شارژ انجام شد', newBalance: user.tokens });
  } catch (error) {
    console.error("Charge Error:", error);
    res.status(500).json({ message: 'Error updating tokens' });
  }
};

// ۴. بن کردن کاربر (اصلاح شده: بدون تغییر رمز)
exports.banUser = async (req, res) => {
    try {
        const { userId } = req.body;
        
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'کاربر یافت نشد' });
        
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'نمی‌توانید مدیر سیستم را مسدود کنید!' });
        }

        // منطق بن / آنبن
        if (user.role === 'banned') {
            // رفع مسدودیت
            user.role = 'user';
            await user.save();
            return res.json({ message: 'کاربر رفع مسدودیت شد و می‌تواند وارد شود ✅', newRole: 'user' });
        } else {
            // مسدود کردن
            user.role = 'banned';
            // ❌ حذف شد: user.password = ... (دیگر رمز را عوض نمی‌کنیم)
            await user.save();
            return res.json({ message: 'کاربر مسدود شد و دیگر نمی‌تواند وارد شود ⛔', newRole: 'banned' });
        }
        
    } catch (error) {
        console.error("BAN ERROR:", error);
        res.status(500).json({ message: 'خطا در تغییر وضعیت کاربر' });
    }
};

// ۵. تغییر رمز عبور
exports.resetUserPassword = async (req, res) => {
    try {
        const { userId, newPassword } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'کاربر یافت نشد' });

        user.password = newPassword;
        user.mustChangePassword = true;
        await user.save();

        res.json({ message: 'رمز تغییر کرد.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error resetting password' });
    }
};

// ۶. مدیریت مالی
exports.createTransaction = async (req, res) => {
    try {
        const { userId, amount, tokens, description } = req.body;
        const tokenAmount = parseInt(tokens);
        const priceAmount = parseInt(amount);

        await Transaction.create({ 
            user: userId, 
            admin: req.user._id, 
            amount: priceAmount, 
            tokens: tokenAmount, 
            description 
        });
        
        const user = await User.findById(userId);
        user.tokens = (user.tokens || 0) + tokenAmount;
        await user.save();

        res.json({ message: 'تراکنش ثبت و حساب شارژ شد ✅' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating transaction' });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const trans = await Transaction.find()
            .populate('user', 'fullName email')
            .populate('admin', 'fullName')
            .sort({ date: -1 });
        res.json(trans);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching transactions' });
    }
};

// ۷. دانش
exports.addKnowledge = async (req, res) => {
    try { await KnowledgeBase.create(req.body); res.json({message:'اضافه شد'}); } 
    catch(e){ console.error(e); res.status(500).json({message:'Error'}); }
};
exports.getAllKnowledge = async (req, res) => {
    try { const docs = await KnowledgeBase.find().sort({ createdAt: -1 }); res.json(docs); } 
    catch(e){ console.error(e); res.status(500).json({message:'Error'}); }
};
exports.deleteKnowledge = async (req, res) => {
    try { await KnowledgeBase.findByIdAndDelete(req.params.id); res.json({message:'حذف شد'}); } 
    catch(e){ console.error(e); res.status(500).json({message:'Error'}); }
};

// ۸. چت‌ها
exports.getChatLogs = async (req, res) => {
    try {
        const { filter } = req.query; 
        let query = {};
        if (filter === 'fallback') query.isFallbackResponse = true;
        
        const logs = await ChatLog.find(query)
            .populate('user', 'fullName email')
            .sort({ timestamp: -1 })
            .limit(100);
        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logs' });
    }
};

// ۹. تیکت‌ها
exports.getAllTickets = async (req, res) => {
    try { 
        const tickets = await Ticket.find()
            .populate('user', 'fullName')
            .sort({ createdAt: -1 }); 
        res.json(tickets); 
    } 
    catch(e){ console.error(e); res.status(500).json({message:'Error'}); }
};

exports.replyTicket = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'متن پاسخ نمی‌تواند خالی باشد' });

        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'تیکت یافت نشد' });

        // اطمینان از وجود آرایه messages
        if (!ticket.messages) ticket.messages = [];

        ticket.messages.push({ 
            sender: 'admin', 
            text: text,
            createdAt: new Date()
        });
        ticket.status = 'answered';
        await ticket.save();
        res.json({ message: 'پاسخ ارسال شد' });
    } catch (e) { 
        console.error("Reply Ticket Error:", e); 
        res.status(500).json({ message: 'Error replying ticket' }); 
    }
};
