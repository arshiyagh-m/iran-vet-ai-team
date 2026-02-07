import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaUserEdit, FaSave, FaIdCard, FaBriefcase, FaLock, FaShieldAlt, FaPhone, FaEnvelope, FaUser } from 'react-icons/fa';
import client from '../../api/client';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    jobType: 'other'
  });

  // دریافت اطلاعات کاربر (اول از سرور، اگر نشد از لوکال استوریج)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await client.get('/users/profile'); // آدرس صحیح بک‌اند
        const user = res.data;
        setFormData({
          fullName: user.fullName || '',
          email: user.email || '',
          phone: user.phone || '',
          jobType: user.jobType || 'other'
        });
        
        // آپدیت لوکال استوریج همگام با سرور
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('Error fetching profile:', error);
        // فال‌بک: اگر سرور جواب نداد، از لوکال استوریج بخون
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setFormData({
            fullName: parsed.name || parsed.fullName || '',
            email: parsed.email || '',
            phone: parsed.phone || '',
            jobType: parsed.jobType || 'other'
          });
        }
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ارسال به آدرس صحیح بک‌اند
      const res = await client.put('/users/profile', formData);
      const updatedUser = res.data;
      
      // ساختار ذخیره‌سازی در لوکال استوریج
      const storageData = {
        name: updatedUser.fullName, // در فرانت معمولا name استفاده کردیم
        fullName: updatedUser.fullName,
        role: updatedUser.role,
        tokens: updatedUser.tokens,
        email: updatedUser.email,
        phone: updatedUser.phone,
        jobType: updatedUser.jobType,
        mustChangePassword: updatedUser.mustChangePassword
      };
      
      localStorage.setItem('user', JSON.stringify(storageData));
      
      // تریگر کردن رویداد استوریج برای آپدیت هدر و سایدبار
      window.dispatchEvent(new Event("storage"));

      toast.success('پروفایل با موفقیت بروزرسانی شد ✅');
      
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'خطا در ذخیره اطلاعات.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10 animate-fadeIn">
      
      {/* هدر */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-3xl shadow-xl p-8 flex items-center gap-6 text-white relative overflow-hidden">
        <div className="relative z-10 w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl border border-white/20">
          <FaUserEdit />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-1">پروفایل کاربری</h2>
          <p className="text-blue-200">مدیریت اطلاعات شخصی و شغلی</p>
        </div>
        {/* المان‌های تزئینی */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ستون راست: فرم اصلی */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2 border-b pb-4">
                    <FaIdCard className="text-blue-600" /> مشخصات فردی
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-gray-700 mb-2 block">نام و نام خانوادگی</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white outline-none transition"
                                />
                                <FaUser className="absolute right-3 top-3.5 text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-gray-700 mb-2 block">شماره موبایل</label>
                            <div className="relative">
                                <input 
                                    type="tel" 
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white outline-none transition dir-ltr text-left"
                                />
                                <FaPhone className="absolute right-3 top-3.5 text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-gray-700 mb-2 block">ایمیل (نام کاربری)</label>
                            <div className="relative">
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-500 cursor-not-allowed dir-ltr text-left"
                                />
                                <FaEnvelope className="absolute right-3 top-3.5 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-400 mt-1 mr-1">ایمیل قابل تغییر نیست.</p>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-gray-700 mb-2 block">حوزه فعالیت</label>
                            <div className="relative">
                                <select
                                    name="jobType"
                                    value={formData.jobType}
                                    onChange={handleChange}
                                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white outline-none transition appearance-none"
                                >
                                    <option value="student">🎓 دانشجوی دامپزشکی</option>
                                    <option value="vet">🩺 دامپزشک</option>
                                    <option value="owner">🐄 دامدار / پرورش‌دهنده</option>
                                    <option value="other">👤 سایر علاقه‌مندان</option>
                                </select>
                                <FaBriefcase className="absolute right-3 top-3.5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold shadow-lg shadow-blue-500/30 transition hover:-translate-y-1
                                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                            `}
                        >
                            <FaSave />
                            {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        {/* ستون چپ: امنیت */}
        <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm border border-red-100 p-6 sticky top-6">
                <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-2xl mb-4">
                    <FaShieldAlt />
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">امنیت حساب</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                    برای افزایش امنیت حساب کاربری خود، پیشنهاد می‌شود رمز عبور خود را به صورت دوره‌ای تغییر دهید.
                </p>
                
                <button 
                    onClick={() => navigate('/dashboard/change-password')}
                    className="flex items-center justify-center gap-2 w-full py-3 border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition font-bold"
                >
                    <FaLock />
                    تغییر رمز عبور
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
