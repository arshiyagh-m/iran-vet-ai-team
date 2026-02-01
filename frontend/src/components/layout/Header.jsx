import React from 'react';
import { Link } from 'react-router-dom';
import { FaStethoscope } from 'react-icons/fa'; // آیکون گوشی پزشکی

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* لوگو و نام */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-navy rounded-xl flex items-center justify-center text-white">
            <FaStethoscope size={20} />
          </div>
          <span className="text-xl font-bold text-brand-navy hidden sm:block">
            ایران وت AI
          </span>
        </Link>

        {/* منوی وسط */}
        <nav className="hidden md:flex gap-8 text-gray-600 font-medium">
          <Link to="/" className="hover:text-brand-green transition">صفحه اصلی</Link>
          <Link to="/about" className="hover:text-brand-green transition">درباره ما</Link>
          <Link to="/contact" className="hover:text-brand-green transition">تماس با ما</Link>
        </nav>

        {/* دکمه‌های ورود */}
        <div className="flex gap-3">
          <Link to="/login" className="px-5 py-2 text-brand-navy font-medium hover:bg-gray-50 rounded-lg transition">
            ورود
          </Link>
          <Link to="/register" className="px-5 py-2 bg-brand-green text-white font-medium rounded-lg hover:bg-green-700 shadow-lg shadow-green-200 transition">
            ثبت نام
          </Link>
        </div>

      </div>
    </header>
  );
};

export default Header;

