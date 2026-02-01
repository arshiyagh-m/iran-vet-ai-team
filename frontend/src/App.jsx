import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

const App = () => {
  return (
    <div className="font-sans dir-rtl min-h-screen flex flex-col items-center justify-center space-y-4">
      <ToastContainer position="top-right" rtl={true} />
      
      <h1 className="text-4xl font-bold text-brand-navy">
        هوش مصنوعی دامپزشکی ایران 🩺
      </h1>
      <p className="text-brand-green text-xl font-medium">
        سیستم از صفرِ صفر با موفقیت بالا آمد! ✅
      </p>
      <div className="flex gap-4">
         <button className="bg-brand-navy text-white px-6 py-2 rounded-lg">ورود</button>
         <button className="bg-brand-gold text-white px-6 py-2 rounded-lg">ثبت نام</button>
      </div>
    </div>
  );
};

export default App;
