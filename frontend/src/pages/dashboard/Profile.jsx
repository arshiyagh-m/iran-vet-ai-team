import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; // اضافه شد
import { FaUserEdit, FaSave, FaIdCard, FaBriefcase, FaLock, FaShieldAlt } from 'react-icons/fa';
import client from '../../api/client';

const Profile = () => {
  const navigate = useNavigate(); // برای هدایت به صفحه تغییر رمز
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    jobType: 'other'
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setFormData({
        fullName: parsed.name || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
        jobType: parsed.jobType || 'other'
      });
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await client.put('/auth/profile', formData);
      const updatedUser = res.data.user;
      
      const storageData = {
        name: updatedUser.name,
        role: updatedUser.role,
        tokens: updatedUser.tokens,
        email: updatedUser.email,
        phone: updatedUser.phone,
        jobType: updatedUser.jobType,
        mustChangePassword: updatedUser.mustChangePassword
      };
      
      localStorage.setItem('user', JSON.stringify(storageData));
      toast.success('اطلاعات پروفایل با موفقیت بروزرسانی شد ✅');
      setTimeout(() => window.location.reload(), 1000);

    } catch (error) {
      console.error(error);
      toast.error('خطا در ذخیره اطلاعات.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      
      {/* هدر */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex items-center gap-4">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-200">
          <FaUserEdit />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">پروفایل کاربری</h2>
          <p className="text-gray-500">مدیریت اطلاعات شخصی و امنیتی</p>
        </div>
      </div>

      {/* ۱. فرم ویرایش مشخصات */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h3 className="font-bold text-lg text-gray-800 mb-6 border-b pb-2 flex items-center gap-2">
            <FaIdCard className="text-blue-500" /> مشخصات فردی
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نام و نام خانوادگی</label>
              <input 
                type="text" 
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">شماره موبایل</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition dir-ltr text-left"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ایمیل</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition dir-ltr text-left"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">حوزه فعالیت</label>
              <div className="relative">
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition appearance-none bg-white"
                >
                  <option value="student">🎓 دانشجوی دامپزشکی</option>
                  <option value="vet">🩺 دامپزشک</option>
                  <option value="owner">🐄 دامدار / پرورش‌دهنده</option>
                  <option value="other">👤 سایر علاقه مندان</option>
                </select>
                <FaBriefcase className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold shadow-lg transition
                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
              `}
            >
              <FaSave />
              {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
          </div>
        </form>
      </div>

      {/* ۲. بخش امنیت (دکمه تغییر رمز) - جدید اضافه شد 👇 */}
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center text-xl">
                    <FaShieldAlt />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-gray-800">امنیت حساب کاربری</h3>
                    <p className="text-sm text-gray-500">برای امنیت بیشتر، رمز عبور خود را دوره‌ای تغییر دهید.</p>
                </div>
            </div>
            
            <button 
                onClick={() => navigate('/dashboard/change-password')}
                className="flex items-center gap-2 px-6 py-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl transition font-medium w-full md:w-auto justify-center"
            >
                <FaLock />
                تغییر رمز عبور
            </button>
        </div>
      </div>

    </div>
  );
};

export default Profile;
