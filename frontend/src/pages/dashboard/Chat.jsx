import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot } from 'react-icons/fa';
import { toast } from 'react-toastify';
import client from '../../api/client';

const Chat = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'سلام! من دستیار هوشمند دامپزشکی هستم. چطور می‌تونم کمکتون کنم؟ (لطفاً علائم حیوان را دقیق بگویید)' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // اسکرول خودکار به پایین
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    
    // ۱. نمایش پیام کاربر
    const userMsg = { id: Date.now(), sender: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // ۲. ارسال به سرور
      const res = await client.post('/chat/message', { prompt: userText });

      // ۳. نمایش پاسخ هوش مصنوعی
      const botMsg = { 
        id: Date.now() + 1, 
        sender: 'bot', 
        text: res.data.reply,
        reference: res.data.reference 
      };
      setMessages(prev => [...prev, botMsg]);

      // ۴. آپدیت توکن در لوکال استوریج (نمایشی)
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser.tokens > 0 && storedUser.role !== 'admin') {
        storedUser.tokens -= 1;
        localStorage.setItem('user', JSON.stringify(storedUser));
        // برای آپدیت هدر بهتره ریلود بشه یا از کانتکست استفاده شه، ولی فعلا این کافیه
      }

    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.reply || 'متاسفانه ارتباط با سرور برقرار نشد.';
      setMessages(prev => [...prev, { id: Date.now()+2, sender: 'bot', text: errMsg, isError: true }]);
      
      if (error.response?.status === 403) {
        toast.error('اعتبار توکن شما تمام شده است!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* هدر چت */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
          <FaRobot size={20} />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">دستیار هوشمند (نسخه بتا)</h3>
          <span className="text-xs text-green-600 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            {loading ? 'درحال نوشتن...' : 'آنلاین'}
          </span>
        </div>
      </div>

      {/* ناحیه پیام‌ها */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-blue-900 text-white rounded-br-none' 
                : msg.isError 
                  ? 'bg-red-50 text-red-600 border border-red-100'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
            }`}>
              <p className="leading-relaxed text-sm md:text-base whitespace-pre-wrap">{msg.text}</p>
              
              {/* نمایش رفرنس اگر موجود باشد */}
              {msg.sender === 'bot' && msg.reference && (
                <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-400 font-mono flex justify-between">
                  <span>منبع: {msg.reference}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ورودی پیام */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            className="w-full bg-gray-100 text-gray-800 rounded-xl pl-4 pr-14 py-4 outline-none focus:ring-2 focus:ring-green-500/20 transition"
            placeholder="سوال خود را بپرسید..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={loading}
            className={`absolute left-2 p-2 rounded-lg text-white transition
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-900 hover:bg-green-600'}
            `}
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>

    </div>
  );
};

export default Chat;
