import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { FaHistory, FaSearch, FaRobot, FaCalendarAlt, FaTimes, FaEye, FaChevronLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';

const History = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // استیت برای مودال جزئیات (وقتی روی یک چت کلیک میشه این پر میشه)
  const [selectedChat, setSelectedChat] = useState(null);

  // دریافت تاریخچه واقعی از سرور
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await client.get('/chat/history');
        setChats(res.data);
      } catch (error) {
        console.error("History Error:", error);
        // اگر هنوز چتی نکرده باشی ارور 404 یا آرایه خالی طبیعیه، پس ارور نشون نمیدیم
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // فیلتر کردن بر اساس جستجو
  const filteredChats = chats.filter(chat => 
    (chat.question && chat.question.includes(searchTerm)) || 
    (chat.answer && chat.answer.includes(searchTerm))
  );

  return (
    <div className="space-y-6 relative min-h-screen pb-10">
      
      {/* هدر صفحه */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaHistory className="text-blue-600" />
            تاریخچه مشاوره‌ها
          </h2>
          <p className="text-gray-500 text-sm mt-1">آرشیو تمام گفتگوهای شما با هوش مصنوعی</p>
        </div>

        {/* جستجو */}
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="جستجو در متن..." 
            className="w-full pl-4 pr-10 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 outline-none transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute right-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* لیست چت‌ها */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
             <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
             <span className="text-gray-500">در حال دریافت اطلاعات...</span>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center text-gray-400">
            <FaRobot size={60} className="mb-4 opacity-20" />
            <p className="text-lg font-medium">هنوز هیچ مشاوره ای ثبت نشده است.</p>
            <p className="text-sm mt-2">به بخش "ربات‌ها" بروید و اولین سوال خود را بپرسید!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredChats.map((chat) => (
              <div 
                key={chat._id} 
                onClick={() => setSelectedChat(chat)} // 👇 باز کردن جزئیات
                className="p-5 hover:bg-blue-50/40 transition cursor-pointer group flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getBotBadgeColor(chat.botType)}`}>
                      {chat.botType || 'General'}
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <FaCalendarAlt size={10} />
                        {new Date(chat.timestamp).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-gray-800 text-sm md:text-base mb-1 truncate pl-4">
                    {chat.question}
                  </h3>
                  <p className="text-xs text-gray-500 truncate pl-4 opacity-70">
                    {chat.answer ? chat.answer.substring(0, 60) + "..." : "..."}
                  </p>
                </div>

                <div className="mr-4">
                   <button className="p-2 text-gray-300 group-hover:text-blue-500 transition">
                      <FaChevronLeft />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 👇 مودال نمایش جزئیات (Pop-up) */}
      {selectedChat && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedChat(null)}>
          <div 
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl relative flex flex-col"
            onClick={(e) => e.stopPropagation()} // جلوگیری از بسته شدن با کلیک روی خود مودال
          >
            
            {/* هدر مودال */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
               <h3 className="font-bold text-gray-800 flex items-center gap-2">
                 <FaEye className="text-blue-500" />
                 جزئیات مشاوره
               </h3>
               <button 
                 onClick={() => setSelectedChat(null)}
                 className="p-2 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition shadow-sm border border-gray-100"
               >
                 <FaTimes />
               </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              
              {/* سوال کاربر */}
              <div className="mb-6">
                <div className="text-xs text-gray-400 mb-2 font-bold pr-1">سوال شما:</div>
                <div className="bg-blue-50/80 p-4 rounded-2xl rounded-tr-none text-gray-800 leading-relaxed border border-blue-100 shadow-sm">
                  {selectedChat.question}
                </div>
              </div>

              {/* جواب هوش مصنوعی */}
              <div>
                <div className="text-xs text-gray-400 mb-2 font-bold pr-1 flex justify-between items-center">
                    <span>پاسخ هوش مصنوعی:</span>
                    {selectedChat.isFallbackResponse && (
                        <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[10px] border border-amber-100">پاسخ عمومی</span>
                    )}
                </div>
                <div className="bg-white p-5 rounded-2xl rounded-tl-none text-gray-700 leading-8 border border-gray-200 shadow-sm whitespace-pre-line text-justify">
                  {selectedChat.answer}
                </div>
              </div>

              {/* منابع */}
              {selectedChat.reference && (
                  <div className="mt-8 pt-4 border-t border-dashed border-gray-200">
                      <div className="text-[10px] uppercase text-gray-400 font-bold mb-1">منبع استفاده شده:</div>
                      <div className="text-xs text-gray-500 bg-gray-50 inline-block px-3 py-1 rounded border border-gray-100">
                        {selectedChat.reference}
                      </div>
                  </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

// رنگ‌بندی بج‌ها بر اساس نوع ربات
const getBotBadgeColor = (type) => {
    switch (type) {
        case 'bee': return 'bg-amber-50 text-amber-600 border-amber-100';
        case 'dog': return 'bg-orange-50 text-orange-600 border-orange-100';
        case 'cat': return 'bg-blue-50 text-blue-600 border-blue-100';
        case 'cow': return 'bg-green-50 text-green-600 border-green-100';
        case 'horse': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
        case 'poultry': return 'bg-red-50 text-red-600 border-red-100';
        case 'fish': return 'bg-cyan-50 text-cyan-600 border-cyan-100';
        default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
};

export default History;
