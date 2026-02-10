const mongoose = require('mongoose');

// 🔥 تغییر حیاتی: دریافت مدل‌ها از mongoose (نه require فایل)
const User = mongoose.model('User');
const ChatLog = mongoose.model('ChatLog');
const KnowledgeBase = mongoose.model('KnowledgeBase');
const Ticket = mongoose.model('Ticket');
const Transaction = mongoose.model('Transaction');

// ۱. آمار داشبورد
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalChats = await ChatLog.countDocuments();
    const pendingTickets = await Ticket.countDocuments({ status: 'open' });
    
    // محاسبه درآمد کل
    const incomeResult = await Transaction.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalIncome = incomeResult.length > 0 ? incomeResult[0].total : 0;

    // نمودار ۷ روز گذشته (کاربران جدید)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        const startOfDay = new Date(dateStr);
        const endOfDay = new Date(new Date(dateStr).getTime() + 86400000);
        
        const count = await User.countDocuments({ 
            createdAt: { $gte: startOfDay, $lt: endOfDay } 
        });
        chartData.push({ date: dateStr, count });
    }

    res.json({ 
        totalUsers, 
        totalChats, 
        pendingTickets, 
        totalIncome, 
        chartData 
    });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: 'خطا در دریافت آمار' });
  }
};

// ۲. مدیریت کاربران
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطا در دریافت کاربران' });
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

    // ثبت تراکنش سیستمی (اختیاری ولی توصیه شده)
    await Transaction.create({
        user: userId,
        admin: req.user._id,
        amount: 0, // مبلغ ۰ چون دستی است
        tokens: amount,
        description: 'شارژ دستی سریع از پنل کاربران'
    });

    res.json({ message: 'شارژ انجام شد', newBalance: user.tokens });
  } catch (error) {
    console.error("Charge Error:", error);
    res.status(500).json({ message: 'خطا در آپدیت توکن' });
  }
};

// ۴. بن کردن کاربر (اصلاح شده)
exports.banUser = async (req, res) => {
    try {
        const { userId } = req.body;
        
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'کاربر یافت نشد' });
        
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'نمی‌توانید مدیر سیستم را مسدود کنید!' });
        }

        // منطق تغییر وضعیت (Toggle)
        if (user.role === 'banned') {
            user.role = 'user';
            await user.save();
            return res.json({ message: 'کاربر رفع مسدودیت شد ✅', newRole: 'user' });
        } else {
            user.role = 'banned';
            await user.save();
            return res.json({ message: 'کاربر مسدود شد ⛔', newRole: 'banned' });
        }
        
    } catch (error) {
        console.error("BAN ERROR:", error);
        res.status(500).json({ message: 'خطا در تغییر وضعیت کاربر' });
    }
};

// ۵. تغییر رمز عبور کاربر توسط ادمین
exports.resetUserPassword = async (req, res) => {
    try {
        const { userId, newPassword } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'کاربر یافت نشد' });

        user.password = newPassword; // ذخیره ساده (در سیستم واقعی هش کنید)
        user.mustChangePassword = true; // کاربر در ورود بعدی مجبور به تغییر رمز شود
        await user.save();

        res.json({ message: 'رمز عبور با موفقیت تغییر کرد.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'خطا در ریست پسورد' });
    }
};

// ۶. مدیریت مالی (ایجاد تراکنش دستی)
exports.createTransaction = async (req, res) => {
    try {
        const { userId, amount, tokens, description } = req.body;
        const tokenAmount = parseInt(tokens);
        const priceAmount = parseInt(amount);

        // ۱. ثبت تراکنش
        await Transaction.create({ 
            user: userId, 
            admin: req.user._id, 
            amount: priceAmount, 
            tokens: tokenAmount, 
            description 
        });
        
        // ۲. آپدیت توکن کاربر
        const user = await User.findById(userId);
        if (user) {
            user.tokens = (user.tokens || 0) + tokenAmount;
            await user.save();
        }

        res.json({ message: 'تراکنش ثبت و حساب کاربر شارژ شد ✅' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'خطا در ایجاد تراکنش' });
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
        res.status(500).json({ message: 'خطا در دریافت تراکنش‌ها' });
    }
};

// ۷. مدیریت دانش (Knowledge Base)
exports.addKnowledge = async (req, res) => {
    try { 
        await KnowledgeBase.create(req.body); 
        res.json({ message: 'رکورد جدید با موفقیت اضافه شد' }); 
    } catch(e){ 
        console.error(e); 
        res.status(500).json({ message: 'خطا در افزودن دانش' }); 
    }
};

exports.getAllKnowledge = async (req, res) => {
    try { 
        const docs = await KnowledgeBase.find().sort({ createdAt: -1 }); 
        res.json(docs); 
    } catch(e){ 
        console.error(e); 
        res.status(500).json({ message: 'خطا در دریافت لیست دانش' }); 
    }
};

exports.deleteKnowledge = async (req, res) => {
    try { 
        await KnowledgeBase.findByIdAndDelete(req.params.id); 
        res.json({ message: 'رکورد حذف شد' }); 
    } catch(e){ 
        console.error(e); 
        res.status(500).json({ message: 'خطا در حذف' }); 
    }
};

// ۸. لاگ چت‌ها (با فیلتر Fallback)
exports.getChatLogs = async (req, res) => {
    try {
        const { filter } = req.query; 
        let query = {};
        
        if (filter === 'fallback') query.isFallbackResponse = true;
        if (filter === 'database') query.isFallbackResponse = false;
        
        const logs = await ChatLog.find(query)
            .populate('user', 'fullName email phone') // اطلاعات کامل‌تر کاربر
            .sort({ timestamp: -1 })
            .limit(100);
            
        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'خطا در دریافت لاگ چت' });
    }
};

// ۹. تیکت‌ها
exports.getAllTickets = async (req, res) => {
    try { 
        const tickets = await Ticket.find()
            .populate('user', 'fullName email')
            .sort({ createdAt: -1 }); 
        res.json(tickets); 
    } catch(e){ 
        console.error(e); 
        res.status(500).json({ message: 'خطا در دریافت تیکت‌ها' }); 
    }
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
        
        ticket.status = 'answered'; // تغییر وضعیت به پاسخ داده شده
        await ticket.save();
        
        res.json({ message: 'پاسخ با موفقیت ارسال شد' });
    } catch (e) { 
        console.error("Reply Ticket Error:", e); 
        res.status(500).json({ message: 'خطا در پاسخ به تیکت' }); 
    }
};
