import React from 'react';
import { Link } from 'react-router-dom';
import { FaDog, FaCat, FaStethoscope, FaFeather, FaPaw, FaFish, FaArrowLeft, FaRobot } from 'react-icons/fa';

const Bots = () => {
  const botsList = [
    { id: 1, name: 'متخصص سگ‌ها', icon: <FaDog />, color: 'bg-orange-500', desc: 'تشخیص پارواویروس، دیستمپر و مشکلات گوارشی سگ‌ها.' },
    { id: 2, name: 'متخصص گربه‌ها', icon: <FaCat />, color: 'bg-blue-500', desc: 'مشاوره رفتارشناسی، تغذیه و بیماری‌های عفونی گربه.' },
    { id: 3, name: 'اسب و تک‌سمیان', icon: <FaStethoscope />, color: 'bg-yellow-600', desc: 'مدیریت لنگش، قولنج و تغذیه اسب‌های مسابقه.' },
    { id: 4, name: 'طیور و پرندگان', icon: <FaFeather />, color: 'bg-red-500', desc: 'بیماری‌های نیوکاسل، آنفولانزا و مدیریت سالن مرغداری.' },
    { id: 5, name: 'دام بزرگ (گاو)', icon: <FaPaw />, color: 'bg-green-600', desc: 'مدیریت ورم پستان، تولید مثل و تغذیه دام شیری.' },
    { id: 6, name: 'آبزیان', icon: <FaFish />, color: 'bg-cyan-500', desc: 'کنترل کیفیت آب و بیماری‌های ماهیان گرم‌آبی و سردآبی.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block p-4 bg-white rounded-full shadow-md mb-6 text-blue-600 text-3xl">
            <FaRobot />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4">ربات‌های هوشمند دامپزشکی</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            لطفاً ربات مربوط به حیوان یا زمینه کاری خود را انتخاب کنید.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {botsList.map((bot) => (
            <div key={bot.id} className="group h-80 w-full [perspective:1000px] cursor-pointer">
              <div className="relative h-full w-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-xl rounded-3xl">
                <div className="absolute inset-0 bg-white rounded-3xl flex flex-col items-center justify-center [backface-visibility:hidden] border border-gray-100 p-6">
                  <div className={`w-24 h-24 ${bot.color} rounded-full flex items-center justify-center text-white text-5xl mb-6 shadow-lg`}>
                    {bot.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">{bot.name}</h3>
                  <p className="text-gray-400 text-sm mt-2">برای مشاهده جزئیات نگه‌دارید</p>
                </div>
                <div className={`absolute inset-0 ${bot.color} rounded-3xl [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col items-center justify-center p-8 text-white text-center`}>
                  <h3 className="text-2xl font-bold mb-4">{bot.name}</h3>
                  <p className="text-white/90 mb-8 leading-relaxed">{bot.desc}</p>
                  <Link to="/dashboard/tickets" className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg flex items-center gap-2">
                    شروع مشاوره <FaArrowLeft />
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
