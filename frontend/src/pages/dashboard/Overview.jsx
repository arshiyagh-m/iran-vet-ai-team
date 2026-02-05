import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaCoins } from 'react-icons/fa';

const Overview = () => {
  const [user, setUser] = useState({ name: 'کاربر', tokens: 0 });

  useEffect(() => {
    // خواندن اطلاعات واقعی از حافظه
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* خوش‌آمدگویی داینامیک */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">سلام {user.name} عزیز، خوش اومدی! 👋</h1>
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
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white text-xl group-hover:scale-110 transition">
            <FaPlus />
          </div>
        </Link>

        {/* باکس موجودی داینامیک */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">موجودی حساب</h3>
            <p className="text-gray-500 text-sm">اعتبار باقی‌مانده شما</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-yellow-500">{user.tokens}</span>
            <span className="text-xs text-gray-400 block">توکن مشاوره</span>
          </div>
        </div>

      </div>

      {/* بخش تاریخچه (فعلاً استاتیک چون هنوز API تاریخچه نداریم) */}
      <div>
        <h3 className="text-lg font-bold text-gray-700 mb-4">آخرین فعالیت‌ها</h3>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-8 text-center text-gray-400">
           هنوز تاریخچه‌ای ثبت نشده است. (بعد از اولین چت اینجا پر می‌شود)
        </div>
      </div>
    </div>
  );
};

export default Overview;
