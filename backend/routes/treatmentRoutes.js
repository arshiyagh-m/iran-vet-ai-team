const express = require('express');
const router = express.Router();
const { calculateDosage, seedTreatments } = require('../controllers/treatmentController');

// مسیر تزریق داده‌ها (فقط با باز کردن لینک در مرورگر اجرا می‌شود)
router.get('/seed', seedTreatments);

// مسیر محاسبه دوز داروها
router.post('/calculate', calculateDosage);

module.exports = router;
