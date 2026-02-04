import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUserPlus, FaNetworkWired } from 'react-icons/fa';
import client from '../../api/client';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [debugMsg, setDebugMsg] = useState(''); // برای نمایش متن خطا روی صفحه
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // --- دکمه تست اتصال (جدید) ---
  const checkConnection = async () => {
    setDebugMsg('در حال تست اتصال به سرور...');
    try {
      // تلاش برای گرفتن پاسخ از سرور
      const res = await client.get('/'); 
      toast.success('✅ اتصال به سرور برقرار است!');
      setDebugMsg(`✅ سرور پاسخ داد: ${res.data || 'OK'}`);
    } catch (error) {
      console.error(error);
      if (error.code === 'ERR_NETWORK') {
        toast.error('❌ خطای شبکه: فرانت‌اند نمی‌تواند سرور را ببیند.');
        setDebugMsg('❌ خطای نتورک (ERR_NETWORK): آدرس در client.js اشتباه است یا سرور خاموش است.');
      } else {
        toast.error('❌ خطا در اتصال');
        setDebugMsg(`❌ خطا: ${error.message} (Status: ${error.response?.status})`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDebugMsg(''); // پاک کردن پیام‌های قبلی
    
    if (formData.password !== formData.confirmPassword) {
      return toast.error('رمز عبور و تکرار آن مطابقت ندارند');
    }

    setLoading(true);

    try {
      // ارسال درخواست ثبت نام
      const res = await client.post('/auth/register', {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      toast.success('ثبت نام موفقیت‌آمیز بود! 🎉');
      navigate('/login');
      
    } catch (error) {
      console.error("Register Error:", error);
      
      // --- تحلیل دقیق خطا ---
      let errorText = "خطای ناشناخته";
      
      if (error.code === 'ERR_NETWORK') {
        errorText = "⛔ خطای شبکه: به سرور وصل نشدم. (آدرس client.js را چک کن)";
      } else if (error.response) {
        // سرور جواب داده ولی با ارور (مثلا 400 یا 500)
        errorText = `⚠️ خطای سرور (${error.response.status}): ${error.response.data.message}`;
      } else {
        errorText = `❌ خطا: ${error.message}`;
      }

      setDebugMsg(errorText); // نمایش خطا زیر دکمه
      toast.error(errorText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-brand-green rounded-2xl flex items-center justify-center text-white text-3xl">
            <FaUserPlus />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-brand-navy mb-4">ایجاد حساب جدید</h2>

        {/* --- دکمه تست عیب‌یابی --- */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-xs text-yellow-800 mb-2">اگر ثبت نام کار نمی‌کند، اول دکمه زیر را بزنید:</p>
          <button 
            type="button"
            onClick={checkConnection}
            className="flex items-center justify-center gap-2 mx-auto px-4 py-2 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition"
          >
            <FaNetworkWired /> تست اتصال به سرور
          </button>
          {debugMsg && (
            <div className="mt-3 p-2 bg-black text-green-400 text-xs text-left rounded overflow-x-auto dir-ltr font-mono">
              {debugMsg}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نام و نام خانوادگی</label>
            <input 
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-green focus:ring-2 focus:ring-green-100 outline-none transition"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">شماره موبایل</label>
            <input 
              type="tel"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-green focus:ring-2 focus:ring-green-100 outline-none transition"
              placeholder="0912..."
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ایمیل</label>
            <input 
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-green focus:ring-2 focus:ring-green-100 outline-none transition"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رمز عبور</label>
            <input 
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-green focus:ring-2 focus:ring-green-100 outline-none transition"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تکرار رمز عبور</label>
            <input 
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-green focus:ring-2 focus:ring-green-100 outline-none transition"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-green text-white py-3.5 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-900/20 mt-4"
          >
            {loading ? 'در حال ثبت...' : 'ثبت نام و شروع'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          قبلاً ثبت نام کرده‌اید؟ 
          <Link to="/login" className="text-brand-navy font-bold mr-1 hover:underline">
            وارد شوید
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
