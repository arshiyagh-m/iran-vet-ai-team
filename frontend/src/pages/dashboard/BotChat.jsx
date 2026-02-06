import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaPaperPlane, FaArrowRight, FaSpinner, FaRobot, 
  FaDog, FaCat, FaFeather, FaStethoscope, FaPaw, FaFish, FaForumbee 
} from 'react-icons/fa';
import client from '../../api/client';

// تنظیمات تم برای هر ربات
const botConfig = {
  bee: {
    name: 'هوش مصنوعی زنبور عسل',
    icon: <FaForumbee />, 
    themeColor: 'bg-amber-500',
    btnColor: 'hover:bg-amber-600',
    userMsgColor: 'bg-amber-600',
    welcome: 'سلام! من دستیار تخصصی زنبورداری هستم. درباره بیماری‌های کندو، تولید عسل یا ملکه سوالی دارید؟ 🐝',
  },
  dog: {
    name: 'دستیار سگ‌ها',
    icon: <FaDog />,
    themeColor: 'bg-orange-500',
    btnColor: 'hover:bg-orange-600',
    userMsgColor: 'bg-orange-600',
    welcome: 'هاپ! من متخصص سگ‌ها هستم. درباره نژاد، تغذیه یا بیماری سگتون بپرسید. 🐕',
  },
  cat: {
    name: 'دستیار گربه‌ها',
    icon: <FaCat />,
    themeColor: 'bg-blue-500',
    btnColor: 'hover:bg-blue-600',
    userMsgColor: 'bg-blue-600',
    welcome: 'میو! من متخصص گربه‌ها هستم. چطور می‌تونم به پیشی ملوس شما کمک کنم؟ 🐈',
  },
  cow: {
    name: 'دستیار دام بزرگ',
    icon: <FaPaw />,
    themeColor: 'bg-green-600',
    btnColor: 'hover:bg-green-700',
    userMsgColor: 'bg-green-700',
    welcome: 'سلام. من در زمینه مدیریت گاوداری، ورم پستان و تغذیه دام شیری تخصص دارم. 🐄',
  },
  horse: {
    name: 'دستیار اسب و تک‌سمیان',
    icon: <FaStethoscope />,
    themeColor: 'bg-yellow-600',
    btnColor: 'hover:bg-yellow-700',
    userMsgColor: 'bg-yellow-700',
    welcome: 'سلام. من متخصص بیماری‌ها و نگهداری اسب هستم. سوالی درباره لنگش یا قولنج دارید؟ 🐎',
  },
  poultry: {
    name: 'دستیار طیور صنعتی',
    icon: <FaFeather />,
    themeColor: 'bg-red-500',
    btnColor: 'hover:bg-red-600',
    userMsgColor: 'bg-red-600',
    welcome: 'سلام. در زمینه مدیریت مرغداری گوشتی و تخم‌گذار و بیماری‌های طیور در خدمتم. 🐓',
  },
  fish: {
    name: 'دستیار آبزیان',
    icon: <FaFish />,
    themeColor: 'bg-cyan-600',
    btnColor: 'hover:bg-cyan-700',
    userMsgColor: 'bg-cyan-700',
    welcome: 'سلام. سوالات مربوط به پرورش ماهی سردآبی و گرم‌آبی را از من بپرسید. 🐟',
  },
  default: {
    name: 'دستیار عمومی',
    icon: <FaRobot />,
    themeColor: 'bg-slate-800',
    btnColor: 'hover:bg-slate-900',
    userMsgColor: 'bg-slate-900',
    welcome: 'سلام! چطور می‌توانم کمکتان کنم؟',
  }
};

const BotChat = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const endRef = useRef(null);
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentBot = botConfig[type] || botConfig.default;

  useEffect(() => {
    setMessages([{ role: 'bot', text: currentBot.welcome }]);
  }, [type]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput(''); 
    
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await client.post('/chat', {
        message: userText,
        botType: type 
      });

      setMessages(prev => [...prev, { role: 'bot', text: res.data.response }]);

      // ✅ کد اصلاح شده برای آپدیت توکن (همان کدی که باعث خطا شده بود، الان درست جاگذاری شده)
      if (res.data.remainingTokens !== undefined) {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser) {
            const updatedUser = { ...currentUser, tokens: res.data.remainingTokens };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.dispatchEvent(new Event("storage"));
        }
      }

    } catch (error) {
      console.error("Chat Error:", error);
      
      let errorMsg = 'خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.';
      if (error.response && error.response.status === 403) {
        errorMsg = 'اعتبار توکن شما تمام شده است. لطفاً حساب خود را شارژ کنید.';
      }

      setMessages(prev => [...prev, { role: 'bot', text: errorMsg, isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
      
      <div className={`${currentBot.themeColor} p-4 flex items-center gap-4 text-white shadow-md z-10 transition-colors duration-300`}>
        <button onClick={() => navigate('/bots')} className="p-2 hover:bg-white/20 rounded-full transition">
          <FaArrowRight />
        </button>
        <div className="bg-white/20 p-2 rounded-xl text-2xl backdrop-blur-sm">
          {currentBot.icon}
        </div>
        <div>
          <h2 className="font-bold text-lg">{currentBot.name}</h2>
          <span className="text-xs text-white/90 flex items-center gap-1 font-medium">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span> آنلاین
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              max-w-[85%] md:max-w-[70%] p-4 rounded-2xl text-sm leading-7 shadow-sm whitespace-pre-line
              ${msg.role === 'user' 
                ? `${currentBot.userMsgColor} text-white rounded-br-none` 
                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}
              ${msg.isError ? 'bg-red-50 text-red-600 border border-red-200' : ''}
            `}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex gap-2 items-center text-gray-400 text-xs">
              <FaSpinner className="animate-spin text-blue-500" /> در حال تایپ...
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="پیام خود را بنویسید..."
            disabled={loading}
            className="w-full pl-4 pr-14 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-gray-300 outline-none transition text-gray-700 placeholder-gray-400 shadow-inner"
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            className={`
              absolute left-2 p-3 rounded-xl text-white transition-all duration-200 shadow-md
              ${loading || !input.trim() 
                ? 'bg-gray-300 cursor-not-allowed' 
                : `${currentBot.themeColor} ${currentBot.btnColor} hover:-translate-y-0.5 active:scale-95`}
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
