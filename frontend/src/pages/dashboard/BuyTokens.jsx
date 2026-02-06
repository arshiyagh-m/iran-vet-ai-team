import React, { useState } from 'react';
// 👇 اصلاح: FaArrowRight به لیست ایمپورت‌ها اضافه شد
import { FaCoins, FaCreditCard, FaTelegram, FaWhatsapp, FaCopy, FaCheckCircle, FaHeadset, FaArrowRight } from 'react-icons/fa';
import { toast } from 'react-toastify';

const BuyTokens = () => {
  // اطلاعات کارت بانکی
  const bankInfo = {
    cardNumber: '6037-9979-0000-0000',
    ownerName: 'ارشیا قنبری میاندوآب',
    bankName: 'بانک ملی'
  };

  const packages = [
    { id: 1, tokens: 10, price: '۵۰,۰۰۰', label: 'بسته پایه', color: 'bg-blue-500', isPopular: false },
    { id: 2, tokens: 50, price: '۲۰۰,۰۰۰', label: 'بسته اقتصادی', color: 'bg-purple-600', isPopular: true },
    { id: 3, tokens: 100, price: '۳۵۰,۰۰۰', label: 'بسته حرفه‌ای', color: 'bg-amber-500', isPopular: false },
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bankInfo.cardNumber.replace(/-/g, ''));
    toast.success('شماره کارت کپی شد! ✅');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* هدر صفحه */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <FaCoins className="text-yellow-400" />
            افزایش اعتبار حساب
          </h1>
          <p className="text-slate-300 max-w-2xl">
            برای استفاده از ربات‌های هوشمند دامپزشکی، نیاز به توکن دارید. 
            فعلاً پرداخت فقط از طریق کارت‌به‌کارت امکان‌پذیر است.
          </p>
        </div>
        <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* بخش ۱: انتخاب بسته */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className={`relative bg-white rounded-2xl shadow-sm border-2 ${pkg.isPopular ? 'border-purple-500 transform scale-105 shadow-xl z-10' : 'border-gray-100'} p-6 text-center transition hover:-translate-y-1`}>
            
            {pkg.isPopular && (
              <span className="absolute -top-4 right-1/2 translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                پیشنهاد ویژه
              </span>
            )}

            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white text-2xl mb-4 ${pkg.color} shadow-lg`}>
              <FaCoins />
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-2">{pkg.label}</h3>
            <div className="text-3xl font-extrabold text-slate-900 mb-2">
              {pkg.price} <span className="text-sm text-gray-400 font-normal">تومان</span>
            </div>
            <div className="text-lg font-bold text-blue-600 mb-6 bg-blue-50 py-1 rounded-lg">
              {pkg.tokens} توکن
            </div>

            <ul className="text-sm text-gray-500 space-y-2 mb-6 text-right px-4">
              <li className="flex items-center gap-2"><FaCheckCircle className="text-green-500" /> دسترسی به تمام ربات‌ها</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-green-500" /> تاریخچه نامحدود</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-green-500" /> پشتیبانی اولویت‌دار</li>
            </ul>
          </div>
        ))}
      </div>

      {/* بخش ۲: اطلاعات واریز و تماس */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* کارت بانکی */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
            <FaCreditCard className="text-blue-600" />
            اطلاعات واریز
          </h3>
          
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden mb-4">
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <span className="text-gray-400 text-sm">شماره کارت</span>
                <span className="font-bold text-yellow-400">{bankInfo.bankName}</span>
              </div>
              <div className="text-2xl md:text-3xl font-mono tracking-widest text-center mb-6" dir="ltr">
                {bankInfo.cardNumber}
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs text-gray-400 mb-1">نام صاحب حساب</div>
                  <div className="font-bold">{bankInfo.ownerName}</div>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition flex items-center gap-2 text-sm"
                >
                  <FaCopy /> کپی
                </button>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 leading-relaxed text-justify">
            <span className="text-red-500 font-bold">مهم: </span>
            لطفاً مبلغ بسته مورد نظر را به شماره کارت بالا واریز کنید و تصویر فیش واریزی را از طریق راه‌های ارتباطی روبرو برای پشتیبانی ارسال کنید. حساب شما در کمتر از ۳۰ دقیقه شارژ خواهد شد.
          </p>
        </div>

        {/* راه‌های ارتباطی */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2">
            <FaHeadset className="text-blue-600" />
            ارسال فیش واریزی
          </h3>

          <div className="space-y-4">
            <a 
              href="https://t.me/Arshia_vet_admin" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition group cursor-pointer border border-blue-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl">
                  <FaTelegram />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">ارسال در تلگرام</h4>
                  <p className="text-xs text-gray-500">پاسخگویی سریع</p>
                </div>
              </div>
              <FaArrowRight className="text-blue-400 group-hover:-translate-x-1 transition" />
            </a>

            <a 
              href="https://wa.me/989000000000" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-xl transition group cursor-pointer border border-green-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center text-xl">
                  <FaWhatsapp />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">ارسال در واتس‌اپ</h4>
                  <p className="text-xs text-gray-500">پشتیبانی ۲۴ ساعته</p>
                </div>
              </div>
              <FaArrowRight className="text-green-400 group-hover:-translate-x-1 transition" />
            </a>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-xs text-yellow-800">
             <strong>نکته:</strong> در هنگام ارسال فیش، لطفاً <strong>ایمیل ثبت‌نامی</strong> خود را نیز ارسال کنید تا شارژ حساب سریع‌تر انجام شود.
          </div>
        </div>

      </div>
    </div>
  );
};

export default BuyTokens;
