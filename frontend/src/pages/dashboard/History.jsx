import React from 'react';
import { FaCalendarAlt, FaSearch, FaEye } from 'react-icons/fa';

const History = () => {
  // دیتای ساختگی (بعداً از دیتابیس میاد)
  const histories = [
    { id: 1, title: 'تشخیص بیماری گوساله', date: '۱۴۰۲/۱۱/۱۲', status: 'تکمیل شده', token: 2 },
    { id: 2, title: 'مشاوره تغذیه طیور', date: '۱۴۰۲/۱۱/۱۰', status: 'تکمیل شده', token: 1 },
    { id: 3, title: 'سوال درباره واکسیناسیون', date: '۱۴۰۲/۱۱/۰۵', status: 'بسته شده', token: 1 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">تاریخچه مشاوره‌ها</h2>
        <div className="relative">
          <input 
            type="text" 
            placeholder="جستجو در گفتگوها..." 
            className="pl-4 pr-10 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-navy"
          />
          <FaSearch className="absolute right-3 top-3 text-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="py-4 px-6 text-right text-gray-600 font-medium">موضوع مشاوره</th>
              <th className="py-4 px-6 text-right text-gray-600 font-medium hidden md:table-cell">تاریخ</th>
              <th className="py-4 px-6 text-right text-gray-600 font-medium">وضعیت</th>
              <th className="py-4 px-6 text-center text-gray-600 font-medium">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {histories.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition">
                <td className="py-4 px-6 font-medium text-brand-navy">{item.title}</td>
                <td className="py-4 px-6 text-gray-500 hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-gray-300" />
                    {item.date}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <button className="p-2 text-brand-navy hover:bg-brand-navy/10 rounded-lg transition">
                    <FaEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {histories.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            هنوز مشاوره‌ای انجام نداده‌اید.
          </div>
        )}
      </div>
    </div>
  );
};

export default History;

