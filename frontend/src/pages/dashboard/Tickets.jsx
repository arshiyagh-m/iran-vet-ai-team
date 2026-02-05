import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaHeadset, FaPaperPlane, FaHistory, FaCircle, FaSpinner } from 'react-icons/fa';
import client from '../../api/client';
import { useNavigate } from 'react-router-dom'; // ✅ اضافه شد برای نویگیشن

const Tickets = () => {
  const navigate = useNavigate(); // ✅ هوک نویگیشن
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({ subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await client.get('/tickets');
      setTickets(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) return toast.error('لطفاً همه فیلدها را پر کنید');

    setLoading(true);
    try {
      await client.post('/tickets', formData);
      toast.success('تیکت شما با موفقیت ثبت شد ✅');
      setFormData({ subject: '', message: '' });
      fetchTickets(); 
    } catch (error) {
      toast.error('خطا در ارسال تیکت');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-500 bg-gray-100';
      case 'pending': return 'text-orange-500 bg-orange-100';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'open': return 'باز - پاسخ شما';
      case 'closed': return 'بسته شده';
      case 'pending': return 'منتظر پاسخ شما'; // وقتی ادمین جواب میده میشه pending
      default: return status;
    }
  };

  return (
    <div className="space-y-8">
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-xl">
          <FaHeadset />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">پشتیبانی و تیکت</h1>
          <p className="text-gray-500">ارتباط مستقیم با تیم فنی و ادمین</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* فرم ارسال تیکت */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">ثبت درخواست جدید</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">موضوع</label>
              <input 
                type="text" 
                placeholder="موضوع درخواست..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 outline-none transition"
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">پیام شما</label>
              <textarea 
                rows="5"
                placeholder="توضیحات کامل..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 outline-none transition resize-none"
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
              ></textarea>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition flex items-center justify-center gap-2"
            >
              {loading ? 'در حال ارسال...' : <><FaPaperPlane /> ثبت تیکت</>}
            </button>
          </form>
        </div>

        {/* لیست تیکت‌ها */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
            <FaHistory /> تیکت‌های شما
          </h3>
          
          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {fetching ? (
              <div className="flex justify-center items-center h-full text-gray-400">
                <FaSpinner className="animate-spin text-2xl" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <p>هنوز تیکتی ثبت نکرده‌اید.</p>
              </div>
            ) : (
              tickets.map(ticket => (
                // 👇 اینجا کلیک اضافه شد
                <div 
                  key={ticket._id} 
                  onClick={() => navigate(`/dashboard/tickets/${ticket._id}`)}
                  className="p-4 border border-gray-100 rounded-xl hover:bg-purple-50 transition cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-800 group-hover:text-purple-700 transition">{ticket.subject}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getStatusColor(ticket.status)}`}>
                      <FaCircle size={8} /> {getStatusText(ticket.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                    {/* نمایش آخرین پیام یا پیام اول */}
                    {ticket.messages && ticket.messages.length > 0 
                      ? ticket.messages[ticket.messages.length - 1].text 
                      : 'بدون پیام'}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-400 mt-2 border-t pt-2 border-dashed">
                    <span>{new Date(ticket.createdAt).toLocaleDateString('fa-IR')}</span>
                    <span className="group-hover:translate-x-[-5px] transition-transform">مشاهده جزئیات &larr;</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Tickets;
