const mongoose = require('mongoose');

const licenseSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true }, // کد لایسنس
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // کاربری که لایسنس را خریده
    tokens: { type: Number, required: true }, // تعداد توکن باقی‌مانده
    expiryDate: { type: Date }, // تاریخ انضا
    isActive: { type: Boolean, default: true },
    tier: { type: String, default: 'Standard' } // نوع پلن
});

module.exports = mongoose.model('License', licenseSchema);

