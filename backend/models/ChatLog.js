const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema({
    // کاربری که سوال پرسیده
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }, 
    
    // ارتباط با نشست گفتگو (برای تاریخچه)
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
    
    // آیا دیتابیس خالی بود و هوش مصنوعی از خودش جواب داد؟ (برای رنگ قرمز در ادمین)
    isFallbackResponse: { type: Boolean, default: false }, 
    
    // 🔥🔥🔥 فیلدهای جدید برای سیستم فیدبک (لایک/دیس‌لایک) 🔥🔥🔥
    feedback: { 
        type: String, 
        enum: ['like', 'dislike', null], // فقط این مقادیر مجازند
        default: null 
    },
    
    feedbackReason: { type: String, default: null }, // دلیل (مثلاً: "پاسخ ناقص بود")
    
    feedbackComment: { type: String, default: null }, // توضیحات متنی کاربر برای ادمین
    
    timestamp: { type: Date, default: Date.now }
});

// جلوگیری از خطای OverwriteModelError در صورت ایمپورت چندباره
module.exports = mongoose.models.ChatLog || mongoose.model('ChatLog', chatLogSchema);
