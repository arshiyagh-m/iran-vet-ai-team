import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

// --- لی‌اوت‌ها (قالب‌های کلی) ---
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';

// --- صفحات عمومی ---
import Home from './pages/public/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// --- صفحات پنل کاربری ---
import Overview from './pages/dashboard/Overview';
import Chat from './pages/dashboard/Chat';
import History from './pages/dashboard/History';
import Profile from './pages/dashboard/Profile';

// --- صفحات پنل ادمین ---
import AdminDashboard from './pages/admin/Dashboard';
import UsersManager from './pages/admin/Users';

const App = () => {
  return (
    <div className="font-sans dir-rtl min-h-screen bg-gray-50 text-gray-800">
      {/* کامپوننت نمایش پیام‌های سیستم (مثل "خوش آمدید" یا خطاها) */}
      <ToastContainer position="top-right" rtl={true} theme="colored" />
      
      <Routes>
        
        {/* =========================================
            بخش ۱: صفحات عمومی (با هدر و فوتر)
           ========================================= */}
        <Route 
          path="/" 
          element={<><Header /><Home /><Footer /></>} 
        />
        <Route 
          path="/login" 
          element={<><Header /><Login /><Footer /></>} 
        />
        <Route 
          path="/register" 
          element={<><Header /><Register /><Footer /></>} 
        />

        {/* =========================================
            بخش ۲: پنل کاربری (با سایدبار)
           ========================================= */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Overview />} />      {/* صفحه اول داشبورد */}
          <Route path="chat" element={<Chat />} />    {/* صفحه چت */}
          <Route path="history" element={<History />} /> {/* تاریخچه */}
          <Route path="profile" element={<Profile />} /> {/* پروفایل */}
        </Route>

        {/* =========================================
            بخش ۳: پنل ادمین (مخصوص مدیران)
           ========================================= */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} /> {/* آمار کلی */}
          <Route path="users" element={<UsersManager />} /> {/* مدیریت کاربران */}
          <Route path="tickets" element={
            <div className="flex items-center justify-center h-full text-gray-500">
              بخش مدیریت تیکت‌ها (به زودی)
            </div>
          } />
        </Route>

        {/* =========================================
            مدیریت صفحات اشتباه (404)
           ========================================= */}
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-9xl font-bold text-gray-300">404</h1>
            <p className="text-xl text-gray-600 mt-4">صفحه مورد نظر پیدا نشد!</p>
            <a href="/" className="mt-6 px-6 py-2 bg-brand-navy text-white rounded-lg hover:bg-gray-800 transition">
              بازگشت به خانه
            </a>
          </div>
        } />

      </Routes>
    </div>
  );
};

export default App;
