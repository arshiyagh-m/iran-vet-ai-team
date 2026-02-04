import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUserPlus } from 'react-icons/fa';
import client from '../../api/client'; // اتصال به سرور

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '', // اضافه شد
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return toast.error('رمز عبور و تکرار آن مطابقت ندارند');
    }

    setLoading(true);

    try {
      // ارسال به سرور (شماره موبایل هم فرستاده میشه)
      await client.post('/auth/register', {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      toast.success('ثبت نام با موفقیت انجام شد! حالا وارد شوید. 🎉');
      navigate('/login');
      
    } catch (error) {
      const msg = error.response?.data?.message || 'خطا در ثبت نام.';
      toast.error(msg);
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

        <h2 className="text-2xl font-bold text-center text-brand-navy mb-8">ایجاد حساب جدید</h2>

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

          {/* فیلد شماره موبایل اضافه شد */}
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
