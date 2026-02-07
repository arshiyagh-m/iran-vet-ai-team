import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaSignInAlt, FaUserPlus, FaArrowRight, FaHome, FaUser, FaPhone } from 'react-icons/fa';
import client from '../../api/client';
import logo from '../../assets/logo.png';

const Login = () => {
  const navigate = useNavigate();
  
  // 👇 استیت برای تشخیص حالت (ورود یا ثبت نام)
  const [isLoginMode, setIsLoginMode] = useState(true); 
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 👇 تابع تغییر حالت بین ورود و ثبت نام
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setAcceptedTerms(false); // ریست کردن تیک قوانین
    setFormData({ ...formData, password: '', confirmPassword: '' }); // پاک کردن رمزها برای امنیت
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🛑 اعتبارسنجی‌های حالت ثبت نام
    if (!isLoginMode) {
      if (formData.password !== formData.confirmPassword) {
        return toast.error('رمز عبور و تکرار آن مطابقت ندارند.');
      }
      if (!acceptedTerms) {
        return toast.warn('لطفاً قوانین و مقررات را مطالعه و تأیید کنید.');
      }
    }

    setLoading(true);

    // 👇 تعیین آدرس API بر اساس حالت
    const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
    
    // 👇 داده‌های ارسالی (در حالت ورود فقط ایمیل و رمز، در ثبت نام همه موارد)
    const payload = isLoginMode 
      ? { email: formData.email, password: formData.password }
      : { 
          fullName: formData.fullName, 
          email: formData.email, 
          phone: formData.phone, 
          password: formData.password 
        };

    try {
      const res = await client.post(endpoint, payload);

      // ✅ اصلاح مهم: ترکیب اطلاعات کاربر و توکن در یک آبجکت
      const userData = {
        ...res.data.user,    // نام، ایمیل، نقش و...
        token: res.data.token // توکن هم اینجا اضافه شد تا AdminRoute ببیند
      };

      // ذخیره در LocalStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', res.data.token); // محض احتیاط جدا هم نگه می‌داریم

      toast.success(isLoginMode ? `خوش آمدید ${res.data.user.name || 'کاربر عزیز'} 👋` : 'حساب کاربری با موفقیت ساخته شد 🎉');
      
      // ✅ اصلاح مسیر هدایت: اگر ادمین بود بره پنل ادمین، وگرنه داشبورد
      if (res.data.user.role === 'admin') {
          navigate('/admin');
      } else {
          navigate('/dashboard');
      }

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'خطا در برقراری ارتباط با سرور.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative transition-all duration-500 ease-in-out">
        
        {/* دکمه خانه */}
        <Link to="/" className="absolute top-6 right-6 text-gray-400 hover:text-blue-600 transition" title="بازگشت به صفحه اصلی">
            <FaHome size={22} />
        </Link>

        <div className="text-center">
          <div className="flex justify-center mb-4">
              <img src={logo} alt="Logo" className="h-16 w-auto object-contain" />
          </div>

          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
            {isLoginMode ? 'ورود به حساب کاربری' : 'ایجاد حساب جدید'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLoginMode ? 'هنوز حساب ندارید؟ ' : 'قبلاً ثبت نام کرده‌اید؟ '}
            <button 
              onClick={toggleMode} 
              className="font-bold text-blue-600 hover:text-blue-500 transition underline cursor-pointer"
            >
              {isLoginMode ? 'ثبت نام کنید' : 'وارد شوید'}
            </button>
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          
          {/* 👇 فیلدهای مخصوص ثبت نام (فقط وقتی isLoginMode فالس است نشان بده) */}
          {!isLoginMode && (
            <>
              <div className="relative animate-fadeIn">
                <input name="fullName" type="text" required className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="نام و نام خانوادگی" value={formData.fullName} onChange={handleChange} />
                <FaUser className="absolute left-3 top-3.5 text-gray-400" />
              </div>
              
              <div className="relative animate-fadeIn">
                <input name="phone" type="tel" required className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition dir-ltr text-left" placeholder="0912..." value={formData.phone} onChange={handleChange} />
                <FaPhone className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </>
          )}

          {/* 👇 فیلدهای مشترک (ایمیل و رمز) */}
          <div className="relative">
            <input name="email" type="email" required className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition dir-ltr text-left" placeholder="ایمیل (example@mail.com)" value={formData.email} onChange={handleChange} />
            <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
          </div>

          <div className="relative">
            <input name="password" type="password" required className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition dir-ltr text-left" placeholder="رمز عبور" value={formData.password} onChange={handleChange} />
            <FaLock className="absolute left-3 top-3.5 text-gray-400" />
          </div>

          {/* 👇 تکرار رمز (فقط در ثبت نام) */}
          {!isLoginMode && (
            <div className="relative animate-fadeIn">
              <input name="confirmPassword" type="password" required className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition dir-ltr text-left" placeholder="تکرار رمز عبور" value={formData.confirmPassword} onChange={handleChange} />
              <FaLock className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          )}

          {/* 👇 تیک قوانین (فقط در ثبت نام) */}
          {!isLoginMode && (
            <div className="flex items-start gap-3 py-2 px-1 animate-fadeIn">
              <input
                id="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                من <Link to="/terms" target="_blank" className="text-blue-600 hover:underline font-bold">قوانین و مقررات</Link> را مطالعه کرده و می‌پذیرم.
              </label>
            </div>
          )}

          {/* 👇 لینک فراموشی رمز (فقط در ورود) */}
          {isLoginMode && (
            <div className="flex justify-end animate-fadeIn">
              <a href="mailto:admin@vetai.com?subject=فراموشی رمز عبور" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                رمز عبور را فراموش کرده‌اید؟
              </a>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white transition-all
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/30'}
            `}
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              {isLoginMode ? (
                  <FaSignInAlt className={`${loading ? 'hidden' : 'h-5 w-5 text-blue-300'}`} />
              ) : (
                  <FaUserPlus className={`${loading ? 'hidden' : 'h-5 w-5 text-blue-300'}`} />
              )}
            </span>
            {loading ? 'لطفاً صبر کنید...' : (isLoginMode ? 'ورود به پنل' : 'ثبت نام نهایی')}
          </button>
        </form>
        
        <div className="text-center mt-6 pt-6 border-t border-gray-100">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-slate-900 font-medium transition">
                <FaArrowRight size={14} />
                بازگشت به صفحه اصلی سایت
            </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
