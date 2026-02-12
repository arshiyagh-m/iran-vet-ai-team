import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { FaCoins, FaSearch, FaBan, FaKey, FaUserShield, FaUnlock, FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  // دریافت لیست کاربران
  const fetchUsers = () => {
    client.get('/admin/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchUsers(); }, []);

  // ۱. شارژ دستی توکن
  const handleCharge = async (userId, currentName) => {
    const amount = prompt(`تعداد توکن برای اضافه کردن به ${currentName}:`, "10");
    if (amount && !isNaN(amount)) {
      try {
        // 🔥 تغییر مهم: استفاده از POST به جای PUT (مطابق با server.js)
        const res = await client.post('/admin/users/charge', { userId, tokens: parseInt(amount) });
        
        toast.success(res.data.message || `حساب ${currentName} شارژ شد ✅`);
        fetchUsers(); // رفرش لیست برای دیدن موجودی جدید
      } catch (err) { 
        console.error(err);
        toast.error(err.response?.data?.message || 'خطا در عملیات شارژ'); 
      }
    }
  };

  // ۲. تغییر رمز عبور کاربر
  const handleResetPass = async (userId, currentName) => {
    const newPass = prompt(`رمز عبور جدید برای ${currentName} را وارد کنید (حداقل ۴ رقم):`);
    if (newPass) {
        if(newPass.length < 4) return toast.error('رمز عبور باید حداقل ۴ رقم باشد');
        
        try {
            await client.post('/admin/users/reset-password', { userId, newPassword: newPass });
            toast.success('رمز عبور با موفقیت تغییر کرد 🔑');
        } catch(err) { 
            toast.error(err.response?.data?.message || 'خطا در تغییر رمز'); 
        }
    }
  };

  // ۳. مسدود کردن (بن) کاربر
  const handleBan = async (userId, currentRole) => {
    if(currentRole === 'admin') {
        return toast.error('نمی‌توانید مدیر سیستم را مسدود کنید!');
    }

    const confirmMsg = currentRole === 'banned' 
        ? 'آیا می‌خواهید این کاربر را رفع مسدودیت کنید؟' 
        : 'آیا مطمئن هستید؟ کاربر دیگر نمی‌تواند وارد حساب خود شود.';

    if(window.confirm(confirmMsg)) {
        try {
            const res = await client.post('/admin/users/ban', { userId: userId });
            toast.success(res.data.message);
            fetchUsers();
        } catch(err) { 
            toast.error(err.response?.data?.message || 'خطا در انجام عملیات'); 
        }
    }
  };

  // فیلتر جستجو
  const filteredUsers = users.filter(u => 
    (u.fullName || '').includes(search) || 
    (u.phone || '').includes(search) || 
    (u.email || '').includes(search)
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fadeIn">
      
      {/* هدر و جستجو */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <FaUserShield className="text-blue-600" /> مدیریت کاربران
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">{users.length} نفر</span>
        </h2>
        
        <div className="relative w-full md:w-64">
           <input 
             placeholder="جستجو (نام، موبایل، ایمیل)..." 
             className="w-full bg-gray-50 border border-gray-200 p-2.5 pr-9 rounded-xl outline-none focus:border-blue-400 transition" 
             onChange={e => setSearch(e.target.value)} 
           />
           <FaSearch className="absolute right-3 top-3.5 text-gray-400" />
        </div>
      </div>
      
      {/* جدول */}
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-right text-sm">
          <thead className="bg-gray-50 text-gray-600 font-bold">
            <tr>
              <th className="p-4">کاربر</th>
              <th className="p-4">اطلاعات تماس</th>
              <th className="p-4 text-center">وضعیت</th>
              <th className="p-4 text-center">موجودی</th>
              <th className="p-4 text-center">عملیات مدیریتی</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.length === 0 ? (
                <tr><td colSpan="5" className="p-6 text-center text-gray-400">کاربری یافت نشد.</td></tr>
            ) : (
                filteredUsers.map(user => (
                  <tr key={user._id} className={`hover:bg-blue-50/30 transition ${user.role === 'banned' ? 'bg-red-50' : ''}`}>
                    
                    {/* نام */}
                    <td className="p-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${user.role === 'admin' ? 'bg-indigo-600' : 'bg-blue-500'}`}>
                                <FaUser />
                            </div>
                            <span className="font-bold text-gray-800">{user.fullName}</span>
                        </div>
                    </td>

                    {/* تماس */}
                    <td className="p-4">
                        <div className="flex flex-col">
                            <span className="font-mono text-gray-700">{user.phone}</span>
                            <span className="text-xs text-gray-400 font-mono">{user.email}</span>
                        </div>
                    </td>

                    {/* نقش */}
                    <td className="p-4 text-center">
                        {user.role === 'admin' && <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold border border-indigo-200">مدیر کل</span>}
                        {user.role === 'user' && <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-xs border border-emerald-100">کاربر فعال</span>}
                        {user.role === 'banned' && <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold shadow-sm">مسدود ⛔</span>}
                    </td>

                    {/* توکن */}
                    <td className="p-4 text-center">
                        <span className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                            {user.tokens}
                        </span>
                    </td>

                    {/* دکمه‌ها */}
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        
                        <button 
                            onClick={() => handleCharge(user._id, user.fullName)} 
                            className="bg-amber-400 hover:bg-amber-500 text-white p-2 rounded-lg transition shadow-sm"
                            title="افزایش اعتبار"
                        >
                            <FaCoins />
                        </button>

                        <button 
                            onClick={() => handleResetPass(user._id, user.fullName)} 
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition shadow-sm"
                            title="تغییر رمز عبور"
                        >
                            <FaKey />
                        </button>

                        {user.role !== 'admin' && (
                            <button 
                                onClick={() => handleBan(user._id, user.role)} 
                                className={`${user.role === 'banned' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white p-2 rounded-lg transition shadow-sm`}
                                title={user.role === 'banned' ? 'رفع مسدودیت' : 'مسدود کردن'}
                            >
                                {user.role === 'banned' ? <FaUnlock /> : <FaBan />}
                            </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
