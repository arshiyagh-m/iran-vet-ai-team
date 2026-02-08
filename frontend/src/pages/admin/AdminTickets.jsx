import React, { useEffect, useState, useRef } from 'react';
import client from '../../api/client';
import { FaTicketAlt, FaReply, FaUser, FaUserShield, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [replyText, setReplyText] = useState('');
  
  // نگهداری ID تیکتی که الان باز است
  const [openTicketId, setOpenTicketId] = useState(null);
  
  // برای اسکرول خودکار به پایین چت
  const chatEndRef = useRef(null);

  const fetchTickets = () => {
    client.get('/admin/tickets')
      .then(res => setTickets(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchTickets(); }, []);

  // اسکرول به آخرین پیام وقتی تیکت باز می‌شود
  useEffect(() => {
    if (openTicketId && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [openTicketId, tickets]);

  const handleReply = async (ticketId) => {
    if(!replyText.trim()) return toast.warning('متن پاسخ نمی‌تواند خالی باشد');
    
    try {
        await client.post(`/admin/tickets/${ticketId}/reply`, { text: replyText });
        toast.success('پاسخ ارسال شد ✅');
        setReplyText('');
        fetchTickets(); // رفرش کردن لیست برای دیدن پیام جدید
    } catch(err) { 
        toast.error('خطا در ارسال پاسخ'); 
        console.error(err);
    }
  };

  // تبدیل تاریخ میلادی به شمسی (برای نمایش زمان پیام)
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fadeIn">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
        <FaTicketAlt className="text-blue-600" /> مدیریت تیکت‌ها و پشتیبانی
      </h2>
      
      <div className="space-y-4">
        {tickets.length === 0 ? (
            <p className="text-center text-gray-400 py-10">هیچ تیکتی ثبت نشده است.</p>
        ) : (
            tickets.map(ticket => (
            <div key={ticket._id} className={`border rounded-xl transition-all duration-300 ${openTicketId === ticket._id ? 'border-blue-300 shadow-md bg-blue-50/20' : 'border-gray-100 hover:shadow-sm bg-white'}`}>
                
                {/* --- هدر تیکت (همیشه نمایش داده می‌شود) --- */}
                <div 
                    className="p-4 flex justify-between items-center cursor-pointer"
                    onClick={() => setOpenTicketId(openTicketId === ticket._id ? null : ticket._id)}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${ticket.status === 'open' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                            <FaTicketAlt />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg">{ticket.subject}</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <FaUser className="text-gray-400" />
                                <span>{ticket.user?.fullName || 'کاربر ناشناس'}</span>
                                <span className="text-gray-300">|</span>
                                <span>{formatDate(ticket.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${ticket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                            {ticket.status === 'open' ? 'باز' : ticket.status === 'answered' ? 'پاسخ داده شده' : 'بسته شده'}
                        </span>
                        <button className="text-blue-600 text-sm hover:bg-blue-50 p-2 rounded-lg transition">
                            {openTicketId === ticket._id ? 'بستن گفتگو' : 'مشاهده گفتگو'}
                        </button>
                    </div>
                </div>

                {/* --- بدنه چت (فقط وقتی باز است نمایش داده می‌شود) --- */}
                {openTicketId === ticket._id && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50/50 rounded-b-xl animate-fadeIn">
                        
                        {/* 1. لیست پیام‌ها */}
                        <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4 p-2 custom-scrollbar">
                            {ticket.messages.map((msg, idx) => {
                                const isAdmin = msg.sender === 'admin';
                                return (
                                    <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] flex gap-2 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                                            
                                            {/* آیکون فرستنده */}
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isAdmin ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                                {isAdmin ? <FaUserShield size={14} /> : <FaUser size={12} />}
                                            </div>

                                            {/* حباب پیام */}
                                            <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                                isAdmin 
                                                ? 'bg-blue-600 text-white rounded-tl-none' 
                                                : 'bg-white text-gray-800 border border-gray-200 rounded-tr-none'
                                            }`}>
                                                <p>{msg.text}</p>
                                                <div className={`text-[10px] mt-1 text-end ${isAdmin ? 'text-blue-200' : 'text-gray-400'}`}>
                                                    {formatTime(msg.createdAt)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={chatEndRef} /> {/* نقطه پایان اسکرول */}
                        </div>

                        {/* 2. ورودی پاسخ */}
                        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex gap-2 items-end">
                            <textarea 
                                className="w-full p-2 text-sm outline-none resize-none bg-transparent" 
                                rows="2" 
                                placeholder="پاسخ خود را بنویسید..."
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                onKeyDown={e => {
                                    if(e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleReply(ticket._id);
                                    }
                                }}
                            ></textarea>
                            <button 
                                onClick={() => handleReply(ticket._id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition shadow-lg shadow-blue-600/20 mb-1"
                                title="ارسال پاسخ"
                            >
                                <FaPaperPlane />
                            </button>
                        </div>

                    </div>
                )}
            </div>
        )))}
      </div>
    </div>
  );
};

export default AdminTickets;
