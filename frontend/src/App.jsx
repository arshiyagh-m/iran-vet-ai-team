import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- لی‌اوت‌ها ---
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import DashboardLayout from './components/layout/DashboardLayout';
// اگر هنوز AdminLayout را نساختی، این خط و روت‌های ادمین را فعلاً کامنت کن تا خطا ندهد
// import AdminLayout from './components/layout/AdminLayout'; 

// --- صفحات عمومی ---
import Home from './pages/public/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// --- صفحات پنل کاربری ---
import Overview from './pages/dashboard/Overview';
import Chat from './pages/dashboard/Chat';
import History from './pages/dashboard/History';
import Profile from './pages/dashboard/Profile';
import Tickets from './pages/dashboard/Tickets';
// 👇 این دو تا خط خیلی مهم بودند که جا افتاده بودند و باعث سفیدی صفحه می‌شدند
import TicketDetail from './pages/dashboard/TicketDetail';
import ChangePassword from './pages/dashboard/ChangePassword';

// --- صفحات پنل ادمین ---
// import AdminDashboard from './pages/admin/Dashboard';
// import UsersManager from './pages/admin/Users';

const App = () => {
  return (
    <div className="font-sans dir-rtl min-h-screen bg-gray-50 text-gray-800">
      <ToastContainer position="top-right" rtl={true} theme="colored" />
      
      <Routes>
        
        {/* ۱. صفحات عمومی */}
        <Route path="/" element={<><Header /><Home /><Footer /></>} />
        <Route path="/login" element={<><Header /><Login /><Footer /></>} />
        <Route path="/register" element={<><Header /><Register /><Footer /></>} />

        {/* ۲. پنل کاربری (محافظت شده) */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="chat" element={<Chat />} />
          <Route path="history" element={<History />} />
          <Route path="profile" element={<Profile />} />
          <Route path="tickets" element={<Tickets />} />
          {/* مسیرهای جدید که اضافه کردیم */}
          <Route path="tickets/:id" element={<TicketDetail />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>

        {/* ۳. پنل ادمین (فعلاً کامنت کردم تا فایل‌هاش رو بسازی، اگر ساختی از کامنت دربیار) */}
        {/* <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UsersManager />} />
        </Route> 
        */}

        {/* ۴. صفحه ۴۰۴ */}
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-9xl font-bold text-gray-300">404</h1>
            <p className="text-xl text-gray-600 mt-4">صفحه مورد نظر پیدا نشد!</p>
            {/* استفاده از Link به جای a برای جلوگیری از رفرش کامل */}
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
