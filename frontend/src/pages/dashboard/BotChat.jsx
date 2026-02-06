import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPaperPlane, FaUser, FaRobot, FaArrowRight, FaSpinner, FaDog, FaCat, FaFeather, FaStethoscope, FaPaw } from 'react-icons/fa';
import client from '../../api/client'; // کلاینت API خودمان

// تنظیمات تم برای هر ربات
const botConfig = {
  bee: {
    name: 'هوش مصنوعی زنبور عسل',
    icon: <FaFeather className="rotate-45" />, // آیکون موقت زنبور
    themeColor: 'bg-amber-500',
    textColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    userMsgColor: 'bg-amber-600',
    welcome: 'سلام! من دستیار تخصصی زنبورداری هستم. درباره بیماری‌های کندو، تولید عسل یا ملکه سوالی دارید؟ 🐝',
    apiEndpoint: '/chat/bee' // اندپوینت اختصاصی بک‌اند برای زنبور
  },
  dog: {
    name: 'دستیار سگ‌ها',
    icon: <FaDog />,
    themeColor: 'bg-orange-500',
    textColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
    userMsgColor: 'bg-orange-600',
    welcome: 'هاپ! من متخصص سگ‌ها هستم. درباره نژاد، تغذیه یا بیماری سگتون بپرسید. 🐕',
    apiEndpoint: '/chat/dog'
  },
  cat: {
    name: 'دستیار گربه‌ها',
    icon: <FaCat />,
    themeColor: 'bg-blue-500',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    userMsgColor: 'bg-blue-600',
    welcome: 'میو! من متخصص گربه‌ها هستم. چطور می‌تونم به پیشی ملوس شما کمک کنم؟ 🐈',
    apiEndpoint: '/chat/cat'
  },
  cow: {
    name: 'دستیار دام بزرگ',
    icon: <FaPaw />,
    themeColor: 'bg-green-600',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    userMsgColor: 'bg-green-700',
    welcome: 'سلام. من در زمینه مدیریت گاوداری و بیماری‌های دام بزرگ تخصص دارم. 🐄',
    apiEndpoint: '/chat/cow'
  },
  // تم پیش‌فرض برای بقیه
  default: {
    name: 'دستیار عمومی',
    icon: <FaRobot />,
    themeColor: 'bg-slate-800',
    textColor: 'text-slate-800',
    bgColor: 'bg-gray-50',
    userMsgColor: 'bg-slate-900',
    welcome: 'سلام! چطور می‌توانم کمکتان کنم؟',
    apiEndpoint: '/chat/general'
  }
};

const BotChat = () => {
  const { type } = useParams(); // گرفتن نوع ربات از آدرس URL
  const navigate = useNavigate();
  const endRef = useRef(null);
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // انتخاب تنظیمات بر اساس نوع ربات
  const currentBot = botConfig[type] || botConfig.default;

  // تنظیم پیام خوش‌آمدگویی هنگام باز شدن صفحه
  useEffect(() => {
    setMessages([{ role: 'bot', text: currentBot.welcome }]);
  }, [type]);

  // اسکرول خودکار به پایین
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput(''); // خالی کردن اینپوت
    
    // اضافه کردن پیام کاربر به لیست
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      // ارسال درخواست به سرور
      // ما نوع بات (type) را هم می‌فرستیم تا سرور بداند از کدام دیتابیس استفاده کند
      const res = await client.post('/chat', {
        message: userText,
        botType: type // مثلا 'bee' یا 'dog'
      });

      // اضافه کردن جواب ربات
      setMessages(prev => [...prev, { role: 'bot', text: res.data.response }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'bot', text: 'خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.', isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-6rem)] rounded-3xl overflow-hidden shadow-2xl border border-gray-100 ${currentBot.bgColor}`}>
      
      {/* 1. هدر اختصاصی */}
      <div className={`${currentBot.themeColor} p-4 flex items-center gap-4 text-white shadow-md z-10`}>
        <button onClick={() => navigate('/bots')} className="p-2 hover:bg-white/20 rounded-full transition">
          <FaArrowRight />
        </button>
        <div className="bg-white/20 p-2 rounded-xl text-2xl">
          {currentBot.icon}
        </div>
        <div>
          <h2 className="font-bold text-lg">{currentBot.name}</h2>
          <span className="text-xs text-white/80 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> آنلاین
          </span>
        </div>
      </div>

      {/* 2. محیط چت */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              max-w-[80%] p-4 rounded-2xl text-sm leading-7 shadow-sm
              ${msg.role === 'user' 
                ? `${currentBot.userMsgColor} text-white rounded-br-none` 
                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}
              ${msg.isError ? 'bg-red-100 text-red-600 border-red-200' : ''}
            `}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex gap-2 items-center text-gray-400 text-xs">
              <FaSpinner className="animate-spin" /> در حال نوشتن...
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* 3. ورودی متن */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="پیام خود را بنویسید..."
            disabled={loading}
            className={`w-full pl-4 pr-4 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white outline-none transition
              focus:border-${currentBot.textColor.split('-')[1]}-400 text-gray-700 placeholder-gray-400`}
             // نکته: کلاس‌های داینامیک تیلویند گاهی کار نمی‌کنند، اگر رنگ بردر نیامد مهم نیست، استایل کلی حفظ می‌شود
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            className={`
              absolute left-2 p-3 rounded-xl text-white transition shadow-lg
              ${loading || !input.trim() ? 'bg-gray-300' : `${currentBot.themeColor} hover:opacity-90 transform active:scale-95`}
            `}
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane className="text-lg" />}
          </button>
        </form>
      </div>

    </div>
  );
};

export default BotChat;
          
