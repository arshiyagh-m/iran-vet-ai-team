import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { 
  FaSearch, FaFilter, FaRobot, FaExclamationTriangle, FaUser, FaCheckCircle, FaEye, FaThumbsUp, FaThumbsDown 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AdminChatLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // استیت‌های مربوط به فیلترها
  const [filterType, setFilterType] = useState('all'); // all, fallback, database
  const [botFilter, setBotFilter] = useState('all'); // all, bee, dog, cat, etc.
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();

  // دریافت اطلاعات از سرور
  useEffect(() => {
    const fetchLogs = async () => {
      try {
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

  // لاجیک فیلتر ترکیبی (جستجو + نوع پاسخ + نوع ربات)
  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    
    // ۱. بررسی جستجوی متنی
    const matchesSearch = 
      (log.question && log.question.toLowerCase().includes(term)) || 
      (log.answer && log.answer.toLowerCase().includes(term)) ||
      (log.user?.fullName && log.user.fullName.toLowerCase().includes(term));
    
    // ۲. بررسی فیلتر وضعیت پاسخ (دیتابیس یا دانش عمومی)
    let matchesType = true;
    if (filterType === 'fallback') matchesType = log.isFallbackResponse === true;
    if (filterType === 'database') matchesType = log.isFallbackResponse === false;
    
    // ۳. بررسی فیلتر نوع ربات
    let matchesBot = true;
    if (botFilter !== 'all') matchesBot = log.botType === botFilter;
    
    // نمایش لاگ فقط در صورتی که هر سه شرط برقرار باشد
    return matchesSearch && matchesType && matchesBot;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* --- هدر و کنترل‌ها --- */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col xl:flex-row justify-between items-center gap-4">
        
        <div className="w-full xl:w-auto text-center xl:text-right">
            <h2 className="text-xl font-bold text-gray-800 flex items-center justify-center xl:justify-start gap-2">
            <FaRobot className="text-blue-600" />
            مانیتورینگ هوشمند چت‌ها
            </h2>
            <p className="text-gray-400 text-xs mt-1">بررسی پاسخ‌های ربات و منابع استفاده شده</p>
        </div>

        {/* بخش فیلترها */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-center xl:justify-end gap-3 w-full xl:w-auto">
          
          {/* ۱. باکس جستجو */}
          <div className="relative flex-grow sm:flex-grow-0">
            <input 
              type="text" 
              placeholder="جستجو در سوال، جواب..." 
              className="pl-4 pr-10 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none w-full sm:w-60 transition text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute right-3 top-3.5 text-gray-400" />
          </div>

          {/* ۲. فیلتر انتخاب ربات */}
          <div className="relative flex-grow sm:flex-grow-0">
            <select 
              className="pl-4 pr-10 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none appearance-none w-full sm:w-44 cursor-pointer text-sm font-medium"
              value={botFilter}
              onChange={(e) => setBotFilter(e.target.value)}
            >
              <option value="all">همه ربات‌ها</option>
              <option value="general">دامپزشک عمومی</option>
              <option value="bee">زنبور عسل</option>
              <option value="dog">سگ‌ها</option>
              <option value="cat">گربه‌ها</option>
              <option value="cow">دام بزرگ</option>
              <option value="horse">اسب</option>
              <option value="poultry">طیور صنعتی</option>
              <option value="fish">آبزیان</option>
            </select>
            <FaRobot className="absolute right-3 top-3.5 text-gray-400" />
          </div>

          {/* ۳. فیلتر وضعیت پاسخ */}
          <div className="relative flex-grow sm:flex-grow-0">
            <select 
              className="pl-4 pr-10 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none appearance-none w-full sm:w-48 cursor-pointer text-sm font-medium"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="database">✅ پاسخ از دیتابیس</option>
              <option value="fallback">⚠️ پاسخ عمومی (AI)</option>
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
                  <th className="p-4 w-1/4 min-w-[200px]">سوال و جواب</th>
                  <th className="p-4 w-1/4 min-w-[150px]">منبع پاسخ (Reference)</th>
                  <th className="p-4 text-center">فیدبک</th>
                  <th className="p-4 text-center">وضعیت</th>
                  <th className="p-4 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLogs.map((log) => (
                  <tr 
                    key={log._id} 
                    className={`transition hover:bg-gray-50`}
                  >
                    
                    {/* کاربر */}
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                          <FaUser size={12} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-700">
                            {log.user?.fullName || 'کاربر حذف شده'}
                            </span>
                            <span className="text-[10px] text-gray-400">{log.user?.phone}</span>
                            <span className={`mt-1 px-1.5 py-0.5 rounded text-[10px] border w-fit ${getBotBadgeStyle(log.botType)}`}>
                                {translateBotType(log.botType)}
                            </span>
                        </div>
                      </div>
                    </td>

                    {/* سوال و جواب (خلاصه) */}
                    <td className="p-4 align-top">
                      <div className="space-y-2">
                          <div className="bg-blue-50 p-2 rounded-lg text-xs text-blue-800 border border-blue-100 line-clamp-2" title={log.question}>
                              <span className="font-bold">س: </span>{log.question}
                          </div>
                          <div className="bg-gray-50 p-2 rounded-lg text-xs text-gray-600 border border-gray-100 line-clamp-2" title={log.answer}>
                              <span className="font-bold">ج: </span>{log.answer}
                          </div>
                      </div>
                    </td>

                    {/* منبع پاسخ (مهم) */}
                    <td className="p-4 align-top">
                        {log.isFallbackResponse ? (
                            <div className="flex items-start gap-1 text-orange-600 text-xs font-bold bg-orange-50 p-2 rounded-lg border border-orange-100">
                                <FaExclamationTriangle className="mt-0.5 shrink-0" />
                                <div>
                                    <p>دانش عمومی (AI)</p>
                                    <p className="text-[10px] font-normal opacity-80 mt-1">بدون منبع داخلی</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start gap-1 text-green-700 text-xs font-bold bg-green-50 p-2 rounded-lg border border-green-100">
                                <FaCheckCircle className="mt-0.5 shrink-0" />
                                <div>
                                    <p>دیتابیس تخصصی</p>
                                    <p className="text-[10px] font-normal text-gray-600 mt-1 line-clamp-2" title={log.reference}>
                                        {log.reference || 'منبع نامشخص'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </td>

                    {/* فیدبک کاربر */}
                    <td className="p-4 text-center align-middle">
                        {log.feedback === 'like' && <div className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold"><FaThumbsUp /> مفید</div>}
                        {log.feedback === 'dislike' && <div className="inline-flex items-center gap-1 text-red-500 bg-red-50 px-2 py-1 rounded-full text-xs font-bold"><FaThumbsDown /> نامفید</div>}
                        {!log.feedback && <span className="text-gray-300 text-xs">-</span>}
                    </td>

                    {/* زمان */}
                    <td className="p-4 text-center align-middle">
                      <div className="text-xs font-medium text-gray-500">
                        {new Date(log.timestamp).toLocaleDateString('fa-IR')}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {new Date(log.timestamp).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </td>

                    {/* دکمه مشاهده */}
                    <td className="p-4 text-center align-middle">
                        <button 
                            onClick={() => navigate(`/admin/chat-session/${log.session}`)}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 p-2 rounded-xl transition shadow-sm border border-blue-100 group"
                            title="مشاهده کامل گفتگو"
                        >
                            <FaEye className="text-lg group-hover:scale-110 transition-transform" />
                        </button>
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
        case 'cow': return 'bg-green-100 text-green-700 border-green-200';
        case 'horse': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'poultry': return 'bg-red-100 text-red-700 border-red-200';
        case 'fish': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
        case 'general': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
        default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
};

// تابع کمکی برای ترجمه نام ربات‌ها در جدول
const translateBotType = (type) => {
    const types = {
        'bee': 'زنبور عسل',
        'dog': 'سگ‌ها',
        'cat': 'گربه‌ها',
        'cow': 'دام بزرگ',
        'horse': 'اسب',
        'poultry': 'طیور',
        'fish': 'آبزیان',
        'general': 'عمومی'
    };
    return types[type] || type;
};

export default AdminChatLogs;
