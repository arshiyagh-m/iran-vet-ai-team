import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaWhatsapp, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTelegramPlane } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* ستون ۱: درباره ما */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">IV</div>
              <span className="text-2xl font-bold">IranVetAI</span>
            </div>
            <p className="text-slate-400 leading-relaxed mb-6 text-sm text-justify">
              اولین پلتفرم هوشمند دامپزشکی کشور که با استفاده از هوش مصنوعی پیشرفته، در تشخیص بیماری‌ها و مدیریت سلامت دام و طیور به شما کمک می‌کند.
            </p>
            <div className="flex gap-4">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition text-white">
                <FaInstagram size={20} />
              </a>
              <a href="https://wa.me/989000000000" target="_blank" rel="noreferrer" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-green-500 transition text-white">
                <FaWhatsapp size={20} />
              </a>
              <a href="https://t.me" target="_blank" rel="noreferrer" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition text-white">
                <FaTelegramPlane size={20} />
              </a>
            </div>
          </div>

          {/* ستون ۲: دسترسی سریع */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">دسترسی سریع</h3>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><Link to="/" className="hover:text-blue-400 transition">صفحه اصلی</Link></li>
              <li><Link to="/bots" className="hover:text-blue-400 transition">ربات‌های هوشمند</Link></li>
              <li><Link to="/login" className="hover:text-blue-400 transition">ورود به پنل</Link></li>
              <li><Link to="/register" className="hover:text-blue-400 transition">ثبت نام</Link></li>
            </ul>
          </div>

          {/* ستون ۳: قوانین و راهنما */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">راهنما و پشتیبانی</h3>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><Link to="/faq" className="hover:text-blue-400 transition">سوالات متداول</Link></li>
              <li><Link to="/terms" className="hover:text-blue-400 transition">قوانین و مقررات</Link></li>
              <li><Link to="/dashboard/tickets" className="hover:text-blue-400 transition">ارسال تیکت پشتیبانی</Link></li>
            </ul>
          </div>

          {/* ستون ۴: تماس با ما */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">تماس با ما</h3>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-blue-500 mt-1" />
                <span>ایران، تهران، پارک علم و فناوری</span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhone className="text-blue-500" />
                <span dir="ltr">+98 21 1234 5678</span>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-blue-500" />
                <span>support@iranvetai.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
          <p>© تمامی حقوق برای ایران پت ای‌آی (Iran Vet AI) محفوظ است.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
