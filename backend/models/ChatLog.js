const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema({
    // کاربری که سوال پرسیده
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }, 
    
    // 🔥 فیلد جدید و حیاتی: ارتباط با نشست گفتگو
    // این فیلد مشخص می‌کند این پیام مربوط به کدام مکالمه (Session) است
    session: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ChatSession' 
    }, 
    
    // نوع بات (مثلاً: bee, dog, cat)
    botType: { type: String, default: 'General' }, 
    
    // سوال کاربر
    question: { type: String, required: true }, 
    
    // جواب هوش مصنوعی
    answer: { type: String, required: true }, 
    
    // منبع (اگر از دیتابیس پیدا شده باشد)
    reference: { type: String, default: null }, 
    
    // لایسنس یا توکن استفاده شده
    licenseUsed: { type: String }, 
    
    // آیا دیتابیس خالی بود و هوش مصنوعی از خودش جواب داد؟
    isFallbackResponse: { type: Boolean, default: false }, 
    
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatLog', chatLogSchema);
