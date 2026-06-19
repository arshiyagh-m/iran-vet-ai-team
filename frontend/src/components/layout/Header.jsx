import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaRobot, FaUser, FaSignInAlt } from 'react-icons/fa';
// 👇 ایمپورت لوگو
import logo from '../../assets/logo.png';

// این بخش را کنار بقیه لینک‌های منو (مثل صفحه اصلی، درباره ما و غیره) قرار بده:



const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          
          {/* لوگو و نام سایت */}
          <Link to="/" className="flex items-center gap-3 group">
            {/* 👇 نمایش عکس لوگو بجای دایره رنگی */}
            <img 
              src={logo} 
              alt="Iran Vet AI Logo" 
              className="h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300" 
            />
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight hidden sm:block">
              Iran<span className="text-blue-600">Vet</span>AI
            </span>
          </Link>

          {/* منوی دسکتاپ */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={`text-sm font-medium transition ${location.pathname === '/' ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-blue-600'}`}>
              خانه
            </Link>
            <Link to="/bots" className={`text-sm font-medium transition ${location.pathname === '/bots' ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-blue-600'}`}>
              ربات‌های هوشمند
            </Link>
            <Link to="/faq" className={`text-sm font-medium transition ${location.pathname === '/faq' ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-blue-600'}`}>
              سوالات متداول
            </Link>
            <Link>
              to="/triage-calculator" 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200">
              <span>🧮</span>
              <span>ماشین‌حساب تریاژ</span>
            </Link>


            
            
          </div>

          {/* دکمه‌های سمت چپ */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              to="/bots" 
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition"
            >
              <FaRobot />
              <span className="hidden lg:inline">ربات‌ها</span>
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
                ورود
              </Link>
            )}
          </div>

          {/* دکمه منوی موبایل */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-slate-700 text-2xl p-2">
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* منوی موبایل */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 animate-fadeIn border-t border-gray-100 pt-4">
            <Link to="/" onClick={() => setIsOpen(false)} className="block py-2 text-gray-600 hover:text-blue-600 font-medium">خانه</Link>
            <Link to="/bots" onClick={() => setIsOpen(false)} className="block py-2 text-gray-600 hover:text-blue-600 font-medium">ربات‌ها</Link>
            <Link to="/faq" onClick={() => setIsOpen(false)} className="block py-2 text-gray-600 hover:text-blue-600 font-medium">سوالات متداول</Link>
            <div className="pt-4 flex flex-col gap-3">
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
