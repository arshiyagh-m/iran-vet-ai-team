import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import { FaPaperPlane, FaRobot } from 'react-icons/fa';

const ChatRoom = () => {
  const { category } = useParams();
  const [messages, setMessages] = useState([
    { role: 'system', content: `سلام! من هوش مصنوعی بخش ${category === 'Poultry' ? 'طیور' : category} هستم. کد لایسنس خود را وارد کنید و سوالتان را بپرسید.` }
  ]);
  const [input, setInput] = useState('');
  const [license, setLicense] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || !license.trim()) return alert('لطفا متن سوال و کد لایسنس را وارد کنید');

    const userMsg = { role: 'user', content: input };
    setMessages([...messages, userMsg]);
    setLoading(true);
    setInput('');

    try {
      const token = localStorage.getItem('token'); // دریافت توکن کاربر
      const response = await axios.post('/chat', {
        message: userMsg.content,
        licenseCode: license,
        category: category,
        subCategory: 'General' // می‌تواند داینامیک باشد
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
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex justify-between items-center">
        <h2 className="font-bold text-brand-navy">چت هوشمند: {category}</h2>
        <input 
          type="text" 
          placeholder="کد لایسنس (اجباری)" 
          className="border p-2 rounded text-sm w-64 text-left"
          value={license}
          onChange={(e) => setLicense(e.target.value)}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              msg.role === 'user' ? 'bg-white text-gray-800 rounded-tr-none shadow-sm' 
              : msg.role === 'error' ? 'bg-red-100 text-red-700'
              : 'bg-brand-navy text-white rounded-tl-none shadow-md'
            }`}>
              {msg.role !== 'user' && <FaRobot className="inline ml-2 mb-1" />}
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-center text-gray-500 text-sm">در حال تایپ...</div>}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t flex gap-2">
        <input 
          type="text" 
          className="flex-1 border bg-gray-50 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-brand-green"
          placeholder="سوال خود را بپرسید..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button 
          onClick={sendMessage}
          disabled={loading}
          className="bg-brand-green text-white p-4 rounded-full hover:bg-green-700 transition disabled:opacity-50">
          <FaPaperPlane className="transform rotate-180" />
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;

