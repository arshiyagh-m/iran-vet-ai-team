import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  // 1. گرفتن اطلاعات خام
  const storedData = localStorage.getItem('user');
  
  // 2. اگر کلاً دیتایی نیست -> برو لاگین
  if (!storedData) {
    return <Navigate to="/login" replace />;
  }

  const parsedData = JSON.parse(storedData);

  // 3. استخراج نقش (Role) - بخش حیاتی اصلاح شده 🔥
  // این خط هم ساختار { role: 'admin' } را می‌فهمد و هم { user: { role: 'admin' } }
  const role = parsedData.role || (parsedData.user && parsedData.user.role);

  // 4. لاگ برای دیباگ (حتماً کنسول مرورگر را چک کنید)
  console.log("🔍 AdminRoute Debug:", { 
    storedInLocal: parsedData, 
    detectedRole: role 
  });

  // 5. بررسی نقش
  if (role !== 'admin') {
    // اگر نقش ادمین نیست، دسترسی ندارید
    return <Navigate to="/dashboard" replace />;
  }

  // 6. دسترسی مجاز
  return <Outlet />;
};

export default AdminRoute;
