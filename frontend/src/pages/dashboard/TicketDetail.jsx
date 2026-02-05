import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import client from '../../api/client';
import { FaPaperPlane, FaUser, FaHeadset } from 'react-icons/fa';

const TicketDetail = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [reply, setReply] = useState('');
  const endRef = useRef(null);

  const fetchTicket = async () => {
    try {
      const res = await client.get(`/tickets/${id}`);
      setTicket(res.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchTicket(); }, [id]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [ticket]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    try {
      await client.post(`/tickets/${id}/reply`, { text: reply });
      setReply('');
      fetchTicket(); // ریلود پیام‌ها
    } catch (error) { console.error(error); }
  };

  if (!ticket) return <div>در حال بارگذاری...</div>;

  return (
    <div className="flex flex-col h-[80vh] bg-white rounded-2xl shadow-sm border overflow-hidden">
      <div className="p-4 border-b bg-gray-50 font-bold">
        موضوع: {ticket.subject} 
        <span className="text-xs font-normal mr-2 text-gray-500">({ticket.status})</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {ticket.messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.sender === 'user' ? 'bg-blue-100 text-blue-900 rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'
            }`}>
              <div className="flex items-center gap-2 mb-1 opacity-50 text-xs">
                {msg.sender === 'user' ? <FaUser /> : <FaHeadset />}
                {msg.sender === 'user' ? 'شما' : 'پشتیبانی'}
              </div>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleReply} className="p-4 border-t bg-gray-50 flex gap-2">
        <input 
          className="flex-1 px-4 py-2 rounded-xl border outline-none focus:border-blue-500"
          placeholder="پاسخ خود را بنویسید..."
          value={reply}
          onChange={e => setReply(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700">
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default TicketDetail;

