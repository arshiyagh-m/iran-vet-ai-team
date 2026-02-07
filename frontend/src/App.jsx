import React, { useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- لی‌اوت‌ها ---
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';

// --- صفحات عمومی ---
import Home from './pages/public/Home';
import Login from './pages/auth/Login';
import Bots from './pages/public/Bots';
import FAQ from './pages/public/FAQ';
import Terms from './pages/public/Terms';

// --- صفحات پنل کاربری ---
import Overview from './pages/dashboard/Overview';
import History from './pages/dashboard/History';
import Profile from './pages/dashboard/Profile';
import Tickets from './pages/dashboard/Tickets';
import TicketDetail from './pages/dashboard/TicketDetail';
import ChangePassword from './pages/dashboard/ChangePassword';
import BotChat from './pages/dashboard/BotChat';
import BuyTokens from './pages/dashboard/BuyTokens';

// --- صفحات پنل مدیریت (ادمین) ---
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminKnowledge from './pages/admin/AdminKnowledge';
// 👇👇 ایمپورت‌های جدید برای تکمیل پنل ادمین
import AdminChatLogs from './pages/admin/AdminChatLogs';
import AdminTickets from './pages/admin/AdminTickets';
import AdminFinance from './pages/admin/AdminFinance';

const App = () => {
  const { pathname } = useLocation();

  // اسکرول به بالا هنگام تغییر صفحه
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="font-sans dir-rtl min-h-screen bg-gray-50 text-gray-800">
      <ToastContainer position="top-right" rtl={true} theme="colored" />
      
      <Routes>
        
        {/* ۱. صفحات عمومی */}
        <Route path="/" element={<><Header /><Home /><Footer /></>} />
        <Route path="/bots" element={<><Header /><Bots /><Footer /></>} />
        <Route path="/faq" element={<><Header /><FAQ /><Footer /></>} />
        <Route path="/terms" element={<><Header /><Terms /><Footer /></>} />
        
        <Route path="/login" element={<><Header /><Login /><Footer /></>} />
        <Route path="/register" element={<><Header /><Login /><Footer /></>} />

        {/* ۲. پنل کاربری */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="buy-tokens" element={<BuyTokens />} />
          <Route path="history" element={<History />} />
          <Route path="profile" element={<Profile />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="tickets/:id" element={<TicketDetail />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="chat/:type" element={<BotChat />} />
        </Route>

        {/* ۳. پنل مدیریت (ادمین) - کامل شده ✅ */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />       {/* پیشخوان آمار */}
          <Route path="users" element={<AdminUsers />} />    {/* مدیریت کاربران و مالی */}
          <Route path="knowledge" element={<AdminKnowledge />} /> {/* دیتابیس هوشمند */}
          
          {/* 👇 مسیرهای اضافه شده: */}
          <Route path="chats" element={<AdminChatLogs />} />   {/* مانیتورینگ چت‌ها */}
          <Route path="tickets" element={<AdminTickets />} />  {/* مدیریت تیکت‌ها */}
          <Route path="finance" element={<AdminFinance />} />
        </Route>

        {/* ۴. صفحه ۴۰۴ */}
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-9xl font-bold text-gray-300">404</h1>
            <p className="text-xl text-gray-600 mt-4">صفحه مورد نظر پیدا نشد!</p>
            <Link to="/" className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-gray-800 transition">
              بازگشت به خانه
            </Link>
          </div>
        } />

      </Routes>
    </div>
  );
};

export default App;
