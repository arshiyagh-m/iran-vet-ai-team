const express = require('express');
const router = express.Router();
const { 
    calculateDosage, 
    seedTreatments, 
    getConditionsBySpecies 
} = require('../controllers/treatmentController');

// مسیر تزریق داده‌های اولیه
router.get('/seed', seedTreatments);

// مسیر دریافت لیست بیماری‌ها بر اساس گونه انتخابی
// آدرس: GET /api/v1/calculator/conditions/Cat
router.get('/conditions/:species', getConditionsBySpecies);

// مسیر محاسبه دقیق دوز داروها
router.post('/calculate', calculateDosage);

module.exports = router;
