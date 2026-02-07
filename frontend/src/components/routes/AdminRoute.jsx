import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminRoute = () => {
  // گرفتن اطلاعات کاربر از حافظه مرورگر
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // ۱. اگر کاربر اصلاً لاگین نکرده باشد
  if (!user || !user.token) { // فرض بر این است که توکن هم در آبجکت ذخیره شده یا جداگانه چک شود
    // اما چون شما توکن را جدا ذخیره نکردید و فقط user را در لوکال دارید، چک کردن user کافیست
    return <Navigate to="/login" replace />;
  }

  // ۲. اگر لاگین کرده ولی "ادمین" نیست
  if (user.role !== 'admin') {
    // نمایش پیام خطا (فقط یک بار)
    // نکته: در ری‌اکت ۱۸ ممکن است دو بار اجرا شود، اما مشکلی نیست
    // toast.error('⛔ دسترسی غیرمجاز! شما مدیر سیستم نیستید.'); 
    return <Navigate to="/dashboard" replace />;
  }

  // ۳. اگر ادمین بود، اجازه ورود بده (Outlet یعنی بچه‌های داخل روت را نشان بده)
  return <Outlet />;
};

export default AdminRoute;

