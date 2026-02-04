const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    
    email: { type: String, required: true, unique: true },
    
    // این فیلد جدید و حیاتیه 👇
    phone: { type: String, required: true }, 

    password: { type: String, required: true },
    
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    
    tokens: { type: Number, default: 5 }, // ۵ توکن هدیه ثبت نام
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
