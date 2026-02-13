import React from 'react';
import { FaUserMd, FaGlobe, FaShieldAlt, FaHandHoldingHeart, FaQuoteLeft } from 'react-icons/fa';

const WhyChooseUs = () => {
  const features = [
    {
      icon: <FaGlobe className="text-4xl text-blue-500" />,
      title: "رفرنس‌های روز دنیا",
      desc: "دسترسی لحظه‌ای به جدیدترین متدهای درمانی و مقالات معتبر جهانی برای ارتقای سطح علمی."
    },
    {
      icon: <FaShieldAlt className="text-4xl text-green-500" />,
      title: "امنیت غذایی و سلامت",
      desc: "تلاش برای کاهش خطاها، تضمین سلامت دام و طیور و در نهایت تامین امنیت غذایی هموطنان."
    },
    {
      icon: <FaHandHoldingHeart className="text-4xl text-red-500" />,
      title: "کاهش ضرر اقتصادی",
      desc: "پیشگیری هوشمند و تشخیص زودهنگام برای جلوگیری از تلفات سنگین و کاهش هزینه‌های درمان."
    },
    {
      icon: <FaUserMd className="text-4xl text-purple-500" />,
      title: "همیار متخصصین",
      desc: "جایگزین نیستیم، بلکه دستیاری هوشمند در کنار دامپزشکان عزیز برای عبور از روش‌های سنتی هستیم."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* پترن پس‌زمینه تزئینی */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute left-0 bottom-0 w-96 h-96 bg-green-400 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* هدر بخش */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-blue-600 font-bold tracking-wider text-sm uppercase mb-2 block">ماموریت ما</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-6 leading-tight">
            چرا <span className="text-blue-600">Iran Vet AI</span> را انتخاب کنید؟
          </h2>
          
          {/* متن اصلی شما با استایل نقل قول مدرن */}
          <div className="relative bg-white p-8 rounded-3xl shadow-xl border border-gray-100 mt-8">
            <FaQuoteLeft className="absolute -top-4 right-8 text-4xl text-blue-100 bg-white px-2" />
            <p className="text-gray-600 leading-8 text-justify font-medium">
              دستیار هوش مصنوعی در کنار دامپزشکان، دامداران و صاحبان مرغداری‌هاست تا بهترین توصیه‌ها را مطابق با <span className="text-blue-600 font-bold">رفرنس‌های روز دنیا</span> در اختیار کاربران عزیز قرار دهد. 
              ما معتقدیم هرچند انتخاب نهایی درمان با دامپزشک متخصص است، اما هوش مصنوعی به عنوان یک دستیار هوشمند می‌تواند جایگزین روش‌های قدیمی شود و مسیر <span className="text-green-600 font-bold">تامین امنیت غذایی</span> و <span className="text-red-500 font-bold">کاهش ضرر اقتصادی</span> را هموار سازد.
              <br/>
              <span className="block mt-4 text-sm text-gray-400 italic">
                * از همکاران گرامی تقاضا می‌شود جهت ارتقای این سامانه، نظرات و خطاهای احتمالی را با تیم پشتیبانی در میان بگذارند.
              </span>
            </p>
          </div>
        </div>

        {/* کارت‌های ویژگی */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, index) => (
            <div 
              key={index} 
              className="group bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center"
            >
              <div className="mb-6 bg-gray-50 w-20 h-20 mx-auto rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-500 text-sm leading-6">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default WhyChooseUs;

