import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaDog, FaCat, FaStethoscope, FaFeather, FaPaw, FaFish, 
  FaArrowLeft, FaRobot, FaForumbee, FaUserMd 
} from 'react-icons/fa';

const Bots = () => {
  const botsList = [
    { 
      id: 'bee', 
      name: 'زنبور عسل', 
      icon: <FaForumbee />, 
      color: 'bg-amber-500', 
      desc: 'مدیریت کندو، بیماری‌های زنبور (نوزما، واروآ)، تولید ژل رویال و عسل.' 
    },
    { 
      id: 'dog', 
      name: 'متخصص سگ‌ها', 
      icon: <FaDog />, 
      color: 'bg-orange-500', 
      desc: 'تشخیص پارواویروس، دیستمپر، تربیت و مشکلات گوارشی سگ‌ها.' 
    },
    { 
      id: 'cat', 
      name: 'متخصص گربه‌ها', 
      icon: <FaCat />, 
      color: 'bg-blue-500', 
      desc: 'مشاوره رفتارشناسی، تغذیه، عقیم‌سازی و بیماری‌های گربه.' 
    },
    { 
      id: 'horse', 
      name: 'اسب و تک‌سمیان', 
      icon: <FaStethoscope />, 
      color: 'bg-yellow-700', 
      desc: 'مدیریت لنگش، قولنج (کولیک) و تغذیه اسب‌های مسابقه.' 
    },
    { 
      id: 'poultry', 
      name: 'طیور و پرندگان', 
      icon: <FaFeather />, 
      color: 'bg-red-500', 
      desc: 'بیماری‌های نیوکاسل، آنفولانزا و مدیریت سالن مرغداری.' 
    },
    { 
      id: 'cow', 
      name: 'دام بزرگ (گاو)', 
      icon: <FaPaw />, 
      color: 'bg-green-600', 
      desc: 'مدیریت ورم پستان، تب برفکی، تولید مثل و تغذیه دام شیری.' 
    },
    { 
      id: 'fish', 
      name: 'آبزیان', 
      icon: <FaFish />, 
      color: 'bg-cyan-500', 
      desc: 'کنترل کیفیت آب و بیماری‌های ماهیان گرم‌آبی و سردآبی.' 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 pb-24 animate-fadeIn">
      <div className="container mx-auto px-6">
        
        {/* هدر صفحه */}
        <div className="text-center mb-12">
          <div className="inline-flex p-4 bg-white rounded-2xl shadow-sm mb-4 text-blue-600 text-4xl transform hover:scale-110 transition duration-300">
            <FaRobot />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3">
            دستیارهای هوشمند دامپزشکی
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            برای شروع تشخیص و دریافت مشاوره تخصصی، لطفاً ربات مربوط به حیوان یا زمینه کاری خود را انتخاب کنید.
          </p>
        </div>

        {/* گرید کارت‌ها */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {botsList.map((bot) => (
            <div key={bot.id} className="group h-72 w-full [perspective:1000px] cursor-pointer">
              <div className="relative h-full w-full transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-md hover:shadow-2xl rounded-3xl">
                
                {/* 🟢 روی کارت (Front) */}
                <div className="absolute inset-0 bg-white rounded-3xl flex flex-col items-center justify-center [backface-visibility:hidden] border border-gray-100 p-4">
                  <div className={`w-20 h-20 ${bot.color} rounded-2xl flex items-center justify-center text-white text-4xl mb-4 shadow-lg transform group-hover:scale-110 transition duration-500`}>
                    {bot.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-1">{bot.name}</h3>
                  <div className="w-10 h-1 bg-gray-200 rounded-full my-2"></div>
                  <p className="text-gray-400 text-xs mt-1">مشاهده جزئیات</p>
                </div>

                {/* 🔵 پشت کارت (Back) */}
                <div className={`absolute inset-0 ${bot.color} rounded-3xl [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col items-center justify-center p-6 text-white text-center shadow-inner`}>
                  <h3 className="text-xl font-bold mb-3 border-b border-white/20 pb-2 w-full">{bot.name}</h3>
                  <p className="text-white/90 text-sm mb-6 leading-relaxed line-clamp-3">
                    {bot.desc}
                  </p>
                  
                  {/* دکمه شروع */}
                  <Link 
                    to={`/dashboard/chat/${bot.id}`} 
                    className="w-full py-2.5 bg-white text-slate-900 rounded-xl font-bold hover:bg-gray-50 transition shadow-lg flex items-center justify-center gap-2 text-sm"
                  >
                    شروع گفتگو <FaArrowLeft />
                  </Link>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Bots;
