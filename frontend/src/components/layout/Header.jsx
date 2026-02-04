import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaStethoscope } from 'react-icons/fa';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  // بررسی وضعیت لاگین با هر بار تغییر صفحه
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* لوگو */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-navy rounded-xl flex items-center justify-center text-white">
            <FaStethoscope size={20} />
          </div>
          <span className="text-xl font-bold text-brand-navy hidden sm:block">
            ایران وت AI
          </span>
        </Link>

        {/* منوی وسط (فقط برای دسکتاپ) */}
        <nav className="hidden md:flex gap-8 text-gray-600 font-medium">
          <Link to="/" className="hover:text-brand-green transition">صفحه اصلی</Link>
          <Link to="/dashboard/chat" className="hover:text-brand-green transition">چت هوشمند</Link>
        </nav>

        {/* بخش دکمه‌ها - بر اساس وضعیت لاگین */}
        <div className="flex gap-3 items-center">
          
          {user ? (
            <>
              {/* اگر ادمین بود دکمه پنل مدیریت بیاد */}
              {user.role === 'admin' && (
                <Link to="/admin" className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-bold hover:bg-red-200 transition">
                  پنل مدیریت
                </Link>
              )}

              <Link to="/dashboard" className="px-4 py-2 bg-gray-100 text-brand-navy rounded-lg font-medium hover:bg-gray-200 transition hidden sm:block">
                داشبورد
              </Link>

              <button 
                onClick={handleLogout} 
                className="px-4 py-2 text-red-500 font-medium hover:bg-red-50 rounded-lg transition"
              >
                خروج
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-5 py-2 text-brand-navy font-medium hover:bg-gray-50 rounded-lg transition">
                ورود
              </Link>
              <Link to="/register" className="px-5 py-2 bg-brand-green text-white font-medium rounded-lg hover:bg-green-700 shadow-lg shadow-green-200 transition">
                ثبت نام
              </Link>
            </>
          )}

        </div>

      </div>
    </header>
  );
};

export default Header;
