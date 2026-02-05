import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaComments, FaHistory, FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: 'کاربر', role: 'user' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ۱. خواندن اطلاعات واقعی کاربر
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // ۲. تابع خروج از حساب
  const handleLogout = () => {
    // پاک کردن اطلاعات
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // هدایت به صفحه ورود
    navigate('/login');
  };

  const menuItems = [
    { icon: <FaHome />, label: 'پیشخوان', path: '/dashboard' },
    { icon: <FaComments />, label: 'شروع گفتگو', path: '/dashboard/chat' },
    { icon: <FaHistory />, label: 'تاریخچه', path: '/dashboard/history' },
    { icon: <FaUser />, label: 'پروفایل من', path: '/dashboard/profile' },
  ];

  // تشخیص اینکه آیا لینک فعال است یا نه (برای هایلایت کردن)
  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname !== '/dashboard') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden dir-rtl font-sans">
      
      {/* --- نوار کناری (Sidebar) --- */}
      {/* این بخش در دسکتاپ همیشه هست، در موبایل کشویی میشه */}
      <aside className={`
        fixed md:static inset-y-0 right-0 z-50 w-64 bg-slate-900 text-white shadow-2xl transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        
        {/* هدر سایدبار (پروفایل کاربر) */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-gray-700 bg-slate-800">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-green-500/30">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h2 className="text-sm font-bold truncate">{user.name}</h2>
            <p className="text-xs text-gray-400 capitalize">{user.role === 'admin' ? 'مدیر سیستم' : 'کاربر عادی'}</p>
          </div>
          {/* دکمه بستن منو در موبایل */}
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden mr-auto text-gray-400 hover:text-white">
            <FaTimes size={20} />
          </button>
        </div>

        {/* لینک‌های منو */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)} // بستن منو بعد از کلیک (در موبایل)
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                isActive(item.path)
                  ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={`text-xl transition-transform group-hover:scale-110 ${isActive(item.path) ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* دکمه خروج */}
        <div className="p-4 border-t border-gray-700 bg-slate-900">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition cursor-pointer"
          >
            <FaSignOutAlt />
            <span>خروج از حساب</span>
          </button>
        </div>
      </aside>

      {/* ماسک تیره (فقط وقتی منو موبایل باز است) */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
        ></div>
      )}

      {/* --- محتوای اصلی --- */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        
        {/* هدر موبایل */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 md:hidden z-30 relative">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-lg">Iran Vet AI</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-600 hover:bg-gray-100 rounded-lg transition"
          >
            <FaBars size={24} />
          </button>
        </header>

        {/* محل نمایش صفحات (داشبورد، چت و...) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
