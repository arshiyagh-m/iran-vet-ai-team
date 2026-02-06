import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { FaFilter, FaRobot, FaUser } from 'react-icons/fa';

const AdminChatLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all'); // all | fallback

  useEffect(() => {
    const query = filter === 'fallback' ? '?filter=fallback' : '';
    client.get(`/admin/chats${query}`).then(res => setLogs(res.data));
  }, [filter]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
            <FaRobot className="text-blue-600" /> مانیتورینگ چت‌ها
        </h2>
        <div className="flex gap-2">
            <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>همه</button>
            <button onClick={() => setFilter('fallback')} className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${filter === 'fallback' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600'}`}>
                <FaFilter /> فقط موارد فال‌بک (ناقص)
            </button>
        </div>
      </div>

      <div className="space-y-4">
        {logs.map(log => (
            <div key={log._id} className={`p-4 rounded-xl border ${log.isFallbackResponse ? 'border-orange-200 bg-orange-50' : 'border-gray-100 bg-gray-50'}`}>
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1"><FaUser /> {log.user?.fullName || 'کاربر حذف شده'}</span>
                    <span>{new Date(log.timestamp).toLocaleString('fa-IR')}</span>
                    <span className="font-bold bg-white px-2 py-0.5 rounded border">{log.botType}</span>
                </div>
                <div className="mb-2">
                    <span className="text-xs font-bold text-gray-400">سوال:</span>
                    <p className="font-bold text-gray-800">{log.question}</p>
                </div>
                <div>
                    <span className="text-xs font-bold text-gray-400">پاسخ ربات:</span>
                    <p className="text-sm text-gray-600 leading-relaxed">{log.answer}</p>
                </div>
                {log.isFallbackResponse && (
                    <div className="mt-2 text-xs text-orange-600 font-bold flex items-center gap-1">
                        ⚠️ این سوال در دیتابیس نبود و با دانش عمومی پاسخ داده شد.
                    </div>
                )}
            </div>
        ))}
      </div>
    </div>
  );
};
export default AdminChatLogs;

