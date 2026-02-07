const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/adminMiddleware');
const ctrl = require('../controllers/adminController');

router.use(protectAdmin);

// داشبورد
router.get('/stats', ctrl.getStats);

// کاربران
router.get('/users', ctrl.getAllUsers);
router.post('/users/ban', ctrl.banUser);
router.post('/users/reset-password', ctrl.resetUserPassword);

// مالی (جدید)
router.get('/finance', ctrl.getTransactions);
router.post('/finance/charge', ctrl.createTransaction);

// دانش
router.get('/knowledge', ctrl.getAllKnowledge);
router.post('/knowledge', ctrl.addKnowledge);
router.delete('/knowledge/:id', ctrl.deleteKnowledge);

// چت و تیکت
router.get('/chats', ctrl.getChatLogs);
router.get('/tickets', ctrl.getAllTickets);
router.post('/tickets/:id/reply', ctrl.replyTicket);

module.exports = router;
