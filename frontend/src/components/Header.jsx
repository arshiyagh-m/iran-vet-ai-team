import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt } from 'react-icons/fa';

const Header = () => {
  return (
    <header className="bg-brand-navy text-white p-4 shadow-md flex justify-between items-center px-4 md:px-8">
      <Link to="/" className="text-xl md:text-2xl font-bold flex items-center gap-2">
        <FaShieldAlt className="text-brand-green" />
        <span>هوش مصنوعی دامپزشکی</span>
      </Link>
      <div className="flex gap-3 text-sm md:text-base">
        <Link to="/login" className="px-3 py-2 hover:text-brand-gold transition">ورود</Link>
        <Link to="/chat-selection" className="bg-brand-green px-4 py-2 rounded-lg hover:bg-green-600 transition shadow-lg">
          شروع گفتگو
        </Link>
      </div>
    </header>
  );
};

export default Header;

