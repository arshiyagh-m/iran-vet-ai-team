import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { 
  FaSearch, FaFilter, FaRobot, FaDatabase, FaExclamationTriangle, FaUser, FaCheckCircle 
} from 'react-icons/fa';

const AdminChatLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, fallback, database
  const [searchTerm, setSearchTerm] = useState('');

  // دریافت اطلاعات از سرور
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // مطمئن شوید آدرس API با روت‌های بک‌اند شما (adminRoutes) یکی باشد
        const res = await client.get('/admin/chat-logs'); 
        setLogs(res.data);
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // لاجیک فیلتر و جستجو
  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    
    // جستجو در نام کاربر، سوال و جواب
    const matchesSearch = 
      (log.question && log.question.toLowerCase().includes(term)) || 
      (log.answer && log.answer.toLowerCase().includes(term)) ||
      (log.user?.fullName && log.user.fullName.toLowerCase().includes(term));
    
    // فیلتر بر اساس نوع پاسخ
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'fallback') return matchesSearch && log.isFallbackResponse; // 🔴 فقط قرمزها (هوش مصنوعی)
    if (filterType === 'database') return matchesSearch && !log.isFallbackResponse; // 🟢 فقط سبزها (دیتابیس)
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* --- هدر و کنترل‌ها --- */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col lg:flex-row justify-between items-center gap-4">
        
        <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaRobot className="text-blue-600" />
            مانیتورینگ پاسخ‌های هوش مصنوعی
            </h2>
            <p className="text-gray-400 text-xs mt-1">بررسی کنید ربات چه پاسخ‌هایی به کاربران می‌دهد</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* باکس جستجو */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="جستجو در سوال، جواب یا کاربر..." 
              className="pl-4 pr-10 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none w-full sm:w-72 transition text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute right-3 top-3.5 text-gray-400" />
          </div>

          {/* فیلتر وضعیت */}
          <div className="relative">
            <select 
              className="pl-4 pr-10 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none appearance-none w-full sm:w-52 cursor-pointer text-sm font-medium"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">همه گفتگوها</option>
              <option value="database">✅ معتبر (از دیتابیس)</option>
              <option value="fallback">⚠️ نامعتبر (خارج از دیتابیس)</option>
            </select>
            <FaFilter className="absolute right-3 top-3.5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* --- جدول داده‌ها --- */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-2">
             <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
             <span>در حال دریافت لاگ‌ها...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
            <div className="p-10 text-center text-gray-400">موردی یافت نشد.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
                <tr>
                  <th className="p-4 whitespace-nowrap">کاربر</th>
                  <th className="p-4 whitespace-nowrap">نوع ربات</th>
                  <th className="p-4 w-1/3 min-w-[200px]">سوال کاربر</th>
                  <th className="p-4 w-1/3 min-w-[200px]">پاسخ سیستم</th>
                  <th className="p-4 whitespace-nowrap text-center">وضعیت پاسخ</th>
                  <th className="p-4 whitespace-nowrap text-left">زمان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLogs.map((log) => (
                  <tr 
                    key={log._id} 
                    className={`transition hover:bg-opacity-80 ${
                        log.isFallbackResponse 
                            ? 'bg-red-50/70 hover:bg-red-100/50' // 🔴 استایل قرمز برای فال‌بک
                            : 'bg-white hover:bg-gray-50' // ⚪️ استایل سفید برای عادی
                    }`}
                  >
                    
                    {/* کاربر */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                          <FaUser size={12} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-700">
                            {log.user?.fullName || 'کاربر حذف شده'}
                            </span>
                            <span className="text-[10px] text-gray-400">{log.user?.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* نوع ربات */}
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${getBotBadgeStyle(log.botType)}`}>
                        {log.botType}
                      </span>
                    </td>

                    {/* سوال */}
                    <td className="p-4 align-top">
                      <p className="text-sm text-gray-800 line-clamp-2 leading-relaxed" title={log.question}>
                        {log.question}
                      </p>
                    </td>

                    {/* پاسخ */}
                    <td className="p-4 align-top">
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed" title={log.answer}>
                        {log.answer}
                      </p>
                    </td>

                    {/* وضعیت (منبع) - بخش رنگی اصلی */}
                    <td className="p-4 text-center">
                      {log.isFallbackResponse ? (
                        <div className="inline-flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1 text-red-700 bg-red-200/50 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
                                <FaExclamationTriangle />
                                هوش مصنوعی
                            </div>
                            <span className="text-[10px] text-red-400">خارج از دیتابیس</span>
                        </div>
                      ) : (
                        <div className="inline-flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1 text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                                <FaCheckCircle />
                                دیتابیس
                            </div>
                            <span className="text-[10px] text-gray-400 max-w-[100px] truncate" title={log.reference}>
                                {log.reference || 'سند داخلی'}
                            </span>
                        </div>
                      )}
                    </td>

                    {/* تاریخ */}
                    <td className="p-4 text-left">
                      <div className="text-xs font-medium text-gray-600">
                        {new Date(log.timestamp).toLocaleDateString('fa-IR')}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">
                        {new Date(log.timestamp).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// تابع کمکی برای استایل بج ربات‌ها
const getBotBadgeStyle = (type) => {
    switch(type) {
        case 'bee': return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'dog': return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'cat': return 'bg-blue-100 text-blue-700 border-blue-200';
        default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
}

export default AdminChatLogs;
