import React from 'react';
import { FaCow, FaFeather, FaDog, FaUserMd } from 'react-icons/fa'; // آیکون‌های حیوانات

const Home = () => {
  return (
    <div className="min-h-screen">
      
      {/* بخش قهرمان (Hero Section) */}
      <section className="bg-gradient-to-b from-brand-light to-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block px-4 py-1 bg-green-100 text-brand-green rounded-full text-sm font-bold mb-6">
            ✨ مجهز به دیتابیس ۴۰۰ بیماری دامی کشور
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-brand-navy mb-6 leading-tight">
            دستیار هوشمند <span className="text-brand-green">دامپزشک</span> شما
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            تشخیص اولیه بیماری، محاسبه دوز دارو و مشاوره تخصصی در کمتر از ۳۰ ثانیه.
            بدون توهم، با رفرنس علمی معتبر.
          </p>
          <button className="px-8 py-4 bg-brand-navy text-white text-lg rounded-xl shadow-xl hover:bg-gray-800 transition transform hover:-translate-y-1">
            شروع مشاوره رایگان
          </button>
        </div>
      </section>

      {/* بخش خدمات (Grid) */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-brand-navy mb-12">خدمات تخصصی ما</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* کارت ۱: دام بزرگ */}
            <ServiceCard 
              icon={<FaCow size={30} />} 
              title="دام بزرگ" 
              desc="گاو، گوسفند، بز و شتر" 
              color="bg-blue-50 text-blue-600"
            />
             {/* کارت ۲: طیور */}
            <ServiceCard 
              icon={<FaFeather size={30} />} 
              title="صنعت طیور" 
              desc="مرغ گوشتی، تخم‌گذار و بوقلمون" 
              color="bg-orange-50 text-orange-600"
            />
             {/* کارت ۳: حیوانات خانگی */}
            <ServiceCard 
              icon={<FaDog size={30} />} 
              title="حیوانات خانگی" 
              desc="سگ، گربه و پرندگان زینتی" 
              color="bg-purple-50 text-purple-600"
            />
             {/* کارت ۴: دستیار عمومی */}
            <ServiceCard 
              icon={<FaUserMd size={30} />} 
              title="دستیار عمومی" 
              desc="سوالات کلی و مدیریت بهداشتی" 
              color="bg-green-50 text-green-600"
            />
          </div>
        </div>
      </section>

    </div>
  );
};

// کامپوننت کوچک برای کارت‌ها (فقط داخل همین فایل استفاده میشه)
const ServiceCard = ({ icon, title, desc, color }) => (
  <div className="p-6 border border-gray-100 rounded-2xl hover:shadow-lg transition cursor-pointer group bg-white">
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${color} group-hover:scale-110 transition`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-500 text-sm">{desc}</p>
  </div>
);

export default Home;
