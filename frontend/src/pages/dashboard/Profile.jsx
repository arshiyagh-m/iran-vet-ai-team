import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaUserShield, FaKey, FaSave } from 'react-icons/fa';

const Profile = () => {
  const [userData, setUserData] = useState({ name: '', email: '' });
  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    // پر کردن اطلاعات پروفایل از حافظه
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserData({ 
        name: parsed.name || 'کاربر', 
        email: parsed.email || 'ثبت نشده' 
      });
    }
  }, []);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) {
      return toast.error('رمز جدید با تکرار آن مطابقت ندارد!');
    }
    // چون هنوز API تغییر رمز نداریم، فعلا نمایشی است
    toast.success('درخواست تغییر رمز ثبت شد (نسخه دمو) ✅');
    setPassData({ current: '', new: '', confirm: '' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* کارت اطلاعات کلی */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center text-white text-2xl">
            <FaUserShield />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">اطلاعات حساب کاربری</h2>
            <p className="text-gray-500">مشاهده اطلاعات شخصی</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-500 mb-1">نام و نام خانوادگی</label>
            <input type="text" value={userData.name} disabled className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none text-gray-700 font-bold" />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">ایمیل / نام کاربری</label>
            <input type="text" value={userData.email} disabled className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none text-gray-700 font-mono" />
          </div>
        </div>
      </div>

      {/* کارت امنیت (تغییر رمز) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
          <FaKey className="text-yellow-500 text-xl" />
          <h2 className="text-lg font-bold text-gray-800">تغییر رمز عبور</h2>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رمز عبور فعلی</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 outline-none transition"
              value={passData.current}
              onChange={e => setPassData({...passData, current: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رمز عبور جدید</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 outline-none transition"
              value={passData.new}
              onChange={e => setPassData({...passData, new: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تکرار رمز جدید</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 outline-none transition"
              value={passData.confirm}
              onChange={e => setPassData({...passData, confirm: e.target.value})}
            />
          </div>

          <button type="submit" className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200">
            <FaSave />
            ذخیره تغییرات
          </button>
        </form>
      </div>

    </div>
  );
};

export default Profile;
