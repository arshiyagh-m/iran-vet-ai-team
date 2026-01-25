const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    botType: { type: String, required: true }, // مثلا: Poultry, Pet, etc.
    question: { type: String, required: true },
    answer: { type: String, required: true },
    licenseUsed: { type: String },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatLog', chatLogSchema);

