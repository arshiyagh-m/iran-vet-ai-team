import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaSignInAlt, FaArrowRight, FaHome } from 'react-icons/fa';
import client from '../../api/client';
// 👇 ایمپورت لوگو
import logo from '../../assets/logo.png';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await client.post('/auth/login', formData);

      // ذخیره توکن و اطلاعات کاربر
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      toast.success(`خوش آمدید ${res.data.user.name} عزیز 👋`);

      // هدایت به داشبورد
      navigate('/dashboard');

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'ایمیل یا رمز عبور اشتباه است.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative">
        
        {/* 👇 دکمه بازگشت به خانه (بالا سمت راست) */}
        <Link to="/" className="absolute top-6 right-6 text-gray-400 hover:text-blue-600 transition" title="بازگشت به صفحه اصلی">
            <FaHome size={22} />
        </Link>

        <div className="text-center">
          {/* 👇 نمایش لوگو بالای فرم */}
          <div className="flex justify-center mb-4">
              <img src={logo} alt="Logo" className="h-16 w-auto object-contain" />
          </div>

          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">ورود به حساب کاربری</h2>
          <p className="mt-2 text-sm text-gray-600">
            هنوز ثبت نام نکرده‌اید؟{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 transition">
              ساخت حساب جدید
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* ایمیل */}
            <div className="relative">
              <label className="text-sm font-medium text-gray-700 mb-1 block">ایمیل</label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition dir-ltr text-left"
                  placeholder="example@mail.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>

            {/* رمز عبور */}
            <div className="relative">
              <label className="text-sm font-medium text-gray-700 mb-1 block">رمز عبور</label>
              <div className="relative">
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition dir-ltr text-left"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <FaLock className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>

          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <a href="mailto:admin@vetai.com?subject=فراموشی رمز عبور" className="font-medium text-blue-600 hover:text-blue-500">
                رمز عبور را فراموش کرده‌اید؟
              </a>
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
              <FaSignInAlt className={`${loading ? 'hidden' : 'h-5 w-5 text-blue-300 group-hover:text-blue-100'}`} />
            </span>
            {loading ? 'در حال ورود...' : 'ورود به پنل'}
          </button>
        </form>
        
        {/* 👇 دکمه بازگشت به خانه (پایین فرم) */}
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
