import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import client from '../../api/client'; 
import { useNavigate } from 'react-router-dom';
import { FaLock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const ChangePassword = () => {
  const navigate = useNavigate();
  
  // استیت‌ها
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mustChange, setMustChange] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // بررسی وضعیت تغییر اجباری از لوکال استوریج
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.mustChangePassword) {
        setMustChange(true);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. اعتبارسنجی
    if (newPassword !== confirmPassword) {
        return toast.error('⛔ رمز عبور و تکرار آن یکی نیستند.');
    }
    if (newPassword.length < 4) {
        return toast.error('⛔ رمز عبور باید حداقل ۴ کاراکتر باشد.');
    }
    
    setLoading(true);

    try {
      // 2. ارسال درخواست (PUT به پروفایل)
      // 🔥 نکته مهم: اسم فیلد باید "password" باشد نه "newPassword"
      const res = await client.put('/users/profile', {
        password: newPassword 
      });
      
      toast.success('✅ رمز عبور تغییر کرد. لطفاً مجدد وارد شوید.');
      
      // 3. پاک کردن ردپای قبلی و خروج
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

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-2xl shadow-lg border border-gray-100 animate-fadeIn">
      
      <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-3">
            <FaLock size={20} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {mustChange ? 'تغییر اجباری رمز عبور' : 'تغییر رمز عبور'}
          </h2>
      </div>
      
      {mustChange && (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-sm mb-6 border border-yellow-200 flex items-start gap-3">
            <FaExclamationTriangle className="mt-1 shrink-0" />
            <p>
              رمز عبور شما توسط مدیر بازنشانی شده است. 
              <br/>
              برای امنیت حساب کاربری، <strong>باید</strong> همین حالا یک رمز جدید تنظیم کنید.
            </p>
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
            placeholder="رمز جدید خود را وارد کنید"
            value={newPassword} 
            onChange={e => setNewPassword(e.target.value)} 
          />
        </div>

        {/* فیلد تکرار رمز */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">تکرار رمز عبور</label>
          <input 
            type="password" 
            required 
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" 
            placeholder="رمز را مجدد تکرار کنید"
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)} 
          />
        </div>
        
        {/* دکمه ارسال */}
        <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold text-white transition shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2
                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
            `}
        >
          {loading ? 'در حال ثبت...' : (
              <>
                <FaCheckCircle /> ذخیره رمز عبور
              </>
          )}
        </button>

      </form>
    </div>
  );
};

export default ChangePassword;
