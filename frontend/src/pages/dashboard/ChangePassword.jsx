import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import client from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaQuestionCircle } from 'react-icons/fa';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [mustChange, setMustChange] = useState(false);
  const [sendingTicket, setSendingTicket] = useState(false); // لودینگ برای دکمه فراموشی

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.mustChangePassword) {
      setMustChange(true);
      toast.warn('⚠️ به دلایل امنیتی باید رمز عبور خود را تغییر دهید.');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (data.newPassword !== data.confirmPassword) return toast.error('تکرار رمز مطابقت ندارد');
    
    try {
      await client.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      
      toast.success('رمز عبور تغییر کرد. لطفاً مجدد وارد شوید.');
      
      const user = JSON.parse(localStorage.getItem('user'));
      user.mustChangePassword = false;
      localStorage.setItem('user', JSON.stringify(user));

      localStorage.removeItem('token');
      navigate('/login');
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'خطا در تغییر رمز');
    }
  };

  // 👇 تابع جادویی ارسال تیکت فراموشی
  const handleForgotPassword = async () => {
    if (!window.confirm("آیا می‌خواهید درخواست بازنشانی رمز عبور به پشتیبانی ارسال شود؟")) return;

    setSendingTicket(true);
    try {
      const ticketData = {
        subject: 'درخواست بازنشانی رمز عبور (فراموشی رمز فعلی)',
        message: `با سلام و احترام.\n\nمن در حال حاضر به پنل کاربری خود دسترسی دارم، اما "رمز عبور فعلی" خود را فراموش کرده‌ام و امکان تغییر آن را ندارم.\n\nلطفاً در صورت امکان رمز عبور مرا بازنشانی کرده یا راهنمایی بفرمایید.\n\nبا تشکر.`
      };

      await client.post('/tickets', ticketData);
      
      toast.success('درخواست شما با موفقیت برای مدیر ارسال شد ✅');
      navigate('/dashboard/tickets'); // هدایت به صفحه تیکت‌ها

    } catch (error) {
      console.error(error);
      toast.error('خطا در ارسال درخواست.');
    } finally {
      setSendingTicket(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaLock className="text-blue-600" />
        {mustChange ? '⚠️ تغییر اجباری رمز عبور' : 'تغییر رمز عبور'}
      </h2>
      
      {mustChange && (
        <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm mb-4 border border-yellow-200">
          ادمین رمز شما را ریست کرده است. برای ادامه فعالیت باید رمز جدید بسازید.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">رمز عبور فعلی</label>
          <input type="password" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition" 
            value={data.currentPassword} onChange={e => setData({...data, currentPassword: e.target.value})} />
            
            {/* 👇 دکمه فراموشی رمز (فقط وقتی اجبار نباشه نشون میدیم یا همیشه؟ همیشه باشه بهتره) */}
            <button 
              type="button"
              onClick={handleForgotPassword}
              disabled={sendingTicket}
              className="text-xs text-blue-500 hover:text-blue-700 mt-2 flex items-center gap-1 cursor-pointer"
            >
              <FaQuestionCircle />
              {sendingTicket ? 'در حال ارسال درخواست...' : 'رمز عبور فعلی را فراموش کرده‌ام؟'}
            </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">رمز عبور جدید</label>
          <input type="password" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition" 
            value={data.newPassword} onChange={e => setData({...data, newPassword: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">تکرار رمز جدید</label>
          <input type="password" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition" 
            value={data.confirmPassword} onChange={e => setData({...data, confirmPassword: e.target.value})} />
        </div>
        
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
          تغییر رمز عبور
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
