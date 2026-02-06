const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema({
    // کاربری که سوال پرسیده (ارتباط با کالکشن User)
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }, 
    
    // نوع بات (مثلاً: bee, dog, cat یا poultry-industrial)
    botType: { type: String, default: 'General' }, 
    
    // سوال کاربر
    question: { type: String, required: true }, 
    
    // جواب تولید شده توسط هوش مصنوعی
    answer: { type: String, required: true }, 
    
    // اگر از دیتابیس خودمان خوانده باشد، اینجا منبع ذکر می‌شود (مثلاً: فایل تغذیه.pdf)
    reference: { type: String, default: null }, 
    
    // کد لایسنسی که هزینه از آن کسر شده
    licenseUsed: { type: String }, 
    
    // این فیلد خیلی مهم است:
    // true = دیتابیس ما جوابی نداشت و هوش مصنوعی از خودش گفت (باید بررسی شود)
    // false = جواب مستند به دیتابیس ماست
    isFallbackResponse: { type: Boolean, default: false }, 
    
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatLog', chatLogSchema);
