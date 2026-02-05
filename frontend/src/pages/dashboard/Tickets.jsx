import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaHeadset, FaPaperPlane, FaHistory, FaCircle } from 'react-icons/fa';
import client from '../../api/client';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({ subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  // دریافت تیکت‌های قبلی موقع لود شدن صفحه
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await client.get('/tickets');
      setTickets(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) return toast.error('لطفاً همه فیلدها را پر کنید');

    setLoading(true);
    try {
      await client.post('/tickets', formData);
      toast.success('تیکت شما با موفقیت ارسال شد ✅');
      setFormData({ subject: '', message: '' }); // خالی کردن فرم
      fetchTickets(); // آپدیت کردن لیست پایین صفحه
    } catch (error) {
      toast.error('خطا در ارسال تیکت');
    } finally {
      setLoading(false);
    }
  };

  // تابع برای تعیین رنگ وضعیت
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
      case 'open': return 'باز - در انتظار پاسخ';
      case 'closed': return 'بسته شده';
      case 'pending': return 'در حال بررسی';
      default: return status;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* هدر صفحه */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-xl">
          <FaHeadset />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">پشتیبانی و تیکت</h1>
          <p className="text-gray-500">مشکلات و سوالات خود را با ما در میان بگذارید</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* فرم ارسال تیکت */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">ارسال تیکت جدید</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">موضوع</label>
              <input 
                type="text" 
                placeholder="مثلا: مشکل در پرداخت"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 outline-none transition"
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">پیام شما</label>
              <textarea 
                rows="5"
                placeholder="توضیحات کامل مشکل..."
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
              {loading ? 'در حال ارسال...' : <><FaPaperPlane /> ارسال تیکت</>}
            </button>
          </form>
        </div>

        {/* لیست تیکت‌های قبلی */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
            <FaHistory /> تاریخچه تیکت‌ها
          </h3>
          
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {tickets.length === 0 ? (
              <p className="text-center text-gray-400 py-8">هنوز تیکتی ثبت نکرده‌اید.</p>
            ) : (
              tickets.map(ticket => (
                <div key={ticket._id} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-800">{ticket.subject}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getStatusColor(ticket.status)}`}>
                      <FaCircle size={8} /> {getStatusText(ticket.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{ticket.message}</p>
                  <span className="text-xs text-gray-400">
                    {new Date(ticket.createdAt).toLocaleDateString('fa-IR')}
                  </span>
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

