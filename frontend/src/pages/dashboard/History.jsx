import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { 
  FaHistory, FaSearch, FaRobot, FaCalendarAlt, FaTrash, 
  FaChevronLeft, FaCommentDots, FaForumbee, FaDog, FaCat, FaStethoscope, FaFeather, FaPaw, FaFish, FaUserMd 
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const History = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. دریافت لیست نشست‌ها از سرور
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await client.get('/chat/sessions');
        setSessions(res.data);
      } catch (error) {
        console.error("History Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // 2. حذف یک گفتگو
  const handleDelete = async (e, sessionId) => {
      e.stopPropagation(); // جلوگیری از باز شدن چت وقتی دکمه حذف زده میشه
      if(!window.confirm("آیا از حذف این گفتگو مطمئن هستید؟")) return;

      try {
          await client.delete(`/chat/sessions/${sessionId}`);
          setSessions(prev => prev.filter(s => s._id !== sessionId));
          toast.success("گفتگو حذف شد");
      } catch (error) {
          toast.error("خطا در حذف");
      }
  };

  // 3. فیلتر کردن (جستجو در عنوان چت)
  const filteredSessions = sessions.filter(session => 
    session.title && session.title.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      
      {/* هدر صفحه */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <FaHistory size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">تاریخچه گفتگوها</h2>
            <p className="text-gray-400 text-xs mt-1">آرشیو تمام مشاوره‌های هوشمند شما</p>
          </div>
        </div>

        {/* سرچ باکس */}
        <div className="relative w-full md:w-72 group">
          <input 
            type="text" 
            placeholder="جستجو در عنوان گفتگو..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-100 outline-none transition text-sm shadow-inner group-hover:bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-3.5 text-gray-400 group-hover:text-blue-400 transition" />
        </div>
      </div>

      {/* لیست نشست‌ها */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-20">
             <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="text-gray-400 text-sm">در حال بارگذاری سوابق...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                <FaCommentDots size={40} />
            </div>
            <h3 className="text-gray-800 font-bold mb-2">هیچ گفتگویی یافت نشد</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
                شما هنوز هیچ مشاوره هوشمندی انجام نداده‌اید. برای شروع، یک ربات را انتخاب کنید.
            </p>
            <button 
                onClick={() => navigate('/dashboard/bots')}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 text-sm font-medium"
            >
                شروع اولین گفتگو
            </button>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div 
              key={session._id} 
              onClick={() => navigate(`/dashboard/chat/${session.botType}/${session._id}`)} // 👇 هدایت به چت
              className="group bg-white p-4 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer flex items-center justify-between relative overflow-hidden"
            >
              {/* نوار رنگی سمت راست */}
              <div className={`absolute right-0 top-0 bottom-0 w-1 ${getBotColor(session.botType)} rounded-r-2xl`}></div>

              <div className="flex items-center gap-4 flex-1 min-w-0 pr-3">
                {/* آیکون ربات */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl shadow-sm shrink-0 ${getBotColor(session.botType)}`}>
                    {getBotIcon(session.botType)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-800 truncate text-sm md:text-base group-hover:text-blue-600 transition">
                      {session.title || 'گفتگوی بدون عنوان'}
                    </h3>
                    {/* بج نوع ربات */}
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md border border-gray-200 hidden sm:inline-block">
                        {getBotName(session.botType)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <FaCalendarAlt />
                        {new Date(session.updatedAt).toLocaleDateString('fa-IR')}
                    </span>
                    <span className="flex items-center gap-1">
                        <FaRobot />
                        {session.botType} AI
                    </span>
                  </div>
                </div>
              </div>

              {/* دکمه‌ها (فلش و حذف) */}
              <div className="flex items-center gap-2 pl-2">
                 <button 
                    onClick={(e) => handleDelete(e, session._id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                    title="حذف تاریخچه"
                 >
                    <FaTrash size={14} />
                 </button>
                 <div className="p-2 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-500 transition">
                    <FaChevronLeft size={14} />
                 </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

// --- هلپر فانکشن‌ها برای آیکون و رنگ ---
const getBotIcon = (type) => {
    switch (type) {
        case 'bee': return <FaForumbee />;
        case 'dog': return <FaDog />;
        case 'cat': return <FaCat />;
        case 'cow': return <FaPaw />;
        case 'horse': return <FaStethoscope />;
        case 'poultry': return <FaFeather />;
        case 'fish': return <FaFish />;
        case 'general': return <FaUserMd />;
        default: return <FaRobot />;
    }
};

const getBotColor = (type) => {
    switch (type) {
        case 'bee': return 'bg-amber-500';
        case 'dog': return 'bg-orange-500';
        case 'cat': return 'bg-blue-500';
        case 'cow': return 'bg-green-600';
        case 'horse': return 'bg-yellow-600';
        case 'poultry': return 'bg-red-500';
        case 'fish': return 'bg-cyan-500';
        case 'general': return 'bg-indigo-600';
        default: return 'bg-slate-500';
    }
};

const getBotName = (type) => {
    const names = {
        bee: 'زنبور عسل', dog: 'سگ‌ها', cat: 'گربه‌ها', 
        cow: 'دام بزرگ', horse: 'اسب', poultry: 'طیور', 
        fish: 'آبزیان', general: 'عمومی'
    };
    return names[type] || 'عمومی';
};

export default History;
