const mongoose = require('mongoose');

const LicenseSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tokens: Number,
    tier: { type: String, enum: ['Basic', 'Pro', 'Enterprise'], default: 'Basic' },
    expiryDate: Date,
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('License', LicenseSchema);
