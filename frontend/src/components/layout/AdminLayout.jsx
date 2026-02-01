import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FaUsers, FaChartLine, FaShieldAlt, FaSignOutAlt, FaHeadset } from 'react-icons/fa';

const AdminLayout = () => {
  const location = useLocation();

  const menuItems = [
    { icon: <FaChartLine />, label: 'داشبورد مدیریتی', path: '/admin' },
    { icon: <FaUsers />, label: 'مدیریت کاربران', path: '/admin/users' },
    { icon: <FaHeadset />, label: 'پشتیبانی و تیکت‌ها', path: '/admin/tickets' },
    // { icon: <FaDatabase />, label: 'مدیریت دیتابیس', path: '/admin/data' },
  ];

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden dir-rtl">
      
      {/* سایدبار ادمین (مشکی/قرمز برای تمایز) */}
      <aside className="w-64 bg-black/50 text-white hidden md:flex flex-col border-l border-gray-800">
        <div className="h-16 flex items-center justify-center border-b border-gray-800 gap-2 text-red-500">
          <FaShieldAlt size={24} />
          <h2 className="text-lg font-bold tracking-wider text-white">ADMIN PANEL</h2>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                location.pathname === item.path 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition">
            <FaSignOutAlt />
            <span>خروج مدیر</span>
          </Link>
        </div>
      </aside>

      {/* محتوای اصلی */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
          <h1 className="font-bold text-gray-800">پنل مدیریت سیستم</h1>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-gray-500">وضعیت سیستم: نرمال</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;

