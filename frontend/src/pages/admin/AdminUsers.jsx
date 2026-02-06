import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { FaCoins, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  const fetchUsers = () => {
    client.get('/admin/users').then(res => setUsers(res.data));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCharge = async (userId, currentName) => {
    const amount = prompt(`تعداد توکن برای اضافه کردن به ${currentName}:`, "10");
    if (amount) {
      try {
        await client.put('/admin/users/charge', { userId, tokens: amount });
        toast.success('شارژ انجام شد ✅');
        fetchUsers();
      } catch (err) { toast.error('خطا'); }
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">لیست کاربران</h2>
        <div className="relative">
           <input placeholder="جستجو..." className="bg-gray-100 p-2 pr-8 rounded-lg outline-none" onChange={e => setSearch(e.target.value)} />
           <FaSearch className="absolute right-2 top-3 text-gray-400" />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3">نام</th>
              <th className="p-3">موبایل</th>
              <th className="p-3">نقش</th>
              <th className="p-3">توکن</th>
              <th className="p-3">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u => u.fullName.includes(search) || u.phone.includes(search)).map(user => (
              <tr key={user._id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-bold">{user.fullName}</td>
                <td className="p-3">{user.phone}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{user.role}</span></td>
                <td className="p-3 font-bold text-green-600">{user.tokens}</td>
                <td className="p-3">
                  <button onClick={() => handleCharge(user._id, user.fullName)} className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 shadow">
                    <FaCoins /> شارژ
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
export default AdminUsers;
