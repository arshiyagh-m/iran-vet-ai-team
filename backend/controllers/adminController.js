const User = require('../models/User');
const ChatLog = require('../models/ChatLog');
const KnowledgeBase = require('../models/KnowledgeBase');
const Ticket = require('../models/Ticket');

// ۱. دریافت آمار کلی داشبورد
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalChats = await ChatLog.countDocuments();
    const pendingTickets = await Ticket.countDocuments({ status: 'open' });
    const totalKnowledge = await KnowledgeBase.countDocuments();

    res.json({
      totalUsers,
      totalChats,
      pendingTickets,
      totalKnowledge
    });
  } catch (error) {
    res.status(500).json({ message: 'خطا در دریافت آمار' });
  }
};

// ۲. دریافت لیست کاربران
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'خطا در دریافت کاربران' });
  }
};

// ۳. شارژ دستی توکن کاربر (مدیریت مالی)
exports.updateUserTokens = async (req, res) => {
  try {
    const { userId, tokens } = req.body;
    const user = await User.findById(userId);
    
    if (!user) return res.status(404).json({ message: 'کاربر یافت نشد' });

    user.tokens = (user.tokens || 0) + parseInt(tokens);
    await user.save();

    res.json({ message: `حساب کاربر با موفقیت شارژ شد. موجودی جدید: ${user.tokens}` });
  } catch (error) {
    res.status(500).json({ message: 'خطا در آپدیت توکن' });
  }
};

// ۴. افزودن دانش جدید به دیتابیس (RAG)
exports.addKnowledge = async (req, res) => {
  try {
    const { title, category, content, subCategory } = req.body;
    
    await KnowledgeBase.create({
      title,
      category,
      subCategory,
      content,
      tags: [category, subCategory]
    });

    res.status(201).json({ message: 'اطلاعات با موفقیت به دیتابیس هوشمند اضافه شد.' });
  } catch (error) {
    res.status(500).json({ message: 'خطا در ثبت دانش' });
  }
};

