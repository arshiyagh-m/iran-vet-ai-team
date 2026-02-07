const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userController');
const { protectUser } = require('../middleware/authMiddleware'); // اگر میدلور جدا ندارید، همان authenticateToken در server.js است

// اینجا فرض می‌کنیم authenticateToken را به عنوان آرگومان میگیریم یا در server.js هندل میکنیم
// اما برای استاندارد سازی، فعلا کنترلر را اکسپورت کردیم.
// در فایل server.js مستقیم ایمپورت میکنیم تا راحت تر باشد.

module.exports = router;

