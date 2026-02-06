const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');

// همه روت‌ها محافظت شده هستند
router.use(protectAdmin);

router.get('/stats', adminController.getStats); // آمار
router.get('/users', adminController.getAllUsers); // لیست کاربران
router.put('/users/charge', adminController.updateUserTokens); // شارژ توکن
router.post('/knowledge', adminController.addKnowledge); // افزودن دانش

module.exports = router;
