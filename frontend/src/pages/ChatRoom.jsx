import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom'; // useLocation اضافه شد
import axios from '../api/axios';
import { FaPaperPlane, FaRobot } from 'react-icons/fa';

const ChatRoom = () => {
  const { category } = useParams();
  const location = useLocation(); // دریافت اطلاعات ارسالی از صفحه قبل
  
  // استخراج انتخاب‌ها (مثلا: صنعتی، بیماری)
  const selectionData = location.state || { type: 'عمومی', topic: 'عمومی' };

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [license, setLicense] = useState('');
  const [loading, setLoading] = useState(false);

  // تنظیم پیام خوش‌آمدگویی بر اساس انتخاب کاربر
  useEffect(() => {
    setMessages([
      { 
        role: 'system', 
        content: `سلام! من دستیار هوشمند بخش **${category === 'Poultry' ? 'طیور' : category}** هستم.
        \nتنظیم شده برای: **${selectionData.type}** \nموضوع مشاوره: **${selectionData.topic}**
        \n\nلطفا کد لایسنس را وارد کرده و سوال خود را بپرسید.` 
      }
    ]);
  }, [category, selectionData]);

  const sendMessage = async () => {
    if (!input.trim() || !license.trim()) return alert('لطفا متن سوال و کد لایسنس را وارد کنید');

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setInput('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/chat', {
        message: userMsg.content,
        licenseCode: license,
        category: category,
        // ارسال جزئیات انتخاب شده به بک‌اند برای پرامپت دقیق‌تر
        subCategory: selectionData.type,
        topic: selectionData.topic
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages(prev => [...prev, { role: 'bot', content: response.data.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'error', content: error.response?.data?.message || 'خطا در ارتباط با سرور' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... (بقیه کدهای UI صفحه چت مشابه قبل است)
    <div className="h-screen flex flex-col bg-gray-100">
       {/* هدر */}
       <div className="bg-white p-4 shadow-sm flex justify-between items-center border-b border-gray-200">
        <div>
            <h2 className="font-bold text-brand-navy text-lg">چت هوشمند: {category}</h2>
            <p className="text-xs text-gray-500 mt-1">
                {selectionData.type} | {selectionData.topic}
            </p>
        </div>
        <input 
          type="text" 
          placeholder="کد لایسنس (اجباری)" 
          className="border border-gray-300 p-2 rounded-lg text-sm w-48 md:w-64 text-left dir-ltr placeholder:text-right"
          value={license}
          onChange={(e) => setLicense(e.target.value)}
        />
      </div>

      {/* ناحیه چت */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl whitespace-pre-line leading-7 ${
              msg.role === 'user' ? 'bg-white text-gray-800 rounded-tr-none shadow-sm border border-gray-100' 
              : msg.role === 'error' ? 'bg-red-50 text-red-600 border border-red-100'
              : 'bg-brand-navy text-white rounded-tl-none shadow-lg'
            }`}>
              {msg.role !== 'user' && <FaRobot className="inline ml-2 mb-1 text-brand-green" />}
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
            <div className="flex justify-end">
                <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full animate-pulse">
                    هوش مصنوعی در حال نوشتن...
                </div>
            </div>
        )}
      </div>

      {/* ناحیه ورودی */}
      <div className="p-4 bg-white border-t flex gap-3 items-center">
        <input 
          type="text" 
          className="flex-1 border bg-gray-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-green transition"
          placeholder="سوال خود را اینجا بنویسید..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button 
          onClick={sendMessage}
          disabled={loading}
          className="bg-brand-green text-white p-4 rounded-xl hover:bg-green-700 transition disabled:opacity-50 shadow-lg shadow-green-200">
          <FaPaperPlane className="transform rotate-180" />
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
