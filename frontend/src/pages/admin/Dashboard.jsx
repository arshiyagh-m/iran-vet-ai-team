import React from 'react';
import { FaUsers, FaCoins, FaCommentMedical, FaServer } from 'react-icons/fa';

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">آمار کلی سیستم</h2>

      {/* کارت‌های آمار */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="کل کاربران" value="۱,۲۴۰" icon={<FaUsers />} color="bg-blue-500" />
        <StatCard title="چت‌های امروز" value="۸۵" icon={<FaCommentMedical />} color="bg-green-500" />
        <StatCard title="مصرف توکن" value="۲,۳۰۰" icon={<FaCoins />} color="bg-yellow-500" />
        <StatCard title="وضعیت سرور" value="آنلاین" icon={<FaServer />} color="bg-purple-500" />
      </div>

      {/* جدول آخرین فعالیت‌ها */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-gray-700 mb-4">آخرین لاگ‌های سیستم</h3>
        <div className="space-y-3">
          <LogItem user="ارشیا قنبری" action="خرید اشتراک طلایی" time="۲ دقیقه پیش" />
          <LogItem user="کاربر ۹۳۵...۱۲" action="ثبت نام جدید" time="۵ دقیقه پیش" />
          <LogItem user="امین پاشایی" action="آپدیت دیتابیس دارویی" time="۱ ساعت پیش" />
        </div>
      </div>
    </div>
  );
};

// کامپوننت‌های کوچک کمکی
const StatCard = ({ title, value, icon, color }) => (
  <div className={`${color} text-white p-6 rounded-2xl shadow-lg flex items-center justify-between`}>
    <div>
      <p className="text-white/80 text-sm mb-1">{title}</p>
      <h3 className="text-3xl font-bold">{value}</h3>
    </div>
    <div className="text-4xl opacity-20">{icon}</div>
  </div>
);

const LogItem = ({ user, action, time }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 rounded-lg transition">
    <div>
      <span className="font-bold text-gray-800 text-sm">{user}</span>
      <span className="text-gray-500 text-sm mx-2">-</span>
      <span className="text-gray-600 text-sm">{action}</span>
    </div>
    <span className="text-xs text-gray-400">{time}</span>
  </div>
);

export default AdminDashboard;

