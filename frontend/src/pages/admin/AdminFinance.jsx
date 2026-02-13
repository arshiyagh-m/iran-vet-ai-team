import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { toast } from 'react-toastify';
import { FaMoneyBillWave, FaHistory, FaEdit, FaCheck, FaTimes, FaCoins } from 'react-icons/fa';

const AdminFinance = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // استیت برای مودال ویرایش
  const [editModal, setEditModal] = useState({ show: false, data: null });
  const [formData, setFormData] = useState({ amount: '', description: '' });

  // دریافت لیست تراکنش‌ها
  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await client.get('/admin/finance');
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTransactions(); }, []);

  // باز کردن مودال ویرایش
  const openEditModal = (transaction) => {
    setEditModal({ show: true, data: transaction });
    setFormData({ 
        amount: transaction.amount === 0 ? '' : transaction.amount, // اگر صفر بود خالی نشان بده تا پر کند
        description: transaction.description || '' 
    });
  };

  // ثبت تغییرات (مبلغ و توضیحات)
  const handleUpdate = async () => {
    if (!formData.amount) return toast.error('لطفاً مبلغ را وارد کنید');

    try {
      await client.put(`/admin/finance/${editModal.data._id}`, {
        amount: formData.amount,
        description: formData.description
      });
      
      toast.success('تراکنش تکمیل شد 💰');
      setEditModal({ show: false, data: null });
      loadTransactions(); // رفرش لیست
    } catch (err) {
      toast.error('خطا در بروزرسانی');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* هدر */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <FaMoneyBillWave className="text-green-600" /> مدیریت مالی و تراکنش‌ها
            </h2>
            <p className="text-gray-400 text-xs mt-1">تکمیل اطلاعات تراکنش‌های انجام شده</p>
        </div>
        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl font-bold text-sm border border-green-200">
            مجموع درآمد: {transactions.reduce((acc, t) => acc + (t.amount || 0), 0).toLocaleString()} تومان
        </div>
      </div>

      {/* لیست تراکنش‌ها */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <h3 className="font-bold mb-6 flex items-center gap-2 text-gray-700"><FaHistory /> آخرین تراکنش‌های سیستم</h3>
        
        {loading ? (
            <p className="text-center text-gray-400">در حال بارگذاری...</p>
        ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-right text-sm border-collapse">
                <thead className="bg-gray-50 text-gray-500 text-xs font-bold">
                <tr>
                    <th className="p-4 rounded-r-xl">کاربر</th>
                    <th className="p-4">توکن شارژ شده</th>
                    <th className="p-4">مبلغ پرداختی (تومان)</th>
                    <th className="p-4">توضیحات / فیش</th>
                    <th className="p-4">تاریخ</th>
                    <th className="p-4 rounded-l-xl text-center">وضعیت</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                {transactions.map(t => (
                    <tr key={t._id} className="hover:bg-gray-50 transition">
                    
                    {/* نام کاربر */}
                    <td className="p-4 font-bold text-gray-800">
                        {t.user?.fullName || 'کاربر حذف شده'}
                    </td>

                    {/* تعداد توکن (غیرقابل تغییر) */}
                    <td className="p-4">
                        <div className="flex items-center gap-1 text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-lg w-fit">
                            <FaCoins className="text-xs" /> {t.tokens}
                        </div>
                    </td>

                    {/* مبلغ (قابل ویرایش) */}
                    <td className="p-4">
                        {t.amount === 0 ? (
                            <span className="text-red-500 font-bold text-xs bg-red-50 px-2 py-1 rounded">تسویه نشده (۰)</span>
                        ) : (
                            <span className="text-green-600 font-bold">{t.amount.toLocaleString()}</span>
                        )}
                    </td>

                    {/* توضیحات */}
                    <td className="p-4 text-gray-500 text-xs max-w-[200px] truncate">
                        {t.description || '-'}
                    </td>

                    {/* تاریخ */}
                    <td className="p-4 text-gray-400 text-xs">
                        {new Date(t.date).toLocaleDateString('fa-IR')} 
                        <span className="mx-1">|</span>
                        {new Date(t.date).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'})}
                    </td>

                    {/* دکمه ویرایش */}
                    <td className="p-4 text-center">
                        <button 
                            onClick={() => openEditModal(t)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm mx-auto
                                ${t.amount === 0 
                                    ? 'bg-amber-500 text-white hover:bg-amber-600 animate-pulse' // استایل برای تکمیل نشده‌ها
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200' // استایل برای تکمیل شده‌ها
                                }
                            `}
                        >
                            <FaEdit /> {t.amount === 0 ? 'تکمیل صورت‌حساب' : 'ویرایش'}
                        </button>
                    </td>

                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}
      </div>

      {/* مودال ویرایش / تکمیل تراکنش */}
      {editModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-slideUp">
                
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                        <FaMoneyBillWave className="text-green-600" />
                        تکمیل اطلاعات مالی
                    </h3>
                    <button onClick={() => setEditModal({ show: false, data: null })} className="text-gray-400 hover:text-red-500 transition">
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* اطلاعات ثابت (فقط خواندنی) */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
                        <span className="text-sm text-blue-800">تعداد توکن شارژ شده:</span>
                        <span className="font-bold text-xl text-blue-600">{editModal.data?.tokens} عدد</span>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                        <span className="text-sm text-gray-600">نام کاربر:</span>
                        <span className="font-bold text-gray-800">{editModal.data?.user?.fullName}</span>
                    </div>

                    {/* فرم ورودی */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">مبلغ دریافتی (تومان) <span className="text-red-500">*</span></label>
                        <input 
                            type="number" 
                            className="w-full p-3 bg-white border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none transition text-left text-lg font-mono"
                            placeholder="مثلاً: 500000"
                            value={formData.amount}
                            onChange={e => setFormData({...formData, amount: e.target.value})}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">توضیحات (شماره فیش / ارجاع)</label>
                        <textarea 
                            rows="2"
                            className="w-full p-3 bg-white border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none transition"
                            placeholder="مثلاً: واریز کارت به کارت - پیگیری ۱۲۳۴۵۶"
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                    </div>

                    <button 
                        onClick={handleUpdate}
                        className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200 flex justify-center items-center gap-2 mt-4"
                    >
                        <FaCheck /> ثبت نهایی صورت‌حساب
                    </button>
                </div>

            </div>
        </div>
      )}

    </div>
  );
};

export default AdminFinance;
