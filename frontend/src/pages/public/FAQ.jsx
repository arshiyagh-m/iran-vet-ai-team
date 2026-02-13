import React, { useState } from 'react';
import { 
  FaChevronDown, FaQuestionCircle, FaWhatsapp, FaPhoneAlt, 
  FaExclamationTriangle, FaCreditCard, FaUserMd 
} from 'react-icons/fa';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // اطلاعات سوالات (شامل کامپوننت‌های JSX برای دکمه‌ها)
  const faqs = [
    { 
      q: '🚨 حیوانم بدحال است و شرایط اضطراری دارم، چه کار کنم؟', 
      icon: <FaExclamationTriangle className="text-red-500" />,
      a: (
        <div className="space-y-3">
          <p className="font-bold text-red-600">
            لطفاً زمان را از دست ندهید! هوش مصنوعی برای شرایط اورژانسی (مثل تصادف، تشنج، خونریزی شدید یا خفگی) مناسب نیست.
          </p>
          <p>همین الان با اورژانس دامپزشکی یا نزدیک‌ترین کلینیک تماس بگیرید:</p>
          <a 
            href="tel:09123456789" 
            className="flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-red-700 transition shadow-md w-full sm:w-fit mx-auto"
          >
            <FaPhoneAlt className="animate-pulse" />
            تماس فوری با اورژانس (09123456789)
          </a>
        </div>
      )
    },
    { 
      q: 'چطور می‌توانم اشتراک بخرم یا حسابم را شارژ کنم؟', 
      icon: <FaCreditCard className="text-blue-500" />,
      a: (
        <div className="space-y-2">
          <p>برای دسترسی نامحدود به ربات‌های تخصصی، نیاز به "توکن" دارید. مراحل زیر را انجام دهید:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
            <li>وارد <strong>پنل کاربری</strong> شوید.</li>
            <li>روی دکمه <strong>"خرید توکن"</strong> در منوی سمت راست کلیک کنید.</li>
            <li>بسته مورد نظر (طلایی، نقره‌ای یا برنزی) را انتخاب کنید.</li>
            <li>پس از پرداخت آنلاین، حساب شما بلافاصله شارژ می‌شود.</li>
          </ol>
        </div>
      )
    },
    { 
      q: 'آیا این سیستم جایگزین دامپزشک است؟', 
      icon: <FaUserMd className="text-green-500" />,
      a: 'خیر. Iran Vet AI یک دستیار هوشمند برای "تشخیص اولیه"، "تفسیر آزمایش" و "راهنمایی عمومی" است. ما اکیداً توصیه می‌کنیم برای تشخیص قطعی، تجویز دارو و درمان فیزیکی حتماً به دامپزشک دارای پروانه مراجعه کنید. هوش مصنوعی جایگزین معاینه بالینی نیست.' 
    },
    { 
      q: 'چگونه می‌توانم با پشتیبانی تماس بگیرم؟', 
      a: (
        <div className="space-y-4">
          <p>تیم پشتیبانی ما ۲۴ ساعته در کنار شماست. اگر مشکلی در پرداخت دارید یا سوالی دارید، از روش‌های زیر استفاده کنید:</p>
          <div className="flex flex-wrap gap-3">
            <a 
              href="https://wa.me/989123456789" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition shadow-sm"
            >
              <FaWhatsapp className="text-xl" />
              چت در واتساپ
            </a>
            <a 
              href="tel:02112345678" 
              className="flex items-center gap-2 bg-slate-800 text-white py-2 px-4 rounded-lg hover:bg-slate-900 transition shadow-sm"
            >
              <FaPhoneAlt />
              تماس با دفتر (021-12345678)
            </a>
          </div>
        </div>
      )
    },
    { 
      q: 'آیا مشاوره با هوش مصنوعی رایگان است؟', 
      a: 'بله، استفاده از "ربات دامپزشک عمومی" برای ۵ سوال اول کاملاً رایگان است تا با سیستم آشنا شوید. اما برای استفاده از ربات‌های فوق تخصصی (مانند زنبور عسل، اسب، طیور) که از دیتابیس‌های پیشرفته استفاده می‌کنند، نیاز به توکن دارید.' 
    },
    { 
      q: 'اگر هوش مصنوعی پاسخ اشتباه داد چه؟', 
      a: 'هوش مصنوعی ما بر اساس هزاران کتاب و مقاله دامپزشکی آموزش دیده است، اما ممکن است خطا داشته باشد. به همین دلیل در پاسخ‌هایی که از "دانش عمومی" مدل استفاده شده، یک علامت هشدار ⚠️ نمایش داده می‌شود. شما می‌توانید با زدن دکمه 👎 (دیس‌لایک) به ما در بهبود سیستم کمک کنید.' 
    },
    { 
      q: 'آیا اطلاعات حیوانات من محرمانه می‌ماند؟', 
      a: 'بله، صد در صد. تمامی گفتگوهای شما، تصاویر ارسالی و اطلاعات پروفایل شما به صورت رمزنگاری شده در سرورهای امن نگهداری می‌شوند و هرگز در اختیار شخص ثالث قرار نمی‌گیرند.' 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        
        {/* هدر صفحه */}
        <div className="text-center mb-12 animate-fadeIn">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <FaQuestionCircle className="text-4xl text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3">سوالات متداول</h1>
          <p className="text-gray-500 text-lg">پاسخ تمام سوالات شما اینجاست</p>
        </div>

        {/* لیست سوالات */}
        <div className="space-y-4">
          {faqs.map((item, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden
                ${openIndex === index ? 'shadow-lg border-blue-200' : 'shadow-sm border-gray-100 hover:border-blue-100'}
              `}
            >
              <button 
                onClick={() => toggle(index)}
                className="w-full flex justify-between items-center p-5 md:p-6 text-right focus:outline-none hover:bg-gray-50/50 transition"
              >
                <div className="flex items-center gap-3 md:gap-4">
                    {/* نمایش آیکون اگر وجود داشته باشد */}
                    {item.icon && <span className="text-xl opacity-80">{item.icon}</span>}
                    <span className={`font-bold text-base md:text-lg transition-colors ${openIndex === index ? 'text-blue-600' : 'text-slate-700'}`}>
                        {item.q}
                    </span>
                </div>
                <div className={`p-2 rounded-full transition-all duration-300 ${openIndex === index ? 'bg-blue-100 text-blue-600 rotate-180' : 'bg-gray-100 text-gray-400'}`}>
                    <FaChevronDown />
                </div>
              </button>
              
              {/* محتوای پاسخ (با قابلیت نمایش JSX) */}
              <div 
                className={`transition-all duration-500 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-6 pt-0 text-gray-600 leading-8 text-sm md:text-base border-t border-dashed border-gray-100 mt-2">
                  <div className="pt-4">
                    {item.a}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* باکس تماس پایین */}
        <div className="mt-16 bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 text-center text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-20 pointer-events-none"></div>
            <h3 className="text-2xl font-bold mb-4">هنوز سوالی دارید؟</h3>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto">تیم پشتیبانی متخصص ما آماده پاسخگویی به سوالات فنی و دامپزشکی شماست.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a href="tel:09335836545" className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg flex items-center justify-center gap-2">
                    <FaPhoneAlt /> تماس تلفنی
                </a>
                <a href="https://wa.me/989338656771" className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition shadow-lg flex items-center justify-center gap-2">
                    <FaWhatsapp className="text-xl" /> پیام در واتساپ
                </a>
            </div>
        </div>

      </div>
    </div>
  );
};

export default FAQ;
