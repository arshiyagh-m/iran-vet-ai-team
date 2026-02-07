const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/adminMiddleware');
const ctrl = require('../controllers/adminController');

router.use(protectAdmin);

// --- 1. داشبورد ---
router.get('/stats', ctrl.getStats);

// --- 2. کاربران ---
router.get('/users', ctrl.getAllUsers);
router.post('/users/ban', ctrl.banUser);
router.post('/users/reset-password', ctrl.resetUserPassword);

// 👈 این خط جا افتاده بود! (برای شارژ توکن در صفحه کاربران)
router.put('/users/charge', ctrl.updateUserTokens); 


// --- 3. مالی (تراکنش‌های کامل) ---
router.get('/finance', ctrl.getTransactions);
router.post('/finance/charge', ctrl.createTransaction);

// --- 4. دانش ---
router.get('/knowledge', ctrl.getAllKnowledge);
router.post('/knowledge', ctrl.addKnowledge);
router.delete('/knowledge/:id', ctrl.deleteKnowledge);

// --- 5. چت و تیکت ---
router.get('/chats', ctrl.getChatLogs);
router.get('/tickets', ctrl.getAllTickets);
router.post('/tickets/:id/reply', ctrl.replyTicket);

module.exports = router;
