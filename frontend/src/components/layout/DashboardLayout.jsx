import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FaHome, FaComments, FaHistory, FaUser, FaSignOutAlt } from 'react-icons/fa';

const DashboardLayout = () => {
  const location = useLocation();

  const menuItems = [
    { icon: <FaHome />, label: 'پیشخوان', path: '/dashboard' },
    { icon: <FaComments />, label: 'شروع گفتگو', path: '/dashboard/chat' },
    { icon: <FaHistory />, label: 'تاریخچه', path: '/dashboard/history' },
    { icon: <FaUser />, label: 'پروفایل من', path: '/dashboard/profile' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden dir-rtl">
      
      {/* نوار کناری (Sidebar) */}
      <aside className="w-64 bg-brand-navy text-white hidden md:flex flex-col shadow-2xl">
        <div className="h-16 flex items-center justify-center border-b border-gray-700">
          <h2 className="text-xl font-bold tracking-wider">IRAN VET AI</h2>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                location.pathname === item.path 
                  ? 'bg-brand-green text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-500/10 rounded-xl transition">
            <FaSignOutAlt />
            <span>خروج از حساب</span>
          </Link>
        </div>
      </aside>

      {/* محتوای اصلی */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* هدر مخصوص موبایل و تبلت */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 md:hidden">
          <span className="font-bold text-brand-navy">پنل کاربری</span>
          <button className="text-gray-600">منو</button>
        </header>

        {/* محل نمایش صفحات داخلی (Outlet) */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;

