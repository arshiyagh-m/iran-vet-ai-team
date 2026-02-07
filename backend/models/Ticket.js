const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  subject: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    // نکته مهم: در کنترلر ادمین از وضعیت 'answered' استفاده کردیم، پس باید اینجا باشد
    enum: ['open', 'pending', 'closed', 'answered'], 
    default: 'open' 
  },
  messages: [{
    sender: { 
      type: String, 
      required: true // 'user' یا 'admin'
    },
    text: { 
      type: String, 
      required: true 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  }]
}, { timestamps: true }); // این خودش createdAt و updatedAt را برای کل تیکت می‌سازد

// جلوگیری از خطای OverwriteModelError (بسیار مهم)
module.exports = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
