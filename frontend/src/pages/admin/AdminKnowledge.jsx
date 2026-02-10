import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { toast } from 'react-toastify';
import { FaDatabase, FaTrash, FaFileCsv, FaPlusCircle, FaSearch } from 'react-icons/fa';

const AdminKnowledge = () => {
  const [form, setForm] = useState({ title: '', category: 'bee', subCategory: 'General', content: '' });
  const [docs, setDocs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // دریافت لیست اسناد از سرور
  const fetchDocs = async () => {
    try {
      const res = await client.get('/admin/knowledge');
      setDocs(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  // ثبت دانش جدید
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await client.post('/admin/knowledge', form);
      toast.success('دانش جدید با موفقیت اضافه شد! 🧠');
      setForm({ ...form, title: '', content: '' }); // ریست کردن فرم
      fetchDocs(); // آپدیت لیست
    } catch (error) {
      toast.error('خطا در ثبت اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  // حذف دانش
  const handleDelete = async (id) => {
    if (window.confirm('آیا از حذف این سند مطمئن هستید؟')) {
      try {
        await client.delete(`/admin/knowledge/${id}`);
        toast.success('سند حذف شد');
        fetchDocs();
      } catch (error) {
        toast.error('خطا در حذف');
      }
    }
  };

  // ایمپورت فایل زنبور (ویژه)
  const handleImport = async () => {
    if (window.confirm('آیا فایل bee_data.csv را در پوشه backend/data قرار داده‌اید؟ این عملیات ممکن است کمی زمان ببرد.')) {
      const toastId = toast.loading('در حال پردازش فایل...');
      try {
        const res = await client.get('/setup/import-bee');
        toast.update(toastId, { render: res.data.message, type: 'success', isLoading: false, autoClose: 5000 });
        fetchDocs();
      } catch (error) {
        toast.update(toastId, { render: 'خطا در ایمپورت فایل. لطفاً کنسول سرور را چک کنید.', type: 'error', isLoading: false, autoClose: 5000 });
      }
    }
  };

  // فیلتر کردن لیست
  const filteredDocs = docs.filter(doc => 
    doc.title.includes(searchTerm) || doc.content.includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* بخش ۱: فرم افزودن */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
          <FaPlusCircle className="text-green-600" />
          افزودن دانش جدید
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">عنوان موضوع</label>
            <input 
              type="text" 
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition" 
              required 
              placeholder="مثلاً: بیماری لوک آمریکایی"
              value={form.title} 
              onChange={e => setForm({...form, title: e.target.value})} 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">دسته‌بندی اصلی</label>
              <select 
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 outline-none" 
                value={form.category} 
                onChange={e => setForm({...form, category: e.target.value})}
              >
                <option value="bee">زنبور عسل 🐝</option>
                <option value="dog">سگ 🐕</option>
                <option value="cat">گربه 🐈</option>
                <option value="cow">دام بزرگ 🐄</option>
                <option value="horse">اسب 🐎</option>
                <option value="poultry">طیور 🐓</option>
                <option value="fish">آبزیان 🐟</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">زیردسته (اختیاری)</label>
              <input 
                type="text" 
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 outline-none" 
                placeholder="مثلاً: تغذیه، بیماری، نگهداری" 
                value={form.subCategory} 
                onChange={e => setForm({...form, subCategory: e.target.value})} 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">محتوای علمی (کامل و دقیق)</label>
            <textarea 
              rows="6" 
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition" 
              required 
              value={form.content} 
              onChange={e => setForm({...form, content: e.target.value})} 
              placeholder="توضیحات کامل، علائم، روش درمان و نکات مهم را اینجا بنویسید..." 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 text-white font-bold rounded-xl transition shadow-lg flex justify-center items-center gap-2
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
            `}
          >
            {loading ? 'در حال ثبت...' : 'ثبت در مغز هوش مصنوعی'}
          </button>
        </form>
      </div>

      {/* بخش ۲: لیست و مدیریت */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 border-b pb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FaDatabase className="text-blue-600" />
            بانک اطلاعاتی موجود ({docs.length} سند)
          </h3>
          
          <button 
            onClick={handleImport}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition shadow-md"
          >
            <FaFileCsv className="text-green-400" />
            ایمپورت سریع دیتابیس زنبور
          </button>
        </div>

        {/* جستجو */}
        <div className="relative mb-4">
            <input 
                type="text" 
                placeholder="جستجو در اسناد..." 
                className="w-full pl-4 pr-10 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-400 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute right-3 top-3 text-gray-400" />
        </div>

        {/* لیست اسناد */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
          {filteredDocs.length === 0 ? (
            <p className="text-center text-gray-400 py-8">هیچ سندی پیدا نشد.</p>
          ) : (
            filteredDocs.map((doc) => (
              <div key={doc._id} className="group p-4 bg-gray-50 hover:bg-blue-50 rounded-xl border border-gray-100 transition flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-800">{doc.title}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-white border rounded text-gray-500">
                      {doc.category}
                    </span>
                    {doc.subCategory && (
                      <span className="text-[10px] px-2 py-0.5 bg-white border rounded text-gray-400">
                        {doc.subCategory}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">{doc.content}</p>
                </div>
          """      
                <button 
                  onClick={() => handleDelete(doc._id)}
                  className="text-gray-300 hover:text-red-500 p-2 transition"
                  title="حذف سند"
                >
                  """
                  
                  <FaTrash />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminKnowledge;
