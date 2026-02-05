import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeadset, FaTicketAlt } from 'react-icons/fa'; // آیکون‌های جدید

const Overview = () => {
  const [user, setUser] = useState({ name: 'کاربر', tokens: 0 });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* خوش‌آمدگویی */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">سلام {user.name}، خوش اومدی! 👋</h1>
          <p className="text-slate-300">پنل مدیریت درخواست‌ها و پشتیبانی هوشمند.</p>
        </div>
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-10 -translate-y-10"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/5 rounded-full translate-x-10 translate-y-10"></div>
      </div>

      {/* میانبرها */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* باکس ۱: ارسال تیکت (جایگزین چت شد) */}
        <Link to="/dashboard/tickets" className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition flex items-center justify-between cursor-pointer">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">ارسال درخواست جدید</h3>
            <p className="text-gray-500 text-sm">ارتباط با پشتیبانی و ادمین</p>
          </div>
          <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl group-hover:scale-110 transition shadow-lg shadow-purple-200">
            <FaHeadset />
          </div>
        </Link>

        {/* باکس ۲: وضعیت اعتبار (یا تیکت‌های باز) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">اعتبار حساب</h3>
            <p className="text-gray-500 text-sm">موجودی توکن‌های شما</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-yellow-500">{user.tokens}</span>
            <span className="text-xs text-gray-400 block">توکن</span>
          </div>
        </div>

      </div>

      {/* بخش آخرین اطلاعیه یا فعالیت */}
      <div>
        <h3 className="text-lg font-bold text-gray-700 mb-4">وضعیت سیستم</h3>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
           <p className="text-gray-500">
             سیستم هوشمند آماده پاسخگویی به درخواست‌های شماست. برای شروع، یک تیکت جدید ثبت کنید.
           </p>
        </div>
      </div>
    </div>
  );
};

export default Overview;
