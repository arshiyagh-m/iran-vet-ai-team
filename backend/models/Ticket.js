const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subject: String,
  status: { type: String, default: 'open' },
  messages: [{ 
      sender: String, 
      text: String, 
      createdAt: { type: Date, default: Date.now } 
  }]
}, { timestamps: true });

// این خط جلوی ارور OverwriteModelError را می‌گیرد
module.exports = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
