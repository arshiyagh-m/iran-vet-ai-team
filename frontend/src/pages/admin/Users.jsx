import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaEdit, FaBan, FaKey, FaSearch } from 'react-icons/fa';

const UsersManager = () => {
  // دیتای تستی
  const [users, setUsers] = useState([
    { id: 1, name: 'ارشیا قنبری', email: 'arshia@test.com', role: 'مدیر', tokens: 9999 },
    { id: 2, name: 'امین پاشایی', email: 'amin@test.com', role: 'مدیر', tokens: 9999 },
    { id: 3, name: 'کاربر معمولی', email: 'user@gmail.com', role: 'کاربر', tokens: 10 },
  ]);

  const handleResetPassword = (userName) => {
    // اینجا ادمین رمز رو ریست میکنه
    const newPass = prompt(`لطفاً رمز عبور جدید برای ${userName} را وارد کنید:`);
    if (newPass) {
      // API call to reset password
      toast.success(`رمز عبور ${userName} با موفقیت به "${newPass}" تغییر کرد.`);
    }
  };

  const handleBanUser = (id) => {
    if(window.confirm('آیا از مسدود کردن این کاربر مطمئن هستید؟')) {
      toast.info('کاربر مسدود شد.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">مدیریت کاربران</h2>
        <div className="relative w-64">
          <input type="text" placeholder="جستجو با ایمیل یا نام..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-red-500" />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
            <tr>
              <th className="py-4 px-6">نام کاربر</th>
              <th className="py-4 px-6">ایمیل / موبایل</th>
              <th className="py-4 px-6">موجودی توکن</th>
              <th className="py-4 px-6">نقش</th>
              <th className="py-4 px-6 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition">
                <td className="py-4 px-6 font-bold text-gray-800">{user.name}</td>
                <td className="py-4 px-6 text-gray-600 text-sm font-mono">{user.email}</td>
                <td className="py-4 px-6">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">{user.tokens}</span>
                </td>
                <td className="py-4 px-6">
                  <span className={`text-xs px-2 py-1 rounded ${user.role === 'مدیر' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-4 px-6 flex justify-center gap-2">
                  <button 
                    onClick={() => handleResetPassword(user.name)}
                    title="تغییر رمز عبور"
                    className="p-2 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition"
                  >
                    <FaKey />
                  </button>
                  <button 
                    title="ویرایش موجودی"
                    className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => handleBanUser(user.id)}
                    title="مسدود کردن"
                    className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                  >
                    <FaBan />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersManager;

