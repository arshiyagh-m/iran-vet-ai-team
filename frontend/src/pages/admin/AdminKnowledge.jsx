import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { toast } from 'react-toastify';
import { FaDatabase, FaPlusCircle, FaSearch } from 'react-icons/fa'; // FaTrash هم حذف شد چون استفاده نمیشه

const AdminKnowledge = () => {
  // استیت فرم
  const [form, setForm] = useState({ title: '', category: 'bee', subCategory: '', content: '' });
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
    if (!form.title || !form.content) return toast.error('عنوان و محتوا الزامی است');
    
    setLoading(true);
    try {
      await client.post('/admin/knowledge', form);
      toast.success('دانش جدید با موفقیت اضافه شد! 🧠');
      setForm({ title: '', category: 'bee', subCategory: '', content: '' }); // ریست کردن فرم
      fetchDocs(); // آپدیت لیست
    } catch (error) {
      toast.error('خطا در ثبت اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  // فیلتر کردن لیست برای جستجو
  const filteredDocs = docs.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.content.toLowerCase().includes(searchTerm.toLowerCase())
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
                <option value="general">عمومی 🩺</option>
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

      {/* بخش ۲: لیست و جستجو */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 border-b pb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FaDatabase className="text-blue-600" />
            بانک اطلاعاتی موجود ({docs.length} سند)
          </h3>
          
          {/* بخش جستجو */}
          <div className="relative w-full md:w-64">
              <input 
                  type="text" 
                  placeholder="جستجو در اسناد..." 
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-400 outline-none transition"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* لیست اسناد */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-400">هیچ سندی پیدا نشد.</p>
            </div>
          ) : (
            filteredDocs.map((doc) => (
              <div key={doc._id} className="group p-4 bg-gray-50 hover:bg-blue-50 rounded-xl border border-gray-100 transition">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="font-bold text-gray-800 text-sm md:text-base">{doc.title}</span>
                            
                            {/* برچسب دسته‌بندی */}
                            <span className={`text-[10px] px-2 py-0.5 rounded border font-bold
                                ${doc.category === 'bee' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                                  doc.category === 'dog' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                  'bg-blue-100 text-blue-700 border-blue-200'}
                            `}>
                                {doc.category}
                            </span>

                            {doc.subCategory && (
                                <span className="text-[10px] px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-500">
                                    {doc.subCategory}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-5">{doc.content}</p>
                    </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminKnowledge;
