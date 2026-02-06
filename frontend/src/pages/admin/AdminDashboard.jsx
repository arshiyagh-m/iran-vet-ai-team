import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { FaUsers, FaComments, FaDatabase, FaTicketAlt } from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalChats: 0, pendingTickets: 0, totalKnowledge: 0 });

  useEffect(() => {
    client.get('/admin/stats').then(res => setStats(res.data)).catch(console.error);
  }, []);

  const cards = [
    { title: 'کاربران', value: stats.totalUsers, icon: <FaUsers />, color: 'bg-blue-500' },
    { title: 'چت‌های انجام شده', value: stats.totalChats, icon: <FaComments />, color: 'bg-green-500' },
    { title: 'اسناد علمی', value: stats.totalKnowledge, icon: <FaDatabase />, color: 'bg-purple-500' },
    { title: 'تیکت‌های باز', value: stats.pendingTickets, icon: <FaTicketAlt />, color: 'bg-red-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">پیشخوان مدیریت</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className={`${card.color} text-white p-6 rounded-2xl shadow-lg flex items-center justify-between`}>
            <div>
              <p className="text-sm opacity-80">{card.title}</p>
              <h3 className="text-3xl font-bold mt-1">{card.value}</h3>
            </div>
            <div className="text-4xl opacity-30">{card.icon}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AdminDashboard;
