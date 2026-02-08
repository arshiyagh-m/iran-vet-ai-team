import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaPaperPlane, FaArrowRight, FaSpinner, FaRobot, 
  FaDog, FaCat, FaFeather, FaStethoscope, FaPaw, FaFish, FaForumbee, FaPlus, FaUserMd 
} from 'react-icons/fa';
import client from '../../api/client';
import { toast } from 'react-toastify';

// تنظیمات تم برای هر ربات
const botConfig = {
  general: {
    name: 'دامپزشک عمومی',
    icon: <FaUserMd />,
    themeColor: 'bg-indigo-600',
    welcome: 'سلام! من دامپزشک عمومی هستم. هر سوالی دارید بپرسید. 🩺',
  },
  bee: {
    name: 'هوش مصنوعی زنبور عسل',
    icon: <FaForumbee />, 
    themeColor: 'bg-amber-500',
    welcome: 'سلام! من دستیار تخصصی زنبورداری هستم. درباره بیماری‌های کندو سوالی دارید؟ 🐝',
  },
  dog: {
    name: 'دستیار سگ‌ها',
    icon: <FaDog />,
    themeColor: 'bg-orange-500',
    welcome: 'هاپ! من متخصص سگ‌ها هستم. درباره نژاد یا بیماری سگتون بپرسید. 🐕',
  },
  cat: {
    name: 'دستیار گربه‌ها',
    icon: <FaCat />,
    themeColor: 'bg-blue-500',
    welcome: 'میو! من متخصص گربه‌ها هستم. چطور می‌تونم کمک کنم؟ 🐈',
  },
  cow: {
    name: 'دستیار دام بزرگ',
    icon: <FaPaw />,
    themeColor: 'bg-green-600',
    welcome: 'سلام. من در زمینه مدیریت گاوداری و بیماری‌های دام شیری تخصص دارم. 🐄',
  },
  horse: {
    name: 'دستیار اسب',
    icon: <FaStethoscope />,
    themeColor: 'bg-yellow-700',
    welcome: 'سلام. من متخصص بیماری‌ها و نگهداری اسب هستم. 🐎',
  },
  poultry: {
    name: 'دستیار طیور',
    icon: <FaFeather />,
    themeColor: 'bg-red-500',
    welcome: 'سلام. در زمینه مرغداری و بیماری‌های طیور در خدمتم. 🐓',
  },
  fish: {
    name: 'دستیار آبزیان',
    icon: <FaFish />,
    themeColor: 'bg-cyan-600',
    welcome: 'سلام. سوالات پرورش ماهی را بپرسید. 🐟',
  },
  default: {
    name: 'دستیار هوشمند',
    icon: <FaRobot />,
    themeColor: 'bg-slate-700',
    welcome: 'سلام! چطور می‌توانم کمکتان کنم؟',
  }
};

const BotChat = () => {
  const { type, sessionId: urlSessionId } = useParams(); // اگر در URL سشن آیدی بود
  const navigate = useNavigate();
  const location = useLocation();
  const endRef = useRef(null);
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null); // مدیریت سشن فعلی

  const currentBot = botConfig[type] || botConfig.default;

  // 1. لود اولیه (New Chat یا History)
  useEffect(() => {
    if (urlSessionId) {
        // اگر آیدی سشن در URL بود، پیام‌های آن را لود کن
        loadSessionHistory(urlSessionId);
    } else {
        // اگر نبود (New Chat)، ریست کن و پیام خوش‌آمدگویی بگذار
        setCurrentSessionId(null);
        setMessages([{ role: 'assistant', content: currentBot.welcome }]);
    }
  }, [urlSessionId, type]);

  // اسکرول به پایین با هر پیام جدید
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // تابع لود تاریخچه یک سشن
  const loadSessionHistory = async (id) => {
      try {
          setLoading(true);
          const res = await client.get(`/chat/sessions/${id}`);
          // تبدیل فرمت دیتابیس به فرمت نمایش (question -> user, answer -> assistant)
          const formattedMsgs = res.data.flatMap(log => [
              { role: 'user', content: log.question },
              { role: 'assistant', content: log.answer }
          ]);
          setMessages(formattedMsgs);
          setCurrentSessionId(id);
      } catch (error) {
          toast.error('خطا در بارگذاری تاریخچه گفتگو');
          navigate(`/dashboard/chat/${type}`); // اگر سشن نبود، برو به چت جدید
      } finally {
          setLoading(false);
      }
  };

  // شروع چت جدید (دکمه +)
  const handleNewChat = () => {
      navigate(`/dashboard/chat/${type}`); // تغییر URL به حالت بدون ID
      setCurrentSessionId(null);
      setMessages([{ role: 'assistant', content: currentBot.welcome }]);
  };

  // ارسال پیام
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput(''); 
    
    // نمایش پیام کاربر در لحظه
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    try {
      // ارسال به سرور (اگر سشن داریم، آیدیش رو می‌فرستیم)
      const res = await client.post('/chat', {
        message: userText,
        botType: type,
        sessionId: currentSessionId // 👈 نکته کلیدی: ارسال ID سشن برای حفظ حافظه
      });

      // نمایش پاسخ ربات
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);

      // اگر سشن جدید ساخته شده، آیدیش رو ذخیره کن
      if (!currentSessionId && res.data.sessionId) {
          setCurrentSessionId(res.data.sessionId);
          // آپدیت URL بدون رفرش (اختیاری: برای اینکه اگر رفرش کرد نپره)
          window.history.replaceState(null, '', `/dashboard/chat/${type}/${res.data.sessionId}`);
          // تریگر کردن آپدیت سایدبار (اگر سایدبار دارید)
          window.dispatchEvent(new Event("sessionUpdated"));
      }

      // آپدیت توکن در لوکال استوریج
      if (res.data.remainingTokens !== undefined) {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser) {
            const updatedUser = { ...currentUser, tokens: res.data.remainingTokens };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.dispatchEvent(new Event("storage")); // برای آپدیت هدر
        }
      }

    } catch (error) {
      console.error("Chat Error:", error);
      let errorMsg = 'خطا در ارتباط با سرور.';
      if (error.response?.status === 403) errorMsg = 'اعتبار توکن شما تمام شده است. ⛔';
      
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg, isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 relative">
      
      {/* هدر چت */}
      <div className={`${currentBot.themeColor} p-4 flex items-center justify-between text-white shadow-md z-10`}>
        <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard/bots')} className="p-2 hover:bg-white/20 rounded-full transition">
              <FaArrowRight />
            </button>
            <div className="bg-white/20 p-2 rounded-xl text-2xl backdrop-blur-sm">
              {currentBot.icon}
            </div>
            <div>
              <h2 className="font-bold text-lg">{currentBot.name}</h2>
              <span className="text-xs text-white/80 flex items-center gap-1">
                {currentSessionId ? 'ادامه گفتگو' : 'گفتگوی جدید'}
              </span>
            </div>
        </div>

        {/* دکمه چت جدید */}
        <button 
            onClick={handleNewChat}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm transition"
            title="شروع گفتگوی جدید"
        >
            <FaPlus /> <span className="hidden sm:inline">چت جدید</span>
        </button>
      </div>

      {/* ناحیه پیام‌ها */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            
            {/* آواتار ربات (فقط برای پیام‌های ربات) */}
            {msg.role === 'assistant' && (
                <div className={`w-8 h-8 rounded-full ${currentBot.themeColor} text-white flex items-center justify-center text-sm ml-2 shrink-0 self-end mb-1 shadow-sm`}>
                    {currentBot.icon}
                </div>
            )}

            <div className={`
              max-w-[85%] md:max-w-[75%] p-3.5 rounded-2xl text-sm leading-7 shadow-sm whitespace-pre-line
              ${msg.role === 'user' 
                ? `${currentBot.themeColor} text-white rounded-br-none shadow-md` 
                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}
              ${msg.isError ? 'bg-red-50 text-red-600 border border-red-200' : ''}
            `}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start items-center gap-2 mt-2">
             <div className={`w-8 h-8 rounded-full ${currentBot.themeColor} text-white flex items-center justify-center text-sm ml-2 shrink-0 shadow-sm opacity-50`}>
                {currentBot.icon}
             </div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex gap-2 items-center text-gray-500 text-xs">
              <FaSpinner className="animate-spin" /> در حال تحلیل...
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* اینپوت ارسال پیام */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="پیام خود را بنویسید..."
            disabled={loading}
            className="w-full pl-4 pr-14 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-gray-200 outline-none transition text-gray-700 placeholder-gray-400 shadow-inner"
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            className={`
              absolute left-2 p-3 rounded-xl text-white transition-all duration-200 shadow-md flex items-center justify-center
              ${loading || !input.trim() 
                ? 'bg-gray-300 cursor-not-allowed' 
                : `${currentBot.themeColor} hover:brightness-110 active:scale-95`}
            `}
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane className="text-lg -ml-0.5" />}
          </button>
        </form>
      </div>

    </div>
  );
};

export default BotChat;
