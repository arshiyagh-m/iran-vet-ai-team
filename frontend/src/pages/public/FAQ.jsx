import React, { useState } from 'react';
import { FaChevronDown, FaQuestionCircle } from 'react-icons/fa';

const FAQ = () => {
  const faqs = [
    { 
      q: 'آیا مشاوره با هوش مصنوعی رایگان است؟', 
      a: 'بله، ثبت نام و استفاده اولیه از ربات‌های عمومی رایگان است. برای دسترسی به ربات‌های تخصصی و نامحدود، نیاز به تهیه اشتراک یا استفاده از توکن دارید.' 
    },
    { 
      q: 'آیا این سیستم جایگزین دامپزشک است؟', 
      a: 'خیر. Iran Vet AI یک ابزار کمکی برای تشخیص سریع‌تر و راهنمایی اولیه است. تشخیص نهایی و تجویز دارو باید توسط دامپزشک دارای پروانه انجام شود.' 
    },
    { 
      q: 'چگونه می‌توانم با پشتیبانی تماس بگیرم؟', 
      a: 'شما می‌توانید از طریق پنل کاربری بخش "ارسال تیکت" یا از طریق شماره‌های تماس موجود در فوتر سایت با ما در ارتباط باشید.' 
    },
    { 
      q: 'آیا اطلاعات حیوانات من محرمانه می‌ماند؟', 
      a: 'بله، تمامی اطلاعات ثبت شده در سیستم رمزنگاری شده و طبق سیاست‌های حریم خصوصی محافظت می‌شوند.' 
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-6 max-w-3xl">
        
        <div className="text-center mb-12">
          <FaQuestionCircle className="text-5xl text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-800">سوالات متداول</h1>
          <p className="text-gray-500 mt-2">پاسخ به پرسش‌های پرتکرار شما</p>
        </div>

        <div className="space-y-4">
          {faqs.map((item, index) => (
            <div key={index} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <button 
                onClick={() => toggle(index)}
                className="w-full flex justify-between items-center p-6 text-right focus:outline-none hover:bg-gray-50 transition"
              >
                <span className="font-bold text-slate-700 text-lg">{item.q}</span>
                <FaChevronDown className={`text-gray-400 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} />
              </button>
              
              <div className={`transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6 pt-0 text-gray-500 leading-relaxed border-t border-gray-50 mt-2">
                  {item.a}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default FAQ;

