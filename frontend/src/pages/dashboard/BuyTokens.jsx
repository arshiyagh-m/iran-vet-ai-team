import React, { useState } from 'react';
import { FaCoins, FaCreditCard, FaTelegram, FaWhatsapp, FaCopy, FaCheckCircle, FaHeadset, FaArrowRight, FaStar, FaCrown, FaGem } from 'react-icons/fa';
import { toast } from 'react-toastify';

const BuyTokens = () => {
  // اطلاعات کارت بانکی (اصلاح شده)
  const bankInfo = {
    cardNumber: '6219-8619-4281-3253',
    ownerName: 'ارشیا قنبری میاندوآب',
    bankName: 'بانک سامان'
  };

  // لیست بسته‌های جدید با قیمت‌ها و ویژگی‌های متفاوت
  const packages = [
    { 
      id: 1, 
      tokens: 50, 
      price: '۲۰۰,۰۰۰', 
      label: 'شروع قدرتمند', 
      color: 'bg-blue-500', 
      icon: <FaStar />,
      isPopular: false,
      features: [
        { text: 'دسترسی کامل به تمام ربات‌ها', active: true },
        { text: 'تاریخچه چت نامحدود', active: true },
        { text: 'پشتیبانی استاندارد (تیکت)', active: true, highlight: false }
      ]
    },
    { 
      id: 2, 
      tokens: 100, 
      price: '۳۵۰,۰۰۰', 
      label: 'حرفه‌ای', 
      color: 'bg-purple-600', 
      icon: <FaGem />,
      isPopular: true, // این بسته محبوب است
      features: [
        { text: 'دسترسی کامل به تمام ربات‌ها', active: true },
        { text: 'تاریخچه چت نامحدود', active: true },
        { text: 'پشتیبانی سریع (اولویت بالا)', active: true, highlight: true }
      ]
    },
    { 
      id: 3, 
      tokens: 250, 
      price: '۷۰۰,۰۰۰', 
      label: 'متخصصین (VIP)', 
      color: 'bg-amber-500', 
      icon: <FaCrown />,
      isPopular: false,
      features: [
        { text: 'دسترسی کامل به تمام ربات‌ها', active: true },
        { text: 'تاریخچه چت نامحدود', active: true },
        { text: 'پشتیبانی اختصاصی VIP (آنی)', active: true, highlight: true }
      ]
    },
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bankInfo.cardNumber.replace(/-/g, ''));
    toast.success('شماره کارت کپی شد! ✅');
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      
      {/* هدر صفحه */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-3 flex items-center gap-3">
            <FaCoins className="text-yellow-400" />
            افزایش اعتبار حساب
          </h1>
          <p className="text-slate-300 max-w-2xl text-lg leading-relaxed">
            برای استفاده از دستیار هوشمند، بسته مناسب خود را انتخاب کنید. 
            تمام بسته‌ها دسترسی کامل به تمامی امکانات سامانه را فراهم می‌کنند.
          </p>
        </div>
        <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* بخش ۱: انتخاب بسته */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {packages.map((pkg) => (
          <div key={pkg.id} className={`relative bg-white rounded-3xl shadow-sm border-2 ${pkg.isPopular ? 'border-purple-500 ring-4 ring-purple-500/10 transform md:-translate-y-4 z-10' : 'border-gray-100'} p-6 text-center transition hover:shadow-lg flex flex-col`}>
            
            {pkg.isPopular && (
              <span className="absolute -top-4 right-1/2 translate-x-1/2 bg-purple-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                 <FaGem className="text-yellow-300" /> پیشنهاد ویژه
              </span>
            )}

            <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-white text-3xl mb-6 ${pkg.color} shadow-lg shadow-${pkg.color}/30`}>
              {pkg.icon}
            </div>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{pkg.label}</h3>
            
            <div className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
              {pkg.price} <span className="text-sm text-gray-400 font-medium">تومان</span>
            </div>
            
            <div className="text-lg font-bold text-blue-700 mb-8 bg-blue-50 py-2 rounded-xl border border-blue-100">
              {pkg.tokens} توکن هوشمند
            </div>

            <div className="space-y-3 text-sm text-gray-600 text-right px-2 mb-8 flex-1">
              {pkg.features.map((feature, idx) => (
                <div key={idx} className={`flex items-center gap-3 ${feature.highlight ? 'font-bold text-gray-900' : ''}`}>
                  <FaCheckCircle className={`flex-shrink-0 ${feature.highlight ? 'text-amber-500' : 'text-green-500'}`} />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>

            <button 
                onClick={() => document.getElementById('payment-section').scrollIntoView({ behavior: 'smooth' })}
                className={`w-full py-3 rounded-xl font-bold text-white transition shadow-lg ${pkg.color} hover:brightness-110 active:scale-95`}
            >
                انتخاب این بسته
            </button>
          </div>
        ))}
      </div>

      {/* بخش ۲: اطلاعات واریز و تماس */}
      <div id="payment-section" className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-200">
        
        {/* کارت بانکی */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2">
            <FaCreditCard className="text-blue-600" />
            اطلاعات جهت واریز
          </h3>
          
          {/* طرح کارت بانکی */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-900 rounded-2xl p-6 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden mb-6 group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                   <span className="text-blue-200 text-xs block mb-1">بانک مقصد</span>
                   <span className="font-bold text-lg">{bankInfo.bankName}</span>
                </div>
                {/* لوگوی سیم‌کارت */}
                <div className="w-10 h-8 bg-yellow-500/20 rounded md:w-12 md:h-9 border border-yellow-500/30"></div>
              </div>
              
              <div className="text-2xl md:text-3xl font-mono tracking-widest text-center mb-8 drop-shadow-md" dir="ltr">
                {bankInfo.cardNumber}
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs text-blue-200 mb-1">نام صاحب حساب</div>
                  <div className="font-bold text-lg tracking-wide">{bankInfo.ownerName}</div>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="bg-white text-blue-900 hover:bg-blue-50 px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm font-bold shadow-md active:scale-95"
                >
                  <FaCopy /> کپی شماره
                </button>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 leading-7 text-justify bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="text-red-500 font-bold block mb-1">⚠️ نکته مهم:</span>
            لطفاً مبلغ بسته انتخابی را به شماره کارت فوق واریز نمایید. پس از واریز، تصویر فیش را به همراه <strong>ایمیل کاربری</strong> خود برای پشتیبانی ارسال کنید تا حساب شما در سریع‌ترین زمان ممکن شارژ شود.
          </p>
        </div>

        {/* راه‌های ارتباطی */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2">
            <FaHeadset className="text-blue-600" />
            ارسال فیش و فعال‌سازی
          </h3>

          <div className="space-y-4">
            <a 
              href="https://t.me/arshiya_g_m" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-between p-5 bg-blue-50 hover:bg-blue-100 rounded-2xl transition group cursor-pointer border border-blue-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl shadow-md">
                  <FaTelegram />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">ارسال در تلگرام</h4>
                  <p className="text-sm text-gray-500">پاسخگویی سریع و ارسال فایل</p>
                </div>
              </div>
              <FaArrowRight className="text-blue-400 group-hover:-translate-x-2 transition text-xl" />
            </a>

            <a 
              href="https://wa.me/989338656771" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-between p-5 bg-green-50 hover:bg-green-100 rounded-2xl transition group cursor-pointer border border-green-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl shadow-md">
                  <FaWhatsapp />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">ارسال در واتس‌اپ</h4>
                  <p className="text-sm text-gray-500">پشتیبانی ۲۴ ساعته</p>
                </div>
              </div>
              <FaArrowRight className="text-green-400 group-hover:-translate-x-2 transition text-xl" />
            </a>
          </div>

          <div className="mt-8 text-center text-gray-400 text-sm">
             تیم پشتیبانی ما همه روزه از ساعت ۸ الی ۲۴ آماده پاسخگویی است.
          </div>
        </div>

      </div>
    </div>
  );
};

export default BuyTokens;
