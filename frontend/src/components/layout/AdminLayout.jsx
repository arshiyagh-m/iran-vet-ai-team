import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaDatabase, FaSignOutAlt, FaHome } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    toast.info('خروج از مدیریت');
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans dir-rtl">
      {/* سایدبار ادمین */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-red-400">پنل مدیریت 🔥</h2>
          <p className="text-xs text-gray-400 mt-1">مدیریت کل سیستم</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition">
            <FaTachometerAlt /> پیشخوان
          </Link>
          <Link to="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition">
            <FaUsers /> کاربران و مالی
          </Link>
          <Link to="/admin/knowledge" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition">
            <FaDatabase /> دیتابیس هوشمند
          </Link>
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition text-yellow-400 mt-10 border border-slate-600">
            <FaHome /> بازگشت به سایت
          </Link>
        </nav>

        <div className="p-4 bg-slate-900">
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 w-full">
            <FaSignOutAlt /> خروج
          </button>
        </div>
      </aside>

      {/* محتوا */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
