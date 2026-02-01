import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaStethoscope } from 'react-icons/fa';
// ایمپورت کلاینت برای درخواست به سرور
// import client from '../../api/client'; 

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // فعلاً چون بک‌ند وصل نیست، شبیه‌سازی می‌کنیم
      // const res = await client.post('/auth/login', formData);
      
      // شبیه‌سازی موفقیت (بعداً پاک میشه)
      setTimeout(() => {
        localStorage.setItem('token', 'fake-jwt-token'); // ذخیره توکن
        toast.success('خوش آمدید! 👋');
        navigate('/dashboard'); // هدایت به داشبورد
      }, 1500);

    } catch (error) {
      toast.error('اطلاعات ورود اشتباه است.');
    } finally {
      // setLoading(false); // در حالت واقعی آنکامنت شود
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        {/* لوگو بالای فرم */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-brand-navy rounded-2xl flex items-center justify-center text-white text-3xl">
            <FaStethoscope />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-brand-navy mb-2">ورود به حساب کاربری</h2>
        <p className="text-center text-gray-500 mb-8 text-sm">برای استفاده از دستیار هوشمند وارد شوید</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ایمیل یا شماره موبایل</label>
            <input 
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-green focus:ring-2 focus:ring-green-100 outline-none transition"
              placeholder="example@mail.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">رمز عبور</label>
              <a href="#" className="text-xs text-brand-green hover:underline">رمز را فراموش کردید؟</a>
            </div>
            <input 
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-green focus:ring-2 focus:ring-green-100 outline-none transition"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-navy text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg shadow-blue-900/20 flex justify-center items-center"
          >
            {loading ? 'در حال پردازش...' : 'ورود به سیستم'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          حساب کاربری ندارید؟ 
          <Link to="/register" className="text-brand-green font-bold mr-1 hover:underline">
            ثبت نام رایگان
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;

