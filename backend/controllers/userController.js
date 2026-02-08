const User = require('../models/User');

// دریافت اطلاعات پروفایل
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'خطا در دریافت پروفایل' });
  }
};

// آپدیت پروفایل (نام، موبایل، رمز عبور)
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user) {
      // 1. آپدیت نام و موبایل (اگر ارسال شده باشند)
      user.fullName = req.body.fullName || user.fullName;
      user.phone = req.body.phone || user.phone;
      user.email = req.body.email || user.email; // ایمیل هم قابل ویرایش باشد
      
      // 2. تغییر رمز عبور (فقط اگر کاربر رمز جدید وارد کرده باشد)
      if (req.body.password && req.body.password.length > 0) {
        user.password = req.body.password; // ذخیره به صورت ساده (هماهنگ با لاگین فعلی)
        
        // 🔥 نکته کلیدی: غیرفعال کردن تغییر اجباری رمز
        user.mustChangePassword = false;
      }

      const updatedUser = await user.save();
      
      // 3. بازگرداندن اطلاعات جدید به فرانت‌‌اند
      res.json({
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        mustChangePassword: updatedUser.mustChangePassword, // وضعیت جدید رو بفرست
        token: req.headers.authorization.split(' ')[1] // توکن فعلی
      });

    } else {
      res.status(404).json({ message: 'کاربر یافت نشد' });
    }
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: 'خطا در آپدیت پروفایل: ' + error.message });
  }
};
