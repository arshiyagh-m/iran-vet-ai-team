const express = require('express');
const router = express.Router();
const { calculateDosage } = require('../controllers/treatmentController');

// مسیر محاسبه دوز داروها
// آدرس کامل این ریکوئست خواهد بود: POST /api/v1/calculator/calculate
router.post('/calculate', calculateDosage);

module.exports = router;

