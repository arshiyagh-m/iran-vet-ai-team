const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');

router.use(protectAdmin);

// آمار
router.get('/stats', adminController.getStats);

// کاربران
router.get('/users', adminController.getAllUsers);
router.put('/users/charge', adminController.updateUserTokens);
router.post('/users/ban', adminController.banUser);

// دانش
router.get('/knowledge', adminController.getAllKnowledge);
router.post('/knowledge', adminController.addKnowledge);
router.delete('/knowledge/:id', adminController.deleteKnowledge);

// چت‌ها
router.get('/chats', adminController.getChatLogs);

// تیکت‌ها
router.get('/tickets', adminController.getAllTickets);
router.post('/tickets/:id/reply', adminController.replyTicket);

module.exports = router;
