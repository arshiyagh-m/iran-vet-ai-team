import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import client from '../../api/client';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [mustChange, setMustChange] = useState(false);

  useEffect(() => {
    // چک کردن اینکه آیا کاربر "مجبور" است رمز را عوض کند؟
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
      
      // آپدیت لوکال استوریج (برداشتن فلگ اجبار)
      const user = JSON.parse(localStorage.getItem('user'));
      user.mustChangePassword = false;
      localStorage.setItem('user', JSON.stringify(user));

      // خروج کاربر برای امنیت
      localStorage.removeItem('token');
      navigate('/login');
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'خطا در تغییر رمز');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        {mustChange ? '⚠️ تغییر اجباری رمز عبور' : '🔒 تغییر رمز عبور'}
      </h2>
      
      {mustChange && (
        <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm mb-4">
          ادمین رمز شما را ریست کرده است. برای ادامه فعالیت باید رمز جدید بسازید.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">رمز فعلی</label>
          <input type="password" required className="w-full px-4 py-3 rounded-xl border" 
            value={data.currentPassword} onChange={e => setData({...data, currentPassword: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">رمز جدید</label>
          <input type="password" required className="w-full px-4 py-3 rounded-xl border" 
            value={data.newPassword} onChange={e => setData({...data, newPassword: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">تکرار رمز جدید</label>
          <input type="password" required className="w-full px-4 py-3 rounded-xl border" 
            value={data.confirmPassword} onChange={e => setData({...data, confirmPassword: e.target.value})} />
        </div>
        
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">
          تغییر رمز عبور
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;

