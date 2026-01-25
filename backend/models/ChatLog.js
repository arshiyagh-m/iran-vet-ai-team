const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    botType: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    licenseUsed: { type: String },
    // فیلد جدید: اگر true باشد یعنی در دیتابیس چیزی نبوده و هوش مصنوعی خودش جواب داده
    isFallbackResponse: { type: Boolean, default: false }, 
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatLog', chatLogSchema);
