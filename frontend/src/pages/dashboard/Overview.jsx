import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaCoins } from 'react-icons/fa';

const Overview = () => {
  return (
    <div className="space-y-8">
      {/* خوش‌آمدگویی */}
      <div className="bg-gradient-to-r from-brand-navy to-blue-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">سلام ارشیا جان، خوش اومدی! 👋</h1>
          <p className="text-blue-200">هوش مصنوعی آماده پاسخگویی به سوالات دامپزشکی شماست.</p>
        </div>
        {/* دایره‌های تزیینی */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-10 -translate-y-10"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/5 rounded-full translate-x-10 translate-y-10"></div>
      </div>

      {/* وضعیت توکن و میانبر */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* باکس شروع چت */}
        <Link to="/dashboard/chat" className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">مشاوره جدید</h3>
            <p className="text-gray-500 text-sm">تشخیص بیماری و تجویز دارو</p>
          </div>
          <div className="w-12 h-12 bg-brand-green rounded-full flex items-center justify-center text-white text-xl group-hover:scale-110 transition">
            <FaPlus />
          </div>
        </Link>

        {/* باکس موجودی */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">موجودی حساب</h3>
            <p className="text-gray-500 text-sm">اعتبار باقی‌مانده شما</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-brand-gold">۵۰</span>
            <span className="text-xs text-gray-400 block">توکن مشاوره</span>
          </div>
        </div>

      </div>

      {/* آخرین فعالیت‌ها (مثال) */}
      <div>
        <h3 className="text-lg font-bold text-gray-700 mb-4">آخرین مشاوره‌ها</h3>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer flex justify-between">
            <span className="font-medium text-gray-800">تشخیص لنگش گاو هلشتاین</span>
            <span className="text-sm text-gray-400">۲ ساعت پیش</span>
          </div>
          <div className="p-4 hover:bg-gray-50 transition cursor-pointer flex justify-between">
            <span className="font-medium text-gray-800">مشکل تنفسی مرغ گوشتی</span>
            <span className="text-sm text-gray-400">دیروز</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;

