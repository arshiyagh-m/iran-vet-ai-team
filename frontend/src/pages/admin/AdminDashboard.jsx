import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { FaUsers, FaComments, FaMoneyBillWave, FaTicketAlt } from 'react-icons/fa';

const AdminDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    client.get('/admin/stats').then(res => setData(res.data)).catch(console.error);
  }, []);

  if (!data) return <div>در حال بارگذاری...</div>;

  const cards = [
    { title: 'کاربران', value: data.totalUsers, icon: <FaUsers />, color: 'bg-blue-500' },
    { title: 'درآمد کل', value: `${data.totalIncome.toLocaleString()} ت`, icon: <FaMoneyBillWave />, color: 'bg-green-600' },
    { title: 'چت‌ها', value: data.totalChats, icon: <FaComments />, color: 'bg-purple-500' },
    { title: 'تیکت باز', value: data.pendingTickets, icon: <FaTicketAlt />, color: 'bg-red-500' },
  ];

  // محاسبه ارتفاع ستون‌ها برای نمودار
  const maxCount = Math.max(...(data.chartData || []).map(d => d.count), 1);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">پیشخوان وضعیت سیستم</h1>
      
      {/* کارت‌ها */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className={`${card.color} text-white p-6 rounded-2xl shadow-lg flex items-center justify-between`}>
            <div>
              <p className="text-sm opacity-80">{card.title}</p>
              <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
            </div>
            <div className="text-4xl opacity-30">{card.icon}</div>
          </div>
        ))}
      </div>

      {/* نمودار ساده CSS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold mb-6">روند ثبت‌نام کاربران (۷ روز اخیر)</h3>
        <div className="flex items-end justify-between h-40 gap-2">
            {data.chartData?.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1 group">
                    <div 
                        className="w-full bg-blue-500 rounded-t-lg transition-all duration-500 group-hover:bg-blue-600 relative"
                        style={{ height: `${(item.count / maxCount) * 100}%`, minHeight: '4px' }}
                    >
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition">{item.count}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-2 transform -rotate-45 origin-top-left md:rotate-0">{item.date.slice(5)}</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
