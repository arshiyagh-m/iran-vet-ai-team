import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { FaTicketAlt, FaReply } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = () => client.get('/admin/tickets').then(res => setTickets(res.data));

  useEffect(() => { fetchTickets(); }, []);

  const handleReply = async (ticketId) => {
    if(!replyText) return;
    try {
        await client.post(`/admin/tickets/${ticketId}/reply`, { text: replyText });
        toast.success('پاسخ ارسال شد');
        setReplyText('');
        setSelectedTicket(null);
        fetchTickets();
    } catch(err) { toast.error('خطا'); }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><FaTicketAlt className="text-purple-600" /> تیکت‌های پشتیبانی</h2>
      
      <div className="space-y-4">
        {tickets.map(ticket => (
            <div key={ticket._id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-bold text-lg">{ticket.subject}</h3>
                        <span className="text-xs text-gray-500">کاربر: {ticket.user?.fullName}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${ticket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                        {ticket.status === 'open' ? 'باز' : 'پاسخ داده شده'}
                    </span>
                </div>
                
                {/* نمایش آخرین پیام کاربر */}
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 mb-3">
                    {ticket.messages[ticket.messages.length-1]?.text}
                </div>

                {selectedTicket === ticket._id ? (
                    <div className="mt-2 animate-fadeIn">
                        <textarea 
                            className="w-full p-2 border rounded-lg text-sm" 
                            rows="3" 
                            placeholder="متن پاسخ شما..."
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                        ></textarea>
                        <div className="flex gap-2 mt-2">
                            <button onClick={() => handleReply(ticket._id)} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm">ارسال پاسخ</button>
                            <button onClick={() => setSelectedTicket(null)} className="text-gray-500 text-sm">لغو</button>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => setSelectedTicket(ticket._id)} className="text-blue-600 text-sm flex items-center gap-1 hover:underline">
                        <FaReply /> پاسخ دادن
                    </button>
                )}
            </div>
        ))}
      </div>
    </div>
  );
};
export default AdminTickets;

