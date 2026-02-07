import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { toast } from 'react-toastify';
import { FaMoneyBillWave, FaHistory, FaSearch } from 'react-icons/fa';

const AdminFinance = () => {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ userId: '', amount: '', tokens: '', description: '' });
  const [searchUser, setSearchUser] = useState('');

  const loadData = async () => {
    const [uRes, tRes] = await Promise.all([client.get('/admin/users'), client.get('/admin/finance')]);
    setUsers(uRes.data);
    setTransactions(tRes.data);
  };

  useEffect(() => { loadData(); }, []);

  const handleCharge = async (e) => {
    e.preventDefault();
    if(!form.userId) return toast.error('کاربر را انتخاب کنید');
    try {
      await client.post('/admin/finance/charge', form);
      toast.success('شارژ انجام شد ✅');
      setForm({ userId: '', amount: '', tokens: '', description: '' });
      loadData();
    } catch (err) { toast.error('خطا'); }
  };

  // فیلتر کاربران برای سلکت باکس
  const filteredUsers = users.filter(u => u.fullName.includes(searchUser) || u.phone.includes(searchUser));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* فرم ثبت تراکنش */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-green-700">
          <FaMoneyBillWave /> ثبت تراکنش دستی (شارژ حساب)
        </h2>
        
        <form onSubmit={handleCharge} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold mb-1">جستجوی کاربر (نام یا موبایل)</label>
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="تایپ کنید..." 
                    className="w-full p-2 border rounded-lg mb-2 bg-gray-50"
                    onChange={e => setSearchUser(e.target.value)}
                />
                <select 
                    className="w-full p-3 border rounded-xl bg-white" 
                    onChange={e => setForm({...form, userId: e.target.value})}
                    value={form.userId}
                    required
                    size={5} // نمایش لیست باز
                >
                    {filteredUsers.map(u => (
                        <option key={u._id} value={u._id}>{u.fullName} | {u.phone} | موجودی: {u.tokens}</option>
                    ))}
                </select>
            </div>
          </div>

          <div>
             <label className="block text-sm font-bold mb-1">مبلغ دریافتی (تومان)</label>
             <input type="number" className="w-full p-3 border rounded-xl" required
                value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
          </div>
          <div>
             <label className="block text-sm font-bold mb-1">تعداد توکن</label>
             <input type="number" className="w-full p-3 border rounded-xl" required
                value={form.tokens} onChange={e => setForm({...form, tokens: e.target.value})} />
          </div>
          <div className="md:col-span-2">
             <label className="block text-sm font-bold mb-1">توضیحات (شماره فیش/ارجاع)</label>
             <input type="text" className="w-full p-3 border rounded-xl" placeholder="مثلاً: کارت به کارت فیش شماره 123456"
                value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          
          <button type="submit" className="md:col-span-2 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition">
            ثبت تراکنش و شارژ
          </button>
        </form>
      </div>

      {/* لیست تراکنش‌ها */}
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h3 className="font-bold mb-4 flex items-center gap-2"><FaHistory /> تاریخچه تراکنش‌ها</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3">کاربر</th>
                <th className="p-3">مبلغ</th>
                <th className="p-3">توکن</th>
                <th className="p-3">توضیحات</th>
                <th className="p-3">توسط</th>
                <th className="p-3">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-bold">{t.user?.fullName}</td>
                  <td className="p-3 text-green-600">{t.amount.toLocaleString()} ت</td>
                  <td className="p-3 font-bold text-blue-600">+{t.tokens}</td>
                  <td className="p-3 text-gray-500">{t.description}</td>
                  <td className="p-3 text-xs">{t.admin?.fullName}</td>
                  <td className="p-3 text-gray-400">{new Date(t.date).toLocaleDateString('fa-IR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AdminFinance;

