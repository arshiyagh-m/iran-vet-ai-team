import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaPaperPlane, FaArrowRight, FaSpinner, FaRobot, 
  FaDog, FaCat, FaFeather, FaStethoscope, FaPaw, FaFish, FaForumbee, FaPlus, FaUserMd,
  FaThumbsUp, FaThumbsDown, FaCheck, FaTimes
} from 'react-icons/fa';
import client from '../../api/client';
import { toast } from 'react-toastify';

// ✅ تنظیمات تم و پیام‌های خوش‌آمدگویی (حرفه‌ای و تخصصی)
const botConfig = {
  general: {
    name: 'دامپزشک عمومی',
    icon: <FaUserMd />,
    themeColor: 'bg-indigo-600',
    welcome: 'با سلام. من دستیار هوشمند دامپزشکی هستم. لطفاً مشکل یا سوال خود را مطرح کنید تا بر اساس منابع علمی راهنمایی کنم.',
  },
  bee: {
    name: 'متخصص زنبور عسل',
    icon: <FaForumbee />, 
    themeColor: 'bg-amber-500',
    welcome: 'درود. من دستیار تخصصی زنبورداری و بیماری‌های کندو هستم. لطفاً علائم مشاهده شده در کلنی یا سوالات خود را بفرمایید.',
  },
  dog: {
    name: 'متخصص بیماری‌های سگ',
    icon: <FaDog />,
    themeColor: 'bg-orange-500',
    welcome: 'سلام. من متخصص بیماری‌ها و رفتارشناسی سگ‌ها هستم. لطفاً نژاد، سن و علائم حیوان را توضیح دهید تا بررسی کنم.',
  },
  cat: {
    name: 'متخصص بیماری‌های گربه',
    icon: <FaCat />,
    themeColor: 'bg-blue-500',
    welcome: 'با سلام. من متخصص طب داخلی گربه‌ها هستم. برای تشخیص بهتر، لطفاً تغییرات رفتاری و علائم جسمی گربه خود را شرح دهید.',
  },
  cow: {
    name: 'متخصص دام بزرگ',
    icon: <FaPaw />,
    themeColor: 'bg-green-600',
    welcome: 'سلام. من مشاور مدیریت گله و بیماری‌های دام بزرگ (گاو شیری و گوشتی) هستم. مشکل را بفرمایید.',
  },
  horse: {
    name: 'متخصص اسب',
    icon: <FaStethoscope />,
    themeColor: 'bg-yellow-700',
    welcome: 'درود. من متخصص طب و جراحی اسب هستم. لطفاً در مورد لنگش، قولنج یا سایر موارد سوال خود را مطرح کنید.',
  },
  poultry: {
    name: 'متخصص طیور صنعتی',
    icon: <FaFeather />,
    themeColor: 'bg-red-500',
    welcome: 'سلام. من کارشناس بیماری‌های طیور و مدیریت سالن مرغداری هستم. لطفاً وضعیت گله و تلفات را شرح دهید.',
  },
  fish: {
    name: 'متخصص آبزیان',
    icon: <FaFish />,
    themeColor: 'bg-cyan-600',
    welcome: 'سلام. من متخصص بهداشت و بیماری‌های آبزیان (سردآبی و گرم‌آبی) هستم. سوال خود را بپرسید.',
  },
  default: {
    name: 'دستیار هوشمند',
    icon: <FaRobot />,
    themeColor: 'bg-slate-700',
    welcome: 'سلام. چطور می‌توانم به شما کمک کنم؟',
  }
};

const BotChat = () => {
  const { type, sessionId: urlSessionId } = useParams();
  const navigate = useNavigate();
  const endRef = useRef(null);
  const textareaRef = useRef(null);
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // --- استیت‌های سیستم فیدبک ---
  const [feedbackModal, setFeedbackModal] = useState({ show: false, messageId: null, type: null });
  const [feedbackReason, setFeedbackReason] = useState('');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const currentBot = botConfig[type] || botConfig.default;

  // دلایل پیش‌فرض برای انتخاب
  const likeReasons = ['پاسخ دقیق', 'مفید بود', 'لحن مناسب', 'سرعت خوب'];
  const dislikeReasons = ['اطلاعات غلط', 'پاسخ ناقص', 'نامرتبط', 'نفهمیدن منظور'];

  // 1. لود اولیه
  useEffect(() => {
    if (urlSessionId) {
        loadSessionHistory(urlSessionId);
    } else {
        setCurrentSessionId(null);
        setMessages([{ role: 'assistant', content: currentBot.welcome }]);
    }
  }, [urlSessionId, type]);

  // اسکرول به پایین
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadSessionHistory = async (id) => {
      try {
          setLoading(true);
          const res = await client.get(`/chat/sessions/${id}`);
          const formattedMsgs = res.data.flatMap(log => [
              { role: 'user', content: log.question },
              { 
                  role: 'assistant', 
                  content: log.answer, 
                  _id: log._id, 
                  feedback: log.feedback 
              }
          ]);
          setMessages(formattedMsgs);
          setCurrentSessionId(id);
      } catch (error) {
          toast.error('خطا در بارگذاری تاریخچه');
          navigate(`/dashboard/chat/${type}`);
      } finally {
          setLoading(false);
      }
  };

  const handleNewChat = () => {
      navigate(`/dashboard/chat/${type}`);
      setCurrentSessionId(null);
      setMessages([{ role: 'assistant', content: currentBot.welcome }]);
  };

  const handleInputResize = (e) => {
    const target = e.target;
    target.style.height = 'auto'; 
    target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
    setInput(target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleSend = async (e) => {
    e && e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto'; 
    
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    try {
      const res = await client.post('/chat', {
        message: userText,
        botType: type,
        sessionId: currentSessionId
      });

      // اضافه کردن پیام جدید + messageId برای فیدبک
      setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: res.data.response, 
          _id: res.data.messageId, 
          feedback: null 
      }]);

      if (!currentSessionId && res.data.sessionId) {
          setCurrentSessionId(res.data.sessionId);
          window.history.replaceState(null, '', `/dashboard/chat/${type}/${res.data.sessionId}`);
      }

      if (res.data.remainingTokens !== undefined) {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser) {
            const updatedUser = { ...currentUser, tokens: res.data.remainingTokens };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.dispatchEvent(new Event("storage"));
        }
      }

    } catch (error) {
      let errorMsg = 'خطا در ارتباط با سرور.';
      if (error.response?.status === 403) errorMsg = 'اعتبار توکن شما تمام شده است. ⛔';
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg, isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  // --- توابع فیدبک ---
  const openFeedbackModal = (messageId, type) => {
      setFeedbackModal({ show: true, messageId, type });
      setFeedbackReason('');
      setFeedbackComment('');
  };

  const submitFeedback = async () => {
      if (!feedbackModal.messageId) return;
      setSubmittingFeedback(true);
      try {
          await client.post(`/chat/${feedbackModal.messageId}/feedback`, {
              feedback: feedbackModal.type,
              reason: feedbackReason,
              comment: feedbackComment
          });
          toast.success("نظر شما ثبت شد");
          
          setMessages(prev => prev.map(msg => 
              msg._id === feedbackModal.messageId 
                  ? { ...msg, feedback: feedbackModal.type } 
                  : msg
          ));
          setFeedbackModal({ show: false, messageId: null, type: null });
      } catch (error) {
          toast.error("خطا در ثبت نظر");
      } finally {
          setSubmittingFeedback(false);
      }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 relative">
      
      {/* هدر چت */}
      <div className={`${currentBot.themeColor} p-4 flex items-center justify-between text-white shadow-md z-10`}>
        <div className="flex items-center gap-3">
            <button onClick={() => navigate('/bots')} className="p-2 hover:bg-white/20 rounded-full transition">
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
        <button 
            onClick={handleNewChat}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm transition"
        >
            <FaPlus /> <span className="hidden sm:inline">چت جدید</span>
        </button>
      </div>

      {/* ناحیه پیام‌ها */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scroll-smooth">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn group`}>
            
            {msg.role === 'assistant' && (
                <div className={`w-8 h-8 rounded-full ${currentBot.themeColor} text-white flex items-center justify-center text-sm ml-2 shrink-0 self-end mb-4 shadow-sm`}>
                    {currentBot.icon}
                </div>
            )}

            <div className={`max-w-[85%] md:max-w-[75%] flex flex-col items-start`}>
                <div className={`
                    p-3.5 rounded-2xl text-sm leading-7 shadow-sm whitespace-pre-line
                    ${msg.role === 'user' 
                        ? `${currentBot.themeColor} text-white rounded-br-none shadow-md` 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}
                    ${msg.isError ? 'bg-red-50 text-red-600 border border-red-200' : ''}
                `}>
                {msg.content}
                </div>

                {/* 👇 دکمه‌های لایک و دیس‌لایک */}
                {msg.role === 'assistant' && msg._id && (
                    <div className="flex gap-2 mt-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                            onClick={() => openFeedbackModal(msg._id, 'like')}
                            className={`p-1 rounded-full transition ${msg.feedback === 'like' ? 'text-green-600 bg-green-50' : 'text-gray-300 hover:text-green-500 hover:bg-gray-100'}`}
                            title="مفید بود"
                        >
                            <FaThumbsUp size={12} />
                        </button>
                        <button 
                            onClick={() => openFeedbackModal(msg._id, 'dislike')}
                            className={`p-1 rounded-full transition ${msg.feedback === 'dislike' ? 'text-red-500 bg-red-50' : 'text-gray-300 hover:text-red-500 hover:bg-gray-100'}`}
                            title="مفید نبود"
                        >
                            <FaThumbsDown size={12} />
                        </button>
                    </div>
                )}
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

      {/* بخش ورودی مدرن */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="relative flex items-end gap-2 bg-gray-50 rounded-3xl border border-gray-200 focus-within:border-gray-400 focus-within:bg-white focus-within:shadow-md transition-all duration-300 p-1">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInputResize}
            onKeyDown={handleKeyDown}
            placeholder="پیام خود را بنویسید..."
            disabled={loading}
            className="w-full bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 resize-none py-3 pr-4 pl-14 max-h-[200px] overflow-y-auto rounded-3xl"
            style={{ minHeight: '48px' }} 
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={`
              absolute left-2 bottom-2 p-3 rounded-full text-white transition-all duration-200 shadow-sm flex items-center justify-center
              ${loading || !input.trim() 
                ? 'bg-gray-300 cursor-not-allowed' 
                : `${currentBot.themeColor} hover:scale-105 active:scale-95`}
            `}
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane className="text-lg -ml-0.5" />}
          </button>
        </div>
      </div>

      {/* 🔥 مودال فیدبک 🔥 */}
      {feedbackModal.show && (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={() => setFeedbackModal({ ...feedbackModal, show: false })}>
            <div className="bg-white w-full sm:w-96 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slideUp" onClick={(e) => e.stopPropagation()}>
                
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        {feedbackModal.type === 'like' ? <FaThumbsUp className="text-green-500"/> : <FaThumbsDown className="text-red-500"/>}
                        {feedbackModal.type === 'like' ? 'نقطه قوت پاسخ؟' : 'مشکل پاسخ چه بود؟'}
                    </h3>
                    <button onClick={() => setFeedbackModal({ ...feedbackModal, show: false })} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                </div>

                {/* انتخاب دلیل */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {(feedbackModal.type === 'like' ? likeReasons : dislikeReasons).map(reason => (
                        <button
                            key={reason}
                            onClick={() => setFeedbackReason(reason)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition
                                ${feedbackReason === reason 
                                    ? (feedbackModal.type === 'like' ? 'bg-green-100 border-green-300 text-green-700' : 'bg-red-100 border-red-300 text-red-700') 
                                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}
                            `}
                        >
                            {reason}
                        </button>
                    ))}
                </div>

                {/* کامنت متنی */}
                <textarea 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:bg-white focus:border-blue-400 outline-none resize-none"
                    rows={3}
                    placeholder="توضیحات تکمیلی برای ادمین..."
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                ></textarea>

                {/* دکمه ثبت */}
                <button 
                    onClick={submitFeedback}
                    disabled={submittingFeedback}
                    className={`w-full mt-4 py-3 rounded-xl text-white font-bold text-sm shadow-md transition transform active:scale-95 flex justify-center gap-2
                        ${feedbackModal.type === 'like' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'}
                    `}
                >
                    {submittingFeedback ? <FaSpinner className="animate-spin" /> : <>ثبت بازخورد <FaCheck /></>}
                </button>

            </div>
        </div>
      )}

    </div>
  );
};

export default BotChat;
