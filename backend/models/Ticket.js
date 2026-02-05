const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  status: { type: String, enum: ['open', 'pending', 'closed'], default: 'open' },
  
  // 👇 تغییر ساختار به آرایه‌ای از پیام‌ها برای چت دوطرفه
  messages: [{
    sender: { type: String, enum: ['user', 'admin'], required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ticket', ticketSchema);
