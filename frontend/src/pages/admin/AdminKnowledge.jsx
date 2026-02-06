import React, { useState } from 'react';
import client from '../../api/client';
import { toast } from 'react-toastify';

const AdminKnowledge = () => {
  const [form, setForm] = useState({ title: '', category: 'bee', subCategory: 'General', content: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await client.post('/admin/knowledge', form);
      toast.success('دانش جدید اضافه شد! 🧠');
      setForm({ ...form, title: '', content: '' });
    } catch (error) { toast.error('خطا در ثبت'); }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm">
      <h2 className="text-xl font-bold mb-6 text-slate-800">افزودن دانش جدید به هوش مصنوعی</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-2">عنوان موضوع (بیماری، روش و...)</label>
          <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border focus:border-blue-500 outline-none" required 
            value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">دسته‌بندی اصلی</label>
            <select className="w-full p-3 bg-gray-50 rounded-xl border" 
              value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              <option value="bee">زنبور عسل 🐝</option>
              <option value="dog">سگ 🐕</option>
              <option value="cat">گربه 🐈</option>
              <option value="cow">دام بزرگ 🐄</option>
              <option value="horse">اسب 🐎</option>
              <option value="poultry">طیور 🐓</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">زیردسته (اختیاری)</label>
            <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border" placeholder="مثلاً: تغذیه" 
              value={form.subCategory} onChange={e => setForm({...form, subCategory: e.target.value})} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">محتوای علمی (کامل و دقیق)</label>
          <textarea rows="6" className="w-full p-3 bg-gray-50 rounded-xl border focus:border-blue-500 outline-none" required 
            value={form.content} onChange={e => setForm({...form, content: e.target.value})} 
            placeholder="هر اطلاعاتی اینجا بنویسید، هوش مصنوعی یاد می‌گیرد..." />
        </div>

        <button type="submit" className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg">
          ثبت در مغز هوش مصنوعی
        </button>
      </form>
    </div>
  );
};
export default AdminKnowledge;

