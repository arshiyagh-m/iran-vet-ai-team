import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { FaUsers, FaComments, FaMoneyBillWave, FaTicketAlt, FaChartLine } from 'react-icons/fa';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await client.get('/admin/stats');
        setData(res.data);
      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // نمایش لودینگ زیبا
  if (loading) return (
    <div className="flex justify-center items-center h-64 text-gray-500">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 ml-2"></div>
      در حال دریافت آمار...
    </div>
  );

  // جلوگیری از ارور اگر دیتا نیامد
  if (!data) return <div className="p-10 text-center text-red-500">خطا در دریافت اطلاعات</div>;

  const cards = [
    // استفاده از || 0 برای جلوگیری از undefined
    { title: 'کاربران کل', value: (data.users || 0).toLocaleString('fa-IR'), icon: <FaUsers />, color: 'bg-blue-500' },
    { title: 'درآمد کل', value: `${(data.revenue || 0).toLocaleString('fa-IR')} تومان`, icon: <FaMoneyBillWave />, color: 'bg-green-600' },
    { title: 'کل مکالمات', value: (data.chats || 0).toLocaleString('fa-IR'), icon: <FaComments />, color: 'bg-purple-500' },
    { title: 'تیکت‌های باز', value: (data.pendingTickets || 0).toLocaleString('fa-IR'), icon: <FaTicketAlt />, color: 'bg-red-500' },
  ];

  // محاسبه ارتفاع ستون‌ها (ایمن)
  const chartData = data.chartData || [];
  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  return (
    <div className="space-y-8 animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-800 border-b pb-4">پیشخوان وضعیت سیستم</h1>
      
      {/* کارت‌ها */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className={`${card.color} text-white p-6 rounded-2xl shadow-lg flex items-center justify-between transform hover:scale-105 transition duration-300`}>
            <div>
              <p className="text-sm opacity-90 font-medium">{card.title}</p>
              <h3 className="text-2xl font-bold mt-2">{card.value}</h3>
            </div>
            <div className="text-4xl opacity-40 bg-white/20 p-2 rounded-lg">{card.icon}</div>
          </div>
        ))}
      </div>

      {/* نمودار ساده CSS */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-700 mb-8 flex items-center gap-2">
            <FaChartLine className="text-blue-500"/> روند ثبت‌نام کاربران (۷ روز اخیر)
        </h3>
        
        {chartData.length > 0 ? (
            <div className="flex items-end justify-between h-48 gap-2 md:gap-4 px-2">
                {chartData.map((item, index) => (
                    <div key={index} className="flex flex-col items-center flex-1 group">
                        {/* تولتیپ شناور */}
                        <div className="mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 bg-gray-800 text-white text-xs py-1 px-2 rounded absolute -mt-8 z-10">
                            {item.count} کاربر
                        </div>
                        
                        {/* ستون نمودار */}
                        <div 
                            className="w-full max-w-[40px] bg-blue-100 rounded-t-lg relative overflow-hidden transition-all duration-500 group-hover:shadow-lg"
                            style={{ height: `${(item.count / maxCount) * 100}%`, minHeight: '8px' }}
                        >
                            <div className="absolute bottom-0 left-0 right-0 top-0 bg-blue-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        
                        {/* تاریخ */}
                        <span className="text-[10px] text-gray-400 mt-3 font-medium">{new Date(item.date).toLocaleDateString('fa-IR', {day: '2-digit', month: '2-digit'})}</span>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center text-gray-400 py-10">داده‌ای برای نمایش وجود ندارد</div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
