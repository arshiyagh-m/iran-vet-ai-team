const mongoose = require('mongoose');

// 🔥 تغییر مهم: دریافت مدل از mongoose (به جای require کردن فایل)
// این کار جلوی خطای "OverwriteModelError" را می‌گیرد
const User = mongoose.model('User');

// دریافت اطلاعات پروفایل
exports.getProfile = async (req, res) => {
  try {
    // req.user._id از میدل‌ور authenticateToken می‌آید
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
        return res.status(404).json({ message: 'کاربر یافت نشد' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطا در دریافت پروفایل' });
  }
};

// آپدیت پروفایل (نام، موبایل، ایمیل، رمز عبور)
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'کاربر یافت نشد' });
    }

    // 1. آپدیت فیلدهای متنی (فقط اگر مقدار داشته باشند)
    if (req.body.fullName) user.fullName = req.body.fullName;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.email) user.email = req.body.email;
    
    // 2. تغییر رمز عبور (اگر کاربر رمز جدید وارد کرده باشد)
    if (req.body.password && req.body.password.trim().length > 0) {
      user.password = req.body.password; // ذخیره ساده (مطابق سیستم فعلی)
      
      // 🔥 نکته کلیدی: برداشتن محدودیت تغییر اجباری رمز
      user.mustChangePassword = false;
    }

    const updatedUser = await user.save();
    
    // 3. بازگرداندن اطلاعات جدید به فرانت‌‌اند
    // (توکن را هم برمی‌گردانیم تا اگر فرانت نیاز داشت ذخیره کند)
    res.json({
      message: 'پروفایل با موفقیت بروزرسانی شد',
      user: {
          _id: updatedUser._id,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          tokens: updatedUser.tokens,
          mustChangePassword: updatedUser.mustChangePassword
      },
      token: req.headers.authorization ? req.headers.authorization.split(' ')[1] : null
    });

  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: 'خطا در آپدیت پروفایل: ' + error.message });
  }
};
