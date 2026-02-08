import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import client from '../../api/client'; // فرض بر این است که baseURL=http://localhost:3000/api تنظیم شده
import { useNavigate } from 'react-router-dom';
import { FaLock, FaQuestionCircle, FaCheckCircle } from 'react-icons/fa';

const ChangePassword = () => {
  const navigate = useNavigate();
  
  // استیت‌ها
  const [data, setData] = useState({ newPassword: '', confirmPassword: '' });
  // نکته: چون در کنترلر فعلی رمز قبلی را چک نمی‌کنیم، فیلد currentPassword را از استیت حذف کردیم تا ساده شود
  // اگر بعداً چک کردن رمز فعلی را اضافه کردید، اینجا برش گردانید.

  const [mustChange, setMustChange] = useState(false);
  const [sendingTicket, setSendingTicket] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // بررسی اینکه آیا کاربر مجبور به تغییر رمز است؟
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.mustChangePassword) {
        setMustChange(true);
        toast.warn('⚠️ به دلایل امنیتی باید رمز عبور خود را تغییر دهید.');
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. اعتبارسنجی ساده
    if (data.newPassword !== data.confirmPassword) {
        return toast.error('⛔ رمز عبور جدید و تکرار آن مطابقت ندارند.');
    }
    if (data.newPassword.length < 4) {
        return toast.error('⛔ رمز عبور باید حداقل ۴ کاراکتر باشد.');
    }
    
    setLoading(true);

    try {
      // 2. ارسال درخواست به روت پروفایل (PUT)
      // چون در کنترلر گفتیم اگر password بیاید، رمز را عوض کن
      await client.put('/users/profile', {
        password: data.newPassword 
      });
      
      toast.success('✅ رمز عبور با موفقیت تغییر کرد. لطفاً مجدد وارد شوید.');
      
      // 3. پاک کردن اطلاعات قدیمی و خروج
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // هدایت به لاگین
      navigate('/login');
      
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'خطا در تغییر رمز عبور');
    } finally {
      setLoading(false);
    }
  };

  // 👇 تابع ارسال تیکت فراموشی (بدون تغییر)
  const handleForgotPassword = async () => {
    if (!window.confirm("آیا می‌خواهید درخواست بازنشانی رمز عبور به پشتیبانی ارسال شود؟")) return;

    setSendingTicket(true);
    try {
      const ticketData = {
        subject: 'درخواست بازنشانی رمز عبور (فراموشی)',
        message: `با سلام.\nمن به پنل دسترسی دارم اما رمز عبور خود را فراموش کرده‌ام و نمی‌توانم آن را تغییر دهم.\nلطفاً راهنمایی کنید.`
      };

      await client.post('/tickets', ticketData);
      
      toast.success('درخواست شما برای مدیر ارسال شد ✅');
      navigate('/dashboard/tickets'); 

    } catch (error) {
      toast.error('خطا در ارسال درخواست.');
    } finally {
      setSendingTicket(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-2xl shadow-lg border border-gray-100 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaLock className="text-blue-600" />
        {mustChange ? 'تغییر اجباری رمز عبور' : 'تغییر رمز عبور'}
      </h2>
      
      {mustChange && (
        <div className="bg-red-50 text-red-800 p-4 rounded-xl text-sm mb-6 border border-red-100 flex items-start gap-2">
            <span>⚠️</span>
            <p>مدیر سیستم رمز عبور شما را ریست کرده است. برای امنیت بیشتر، لطفاً همین حالا یک رمز عبور جدید تنظیم کنید.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* فیلد رمز جدید */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">رمز عبور جدید</label>
          <input 
            type="password" 
            required 
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" 
            placeholder="حداقل ۴ کاراکتر"
            value={data.newPassword} 
            onChange={e => setData({...data, newPassword: e.target.value})} 
          />
        </div>

        {/* فیلد تکرار رمز */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">تکرار رمز عبور جدید</label>
          <input 
            type="password" 
            required 
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" 
            placeholder="تکرار رمز بالا"
            value={data.confirmPassword} 
            onChange={e => setData({...data, confirmPassword: e.target.value})} 
          />
        </div>
        
        {/* دکمه ارسال */}
        <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-white transition shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2
                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
            `}
        >
          {loading ? 'در حال پردازش...' : (
              <>
                <FaCheckCircle /> ثبت تغییرات
              </>
          )}
        </button>

        {/* دکمه فراموشی (تیکت) */}
        {!mustChange && (
            <div className="text-center pt-2">
                <button 
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={sendingTicket}
                  className="text-sm text-gray-500 hover:text-blue-600 transition flex items-center justify-center gap-1 mx-auto"
                >
                  <FaQuestionCircle />
                  {sendingTicket ? 'در حال ارسال...' : 'نمی‌توانم رمز را تغییر دهم؟ (ارسال تیکت)'}
                </button>
            </div>
        )}

      </form>
    </div>
  );
};

export default ChangePassword;
