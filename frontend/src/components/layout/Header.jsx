import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaRobot, FaUser, FaSignInAlt } from 'react-icons/fa';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // چک کردن اینکه آیا کاربر لاگین است یا نه (برای نمایش دکمه مناسب)
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          
          {/* لوگو */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-900 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-900/20">
              IV
            </div>
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Iran<span className="text-blue-600">Vet</span>AI
            </span>
          </Link>

          {/* منوی دسکتاپ */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={`text-sm font-medium transition ${location.pathname === '/' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
              خانه
            </Link>
            <Link to="/bots" className={`text-sm font-medium transition ${location.pathname === '/bots' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
              ربات‌های هوشمند
            </Link>
            <Link to="/faq" className={`text-sm font-medium transition ${location.pathname === '/faq' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
              سوالات متداول
            </Link>
          </div>

          {/* دکمه‌های سمت چپ */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              to="/bots" 
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition"
            >
              <FaRobot />
              هدایت به ربات‌ها
            </Link>

            {isLoggedIn ? (
              <Link 
                to="/dashboard" 
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20"
              >
                <FaUser />
                پنل کاربری
              </Link>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20"
              >
                <FaSignInAlt />
                ورود / ثبت نام
              </Link>
            )}
          </div>

          {/* دکمه منوی موبایل */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-slate-700 text-2xl">
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* منوی موبایل */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 animate-fadeIn">
            <Link to="/" onClick={() => setIsOpen(false)} className="block py-2 text-gray-600 hover:text-blue-600">خانه</Link>
            <Link to="/bots" onClick={() => setIsOpen(false)} className="block py-2 text-gray-600 hover:text-blue-600">ربات‌ها</Link>
            <Link to="/faq" onClick={() => setIsOpen(false)} className="block py-2 text-gray-600 hover:text-blue-600">سوالات متداول</Link>
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
               <Link to="/bots" onClick={() => setIsOpen(false)} className="w-full text-center py-3 bg-blue-50 text-blue-700 rounded-xl font-bold">
                 مشاهده ربات‌ها
               </Link>
               {isLoggedIn ? (
                 <Link to="/dashboard" onClick={() => setIsOpen(false)} className="w-full text-center py-3 bg-slate-900 text-white rounded-xl font-bold">
                   پنل کاربری
                 </Link>
               ) : (
                 <Link to="/login" onClick={() => setIsOpen(false)} className="w-full text-center py-3 bg-slate-900 text-white rounded-xl font-bold">
                   ورود به حساب
                 </Link>
               )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
