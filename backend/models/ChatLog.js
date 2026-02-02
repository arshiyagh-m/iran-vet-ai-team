const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // کاربر سوال کننده
    
    botType: { type: String, default: 'General' }, // نوع بات (دام، طیور و...)
    
    question: { type: String, required: true }, // سوال کاربر
    
    answer: { type: String, required: true }, // جواب هوش مصنوعی
    
    reference: { type: String }, // منبع جواب (مثلاً: دیتابیس نسخه ۴ - فایل X) <-- این مهم بود
    
    licenseUsed: { type: String }, // کد لایسنس استفاده شده (اختیاری)
    
    // اگر true باشد یعنی در دیتابیس اکسل چیزی نبوده و هوش مصنوعی از دانش خودش (OpenAI) جواب داده
    // این برای ادمین عالیه تا بفهمه کجاها دیتابیسش ناقصه
    isFallbackResponse: { type: Boolean, default: false }, 
    
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatLog', chatLogSchema);
