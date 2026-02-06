import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, FaUsers, FaDatabase, FaSignOutAlt, 
  FaHome, FaRobot, FaTicketAlt 
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    toast.info('خروج از مدیریت');
  };

  // تابعی برای تشخیص لینک فعال
  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    const baseClass = "flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium";
    return isActive 
      ? `${baseClass} bg-blue-600 text-white shadow-lg shadow-blue-900/50` 
      : `${baseClass} text-gray-400 hover:bg-slate-700 hover:text-white`;
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans dir-rtl">
      
      {/* سایدبار ادمین */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl fixed h-full z-50">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <div>
            <h2 className="text-lg font-bold text-white">پنل مدیریت</h2>
            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Admin Access</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          
          <Link to="/admin" className={getLinkClass('/admin')}>
            <FaTachometerAlt /> پیشخوان
          </Link>
          
          <Link to="/admin/users" className={getLinkClass('/admin/users')}>
            <FaUsers /> کاربران و مالی
          </Link>
          
          <Link to="/admin/knowledge" className={getLinkClass('/admin/knowledge')}>
            <FaDatabase /> دیتابیس هوشمند
          </Link>

          {/* 👇 لینک‌های جدید اضافه شد */}
          <Link to="/admin/chats" className={getLinkClass('/admin/chats')}>
            <FaRobot /> مانیتورینگ چت
          </Link>
          
          <Link to="/admin/tickets" className={getLinkClass('/admin/tickets')}>
            <FaTicketAlt /> پشتیبانی (تیکت)
          </Link>

          <div className="border-t border-slate-800 my-4 pt-4"></div>

          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition text-yellow-500 border border-slate-700/50">
            <FaHome /> بازگشت به سایت
          </Link>
        </nav>

        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 w-full px-2 py-2 rounded-lg hover:bg-white/5 transition">
            <FaSignOutAlt /> خروج امن
          </button>
        </div>
      </aside>

      {/* محتوا (با مارجین سمت راست برای جلوگیری از رفتن زیر سایدبار) */}
      <main className="flex-1 p-8 mr-64 overflow-y-auto h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto animate-fadeIn">
           <Outlet />
        </div>
      </main>
      
    </div>
  );
};

export default AdminLayout;
