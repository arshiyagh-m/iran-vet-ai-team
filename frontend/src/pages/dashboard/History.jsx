import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { FaHistory, FaSearch, FaRobot, FaCalendarAlt, FaTimes, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';

const History = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // استیت برای مودال جزئیات
  const [selectedChat, setSelectedChat] = useState(null);

  // دریافت تاریخچه واقعی از سرور
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await client.get('/chat/history'); // روت جدیدی که ساختیم
        setChats(res.data);
      } catch (error) {
        console.error(error);
        toast.error('خطا در دریافت تاریخچه');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // فیلتر کردن جستجو
  const filteredChats = chats.filter(chat => 
    chat.question.includes(searchTerm) || chat.answer.includes(searchTerm)
  );

  return (
    <div className="space-y-6 relative">
      
      {/* هدر صفحه */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaHistory className="text-blue-600" />
            تاریخچه گفتگوها
          </h2>
          <p className="text-gray-500 text-sm mt-1">آرشیو تمام سوالات و پاسخ‌های هوش مصنوعی</p>
        </div>

        {/* جستجو */}
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="جستجو در تاریخچه..." 
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
          <div className="p-8 text-center text-gray-500">در حال دریافت اطلاعات...</div>
        ) : filteredChats.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center text-gray-400">
            <FaRobot size={40} className="mb-4 opacity-50" />
            <p>هنوز هیچ گفتگویی ثبت نشده است.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredChats.map((chat) => (
              <div 
                key={chat._id} 
                onClick={() => setSelectedChat(chat)} // 👇 با کلیک روی آیتم، مودال باز میشه
                className="p-5 hover:bg-blue-50/50 transition cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs px-2 py-1 rounded-lg font-bold ${getBotBadgeColor(chat.botType)}`}>
                    {chat.botType || 'General'}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                        <FaCalendarAlt />
                        {new Date(chat.timestamp).toLocaleDateString('fa-IR')}
                    </span>
                    <FaEye className="text-gray-300 group-hover:text-blue-500 transition" />
                  </div>
                </div>
                
                <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{chat.question}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{chat.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 👇 مودال نمایش جزئیات (Pop-up) */}
      {selectedChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl relative">
            
            {/* دکمه بستن */}
            <button 
              onClick={() => setSelectedChat(null)}
              className="absolute top-4 left-4 p-2 bg-gray-100 hover:bg-red-100 hover:text-red-600 rounded-full transition"
            >
              <FaTimes />
            </button>

            <div className="p-8">
              <h3 className="text-center text-xl font-bold text-gray-800 mb-6 border-b pb-4">
                جزئیات گفتگو
              </h3>

              {/* سوال کاربر */}
              <div className="mb-6">
                <div className="text-xs text-gray-400 mb-2 font-bold">سوال شما:</div>
                <div className="bg-blue-50 p-4 rounded-2xl text-gray-800 leading-relaxed border border-blue-100">
                  {selectedChat.question}
                </div>
              </div>

              {/* جواب هوش مصنوعی */}
              <div>
                <div className="text-xs text-gray-400 mb-2 font-bold flex justify-between">
                    <span>پاسخ هوش مصنوعی:</span>
                    {selectedChat.isFallbackResponse && (
                        <span className="text-orange-500 text-[10px]">(پاسخ عمومی)</span>
                    )}
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl text-gray-700 leading-relaxed border border-gray-200 whitespace-pre-line">
                  {selectedChat.answer}
                </div>
              </div>

              {/* فوتر مودال */}
              {selectedChat.reference && (
                  <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400">
                      منبع: {selectedChat.reference}
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
        case 'bee': return 'bg-amber-100 text-amber-700';
        case 'dog': return 'bg-orange-100 text-orange-700';
        case 'cat': return 'bg-blue-100 text-blue-700';
        case 'cow': return 'bg-green-100 text-green-700';
        default: return 'bg-gray-100 text-gray-600';
    }
};

export default History;
