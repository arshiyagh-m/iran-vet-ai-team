import React, { useState } from 'react';
import axios from 'axios';

const ClinicalTriage = () => {
  const [formData, setFormData] = useState({
    species: 'Cat',
    condition: '',
    weight: ''
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 👇 آدرس دقیق بک‌اند روی سرور Render جایگزین شد
  const API_URL = 'https://vet-ai-api.onrender.com/api/v1/calculator/calculate'; 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await axios.post(API_URL, {
        species: formData.species,
        condition: formData.condition,
        weight: Number(formData.weight)
      });
      setResults(response.data.results);
    } catch (err) {
      // مدیریت خطاهای سرور به شکل تمیز
      setError(err.response?.data?.message || 'خطایی در ارتباط با سرور رخ داد. لطفا اتصال اینترنت یا وضعیت سرور را بررسی کنید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* هدر صفحه */}
        <div className="bg-blue-600 rounded-t-xl p-6 text-white text-center shadow-lg">
          <h1 className="text-2xl font-bold">دستیار محاسبات بالینی و تریاژ</h1>
          <p className="mt-2 text-blue-100 text-sm">محاسبه سریع دوز داروها بر اساس گونه و وزن</p>
        </div>

        {/* فرم دریافت اطلاعات */}
        <div className="bg-white rounded-b-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">گونه هدف</label>
                <select 
                  name="species" 
                  value={formData.species} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Cat">گربه 🐱</option>
                  <option value="Dog">سگ 🐶</option>
                  <option value="Poultry">طیور 🐔</option>
                  <option value="Large Animal">دام بزرگ 🐄</option>
                  <option value="Bee">زنبور 🐝</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">بیماری / وضعیت</label>
                <input 
                  type="text" 
                  name="condition" 
                  placeholder="مثال: Urinary Spasm" 
                  value={formData.condition} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left dir-ltr focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required 
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">وزن (کیلوگرم)</label>
                <input 
                  type="number" 
                  name="weight" 
                  step="0.01"
                  placeholder="مثال: 4.5" 
                  value={formData.weight} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left dir-ltr focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required 
                />
              </div>

            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full mt-6 text-white font-bold py-3 px-4 rounded-lg transition duration-200 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? 'در حال محاسبه...' : 'محاسبه دقیق دوز'}
            </button>
          </form>

          {/* نمایش خطا */}
          {error && (
            <div className="mt-6 bg-red-100 border-r-4 border-red-500 text-red-700 p-4 rounded-lg">
              <p className="font-bold">خطا:</p>
              <p>{error}</p>
            </div>
          )}

          {/* نمایش نتایج */}
          {results && results.length > 0 && (
            <div className="mt-8 space-y-4 animate-fadeIn">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2">نتایج محاسبات دارویی:</h3>
              {results.map((result, index) => (
                <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-lg font-bold text-green-800">{result.drugName}</h4>
                    <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
                      مسیر: {result.routeOfAdministration}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="bg-white p-3 rounded shadow-sm border-r-4 border-green-500">
                      <span className="block text-gray-500">دوز کل (میلی‌گرم):</span>
                      <span className="font-bold text-lg text-gray-800">{result.totalDosageMg} mg</span>
                    </div>
                    {result.totalVolumeMl && (
                      <div className="bg-white p-3 rounded shadow-sm border-r-4 border-blue-500">
                        <span className="block text-gray-500">حجم تزریق (میلی‌لیتر):</span>
                        <span className="font-bold text-lg text-blue-600">{result.totalVolumeMl} ml</span>
                      </div>
                    )}
                  </div>

                  {/* هشدارهای تریاژ */}
                  {result.triageWarnings && result.triageWarnings.length > 0 && (
                    <div className="mt-3 bg-yellow-100 border border-yellow-300 p-3 rounded text-sm text-yellow-800">
                      <p className="font-bold mb-1">⚠️ هشدارهای تریاژ:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {result.triageWarnings.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.notes && (
                    <p className="mt-3 text-xs text-gray-600 bg-white p-2 rounded border border-gray-100">
                      📝 <span className="font-bold">نکته تکمیلی:</span> {result.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClinicalTriage;
