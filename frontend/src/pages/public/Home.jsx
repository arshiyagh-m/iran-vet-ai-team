import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaDog, FaCat, FaStethoscope, FaUserMd, FaChartLine, FaRobot, FaCrown, FaCode } from 'react-icons/fa';

// 👇 ایمپورت کامپوننت جدید (مطمئن شوید فایلش را ساخته‌اید)
import WhyChooseUs from '../../components/home/WhyChooseUs';

const Home = () => {
  // دیتای تیم با تغییرات جدید
  const teamMembers = [
    {
      id: 1,
      name: 'ارشیا قنبری میاندوآب',
      role: 'بنیان‌گذار و مدیرعامل',
      desc: 'خالق چشم‌انداز Iran Vet AI و راهبر استراتژیک توسعه هوش مصنوعی.',
      icon: <FaCrown />, // تاج برای مدیر
      isBoss: true // نشانگر مخصوص
    },
    {
      id: 2,
      name: 'امین پاشایی حلبی',
      role: 'مشاور ارشد دامپزشکی',
      desc: 'متخصص طب داخلی دام‌های بزرگ و ناظر علمی الگوریتم‌های تشخیصی.',
      icon: <FaUserMd />,
      isBoss: false
    },
    {
      id: 3,
      name: 'تیم نکسوس دیزاین',
      role: 'تیم فنی و توسعه',
      desc: 'طراحی رابط کاربری، تجربه کاربری و پیاده‌سازی زیرساخت‌های نرم‌افزاری.',
      icon: <FaCode />,
      isBoss: false
    },
  ];

  const popularBots = [
    { id: 1, name: 'دستیار سگ‌ها', icon: <FaDog />, desc: 'تشخیص بیماری‌های نژادهای مختلف سگ' },
    { id: 2, name: 'دستیار گربه‌ها', icon: <FaCat />, desc: 'مشاوره تغذیه و سلامت گربه‌های خانگی' },
    { id: 3, name: 'دام‌های بزرگ', icon: <FaStethoscope />, desc: 'مدیریت سلامت گاو و گوسفند صنعتی' },
    { id: 4, name: 'طیور صنعتی', icon: <FaChartLine />, desc: 'بهینه‌سازی رشد و پیشگیری از بیماری طیور' },
  ];

  return (
    <div className="bg-white animate-fadeIn">
      
      {/* ۱. بخش Hero (بنر اصلی) */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-block px-4 py-1.5 bg-blue-500/20 rounded-full text-blue-300 text-sm font-bold mb-6 border border-blue-500/30">
            نسل جدید دامپزشکی هوشمند 🚀
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            دستیار هوشمند <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Iran Vet AI</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            ما با ترکیب دانش دامپزشکی و قدرت هوش مصنوعی، دقیق‌ترین تشخیص‌ها و مشاوره‌های درمانی را برای حیوانات خانگی و صنعتی شما فراهم می‌کنیم.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Link to="/bots" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2">
              <FaRobot /> مشاهده ربات‌ها
            </Link>
            <Link to="/login" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold transition backdrop-blur-sm border border-white/10">
              ورود به پنل
            </Link>
          </div>
        </div>
      </section>

      {/* ۲. بخش چرا ما؟ (Why Iran Vet AI) - اضافه شده ✅ */}
      <WhyChooseUs />

      {/* ۳. بخش اعضای تیم */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-bold text-sm tracking-wider uppercase">تیم لیدرشیپ</span>
            <h2 className="text-3xl font-bold text-slate-800 mt-2">مغزهای متفکر پروژه</h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8">
            {teamMembers.map((member) => (
              <div 
                key={member.id} 
                className={`
                  relative p-8 rounded-3xl transition-all duration-300 group flex flex-col items-center text-center
                  ${member.isBoss 
                    ? 'bg-slate-900 text-white shadow-2xl scale-105 border-2 border-yellow-500/50 w-full md:w-1/3 z-10 ring-4 ring-slate-100' 
                    : 'bg-white text-gray-800 border border-gray-100 hover:shadow-xl hover:-translate-y-2 w-full md:w-1/4'
                  }
                `}
              >
                {member.isBoss && (
                  <div className="absolute -top-5 bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 border border-white/20">
                    <FaCrown className="text-yellow-200" /> Founder & CEO
                  </div>
                )}

                <div className={`
                  w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-6 shadow-lg transition-transform duration-500
                  ${member.isBoss 
                    ? 'bg-gradient-to-tr from-slate-700 to-slate-800 text-yellow-400 group-hover:rotate-12' 
                    : 'bg-slate-50 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:scale-110'}
                `}>
                  {member.icon}
                </div>
                
                <h3 className={`text-xl font-bold mb-2 ${member.isBoss ? 'text-white' : 'text-slate-800'}`}>{member.name}</h3>
                <span className={`text-xs font-bold uppercase tracking-wider mb-4 block ${member.isBoss ? 'text-yellow-400' : 'text-blue-600'}`}>{member.role}</span>
                <p className={`text-sm leading-relaxed ${member.isBoss ? 'text-slate-400' : 'text-gray-500'}`}>
                  {member.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ۴. ربات‌های محبوب */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4 text-center md:text-right">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-slate-800">ربات‌های پرطرفدار</h2>
              <p className="text-gray-500">ابزارهایی که بیشترین استفاده را توسط کاربران داشته‌اند</p>
            </div>
            <Link to="/bots" className="hidden md:flex items-center gap-2 text-blue-600 hover:text-blue-500 font-bold transition px-4 py-2 bg-blue-50 rounded-xl">
              مشاهده همه ربات‌ها <FaArrowLeft />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularBots.map((bot) => (
              <div key={bot.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl hover:border-blue-100 transition-all duration-300 group cursor-pointer">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl text-blue-500 mb-5 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  {bot.icon}
                </div>
                <h3 className="font-bold text-lg mb-2 text-slate-800 group-hover:text-blue-600 transition">{bot.name}</h3>
                <p className="text-gray-500 text-sm mb-4 leading-6">{bot.desc}</p>
                <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-0 group-hover:w-full transition-all duration-500 ease-out"></div>
                </div>
              </div>
            ))}
          </div>
          
           <div className="mt-8 text-center md:hidden">
            <Link to="/bots" className="inline-flex items-center gap-2 text-blue-600 font-bold bg-blue-50 px-6 py-3 rounded-xl">
              مشاهده همه ربات‌ها <FaArrowLeft />
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;
