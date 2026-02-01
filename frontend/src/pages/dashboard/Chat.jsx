import React, { useState } from 'react';
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';

const Chat = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'سلام! من دستیار هوشمند دامپزشکی هستم. چطور می‌تونم کمکتون کنم؟ (لطفاً علائم حیوان را دقیق بگویید)' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // اضافه کردن پیام کاربر
    const userMsg = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // شبیه‌سازی پاسخ ربات (بعداً به API وصل میشه)
    setTimeout(() => {
      const botMsg = { 
        id: Date.now() + 1, 
        sender: 'bot', 
        text: 'درحال پردازش علائم و جستجو در دیتابیس... (این یک پاسخ تستی است)' 
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* هدر چت */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center">
          <FaRobot size={20} />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">دستیار هوشمند (مدل عمومی)</h3>
          <span className="text-xs text-green-600 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            آنلاین
          </span>
        </div>
      </div>

      {/* ناحیه پیام‌ها */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-brand-navy text-white rounded-br-none' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
            }`}>
              <p className="leading-relaxed text-sm md:text-base">{msg.text}</p>
              {msg.sender === 'bot' && (
                <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-400 font-mono">
                  Ref: Internal DB v4.2
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ورودی پیام */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            className="w-full bg-gray-100 text-gray-800 rounded-xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-brand-green/20 transition"
            placeholder="علائم بیماری یا سوال خود را بنویسید..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit" 
            className="absolute left-2 p-2 bg-brand-navy text-white rounded-lg hover:bg-brand-green transition"
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>

    </div>
  );
};

export default Chat;

