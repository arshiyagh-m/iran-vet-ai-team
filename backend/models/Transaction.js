const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ادمینی که ثبت کرده
  amount: { type: Number, required: true }, // مبلغ به تومان
  tokens: { type: Number, required: true }, // تعداد توکن
  description: { type: String }, // مثلا: شماره ارجاع فیش
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);

