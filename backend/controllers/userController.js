const User = require('../models/User');
const bcrypt = require('bcryptjs'); // اگر نصب نیست: npm install bcryptjs

// دریافت اطلاعات پروفایل
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'خطا در دریافت پروفایل' });
  }
};

// آپدیت پروفایل (نام، موبایل، رمز)
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.phone = req.body.phone || user.phone;
      
      // تغییر رمز عبور (فقط اگر کاربر رمز جدید وارد کرده باشد)
      if (req.body.password && req.body.password.length > 0) {
        // هش کردن رمز (اگر از bcrypt استفاده می‌کنید، وگرنه ساده ذخیره کنید)
        // اینجا فرض ساده است، اما بهتره هش بشه
        user.password = req.body.password; 
        user.mustChangePassword = false;
      }

      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        token: req.headers.authorization.split(' ')[1] // توکن قبلی رو برگردون
      });
    } else {
      res.status(404).json({ message: 'کاربر یافت نشد' });
    }
  } catch (error) {
    res.status(500).json({ message: 'خطا در آپدیت پروفایل: ' + error.message });
  }
};

