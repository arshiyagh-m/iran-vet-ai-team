import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from 'react-toastify';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true); // سوییچ بین ورود و ثبت‌نام
  const [formData, setFormData] = useState({ fullName: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isLogin ? '/auth/login' : '/auth/register';

    try {
      const response = await axios.post(endpoint, formData);
      
      // ذخیره توکن و اطلاعات کاربر
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userInfo', JSON.stringify(response.data));

      toast.success(isLogin ? 'با موفقیت وارد شدید' : 'ثبت نام با موفقیت انجام شد');
      navigate('/dashboard'); // هدایت به داشبورد

    } catch (error) {
      toast.error(error.response?.data?.message || 'خطایی رخ داد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-brand-navy mb-6">
          {isLogin ? 'ورود به حساب کاربری' : 'ثبت نام در سامانه'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">نام و نام خانوادگی</label>
              <input 
                type="text" name="fullName" required 
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-green outline-none"
                onChange={handleChange}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">شماره موبایل</label>
            <input 
              type="tel" name="phone" required 
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-green outline-none dir-ltr text-right"
              placeholder="0912..."
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">رمز عبور</label>
            <input 
              type="password" name="password" required 
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-green outline-none dir-ltr"
              onChange={handleChange}
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-brand-navy text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition disabled:opacity-50"
          >
            {loading ? 'در حال پردازش...' : (isLogin ? 'ورود' : 'ثبت نام')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-500">
            {isLogin ? 'حساب کاربری ندارید؟' : 'قبلاً ثبت نام کرده‌اید؟'}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-brand-green font-bold mr-2 hover:underline"
            >
              {isLogin ? 'ثبت نام کنید' : 'وارد شوید'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

