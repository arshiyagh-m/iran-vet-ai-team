const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    
    // 👇 این فیلد جدید اضافه شد
    jobType: { 
        type: String, 
        enum: ['student', 'vet', 'owner', 'other'], 
        default: 'other' 
    },

    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    tokens: { type: Number, default: 5 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
