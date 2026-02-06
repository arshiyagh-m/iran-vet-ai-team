import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaUserPlus, FaHome, FaArrowRight } from 'react-icons/fa';
import client from '../../api/client';
// 👇 لوگو را ایمپورت می‌کنیم
import logo from '../../assets/logo.png';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // 👇 استیت جدید برای چک‌باکس قوانین
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ۱. بررسی تطابق رمز عبور
    if (formData.password !== formData.confirmPassword) {
      return toast.error('رمز عبور و تکرار آن مطابقت ندارند.');
    }

    // ۲. بررسی تیک قوانین (مهم)
    if (!acceptedTerms) {
        return toast.warn('لطفاً قوانین و مقررات را مطالعه و تأیید کنید.');
    }

    setLoading(true);

    try {
      const res = await client.post('/auth/register', {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      // ذخیره و هدایت
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      toast.success(`ثبت نام موفقیت‌آمیز بود. خوش آمدید ${res.data.user.name} 👋`);
      navigate('/dashboard');

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'خطا در ثبت نام.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative">
        
        {/* دکمه بازگشت به خانه (بالا) */}
        <Link to="/" className="absolute top-6 right-6 text-gray-400 hover:text-blue-600 transition" title="بازگشت به صفحه اصلی">
            <FaHome size={22} />
        </Link>

        <div className="text-center">
          {/* لوگو */}
          <div className="flex justify-center mb-4">
              <img src={logo} alt="Logo" className="h-16 w-auto object-contain" />
          </div>

          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">ایجاد حساب کاربری</h2>
          <p className="mt-2 text-sm text-gray-600">
            قبلاً ثبت نام کرده‌اید؟{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition">
              وارد شوید
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          
          {/* نام کامل */}
          <div className="relative">
            <div className="relative">
              <input name="fullName" type="text" required className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="نام و نام خانوادگی" value={formData.fullName} onChange={handleChange} />
              <FaUser className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          {/* ایمیل */}
          <div className="relative">
            <div className="relative">
              <input name="email" type="email" required className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition dir-ltr text-left" placeholder="example@mail.com" value={formData.email} onChange={handleChange} />
              <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          {/* موبایل */}
          <div className="relative">
            <div className="relative">
              <input name="phone" type="tel" required className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition dir-ltr text-left" placeholder="0912..." value={formData.phone} onChange={handleChange} />
              <FaPhone className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          {/* رمز عبور */}
          <div className="relative">
            <div className="relative">
              <input name="password" type="password" required className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition dir-ltr text-left" placeholder="رمز عبور" value={formData.password} onChange={handleChange} />
              <FaLock className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          {/* تکرار رمز */}
          <div className="relative">
            <div className="relative">
              <input name="confirmPassword" type="password" required className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition dir-ltr text-left" placeholder="تکرار رمز عبور" value={formData.confirmPassword} onChange={handleChange} />
              <FaLock className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          {/* 👇 قسمت جدید: چک‌باکس قوانین */}
          <div className="flex items-start gap-3 py-2 px-1">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
            </div>
            <div className="text-sm">
              <label htmlFor="terms" className="font-medium text-gray-700 cursor-pointer select-none">
                من <Link to="/terms" target="_blank" className="text-blue-600 hover:underline font-bold">قوانین و مقررات</Link> سایت را مطالعه کرده و می‌پذیرم.
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white transition-all
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 shadow-lg shadow-blue-900/30'}
            `}
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <FaUserPlus className={`${loading ? 'hidden' : 'h-5 w-5 text-blue-300 group-hover:text-blue-100'}`} />
            </span>
            {loading ? 'در حال ثبت نام...' : 'ثبت نام نهایی'}
          </button>
        </form>

        {/* دکمه بازگشت به خانه (پایین) */}
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

export default Register;
