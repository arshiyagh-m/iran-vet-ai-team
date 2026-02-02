const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    
    // ایمیل برای لاگین (در server.js از ایمیل استفاده کردیم)
    email: { type: String, required: true, unique: true },
    
    // شماره موبایل (اختیاری یا اجباری، بسته به نیاز)
    phone: { type: String, unique: true }, 

    password: { type: String, required: true },
    
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    
    // موجودی توکن (برای استفاده از هوش مصنوعی)
    tokens: { type: Number, default: 5 }, // مثلا ۵ تا رایگان اول کار
    
    isBanned: { type: Boolean, default: false },
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
