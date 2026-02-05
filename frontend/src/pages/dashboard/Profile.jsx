import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaUserEdit, FaSave, FaIdCard, FaBriefcase } from 'react-icons/fa';
import client from '../../api/client';

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    jobType: 'other' // پیش‌فرض
  });

  // خواندن اطلاعات اولیه از لوکال استوریج (یا سرور)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setFormData({
        fullName: parsed.name || '',
        email: parsed.email || '',
        phone: parsed.phone || '', // اگر توی لوکال ذخیره نکرده بودیم خالی میذاره
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
      // ارسال درخواست آپدیت به سرور
      const res = await client.put('/auth/profile', formData);

      // آپدیت کردن لوکال استوریج با اطلاعات جدید
      const updatedUser = res.data.user;
      
      // چون ساختار لوکال استوریج ما {name, role, ...} هست باید مپ کنیم
      const storageData = {
        name: updatedUser.name,
        role: updatedUser.role,
        tokens: updatedUser.tokens,
        email: updatedUser.email,
        phone: updatedUser.phone,
        jobType: updatedUser.jobType
      };
      
      localStorage.setItem('user', JSON.stringify(storageData));
      
      toast.success('اطلاعات پروفایل با موفقیت بروزرسانی شد ✅');
      
      // یک ریلود ریز برای اینکه هدر و سایدبار هم آپدیت بشن
      setTimeout(() => window.location.reload(), 1000);

    } catch (error) {
      console.error(error);
      toast.error('خطا در ذخیره اطلاعات. شاید ایمیل تکراری باشد.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* هدر */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex items-center gap-4">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-200">
          <FaUserEdit />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ویرایش پروفایل</h2>
          <p className="text-gray-500">اطلاعات هویتی و شغلی خود را تکمیل کنید</p>
        </div>
      </div>

      {/* فرم ویرایش */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* نام و نام خانوادگی */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نام و نام خانوادگی</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
                <FaIdCard className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>

            {/* شماره موبایل */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">شماره موبایل</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition dir-ltr text-left"
              />
            </div>

            {/* ایمیل */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ایمیل</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition dir-ltr text-left"
              />
            </div>

            {/* انتخاب شغل (جدید) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">حوزه فعالیت (شغل)</label>
              <div className="relative">
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition appearance-none bg-white"
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

          <div className="border-t border-gray-100 pt-6 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl text-white font-bold shadow-lg transition
                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'}
              `}
            >
              <FaSave />
              {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default Profile;
