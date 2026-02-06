import React from 'react';
import { Link } from 'react-router-dom';
// 👇 اصلاح: FaHeadset را اینجا اضافه کردم و FaStethoscope و بقیه را مرتب کردم
import { FaArrowLeft, FaDog, FaCat, FaStethoscope, FaUserMd, FaLaptopCode, FaChartLine, FaRobot, FaHeadset } from 'react-icons/fa';

const Home = () => {
  // دیتای تیم
  const teamMembers = [
    {
      id: 1,
      name: 'ارشیا قنبری',
      role: 'بنیان‌گذار و مدیر فنی',
      desc: 'متخصص هوش مصنوعی و توسعه‌دهنده ارشد سیستم‌های دامپزشکی.',
      icon: <FaLaptopCode />
    },
    {
      id: 2,
      name: 'دکتر محمدی',
      role: 'مشاور ارشد دامپزشکی',
      desc: 'متخصص بیماری‌های داخلی دام با ۱۵ سال سابقه فعالیت.',
      icon: <FaUserMd />
    },
    {
      id: 3,
      name: 'مهندس رضایی',
      role: 'مدیر محصول',
      desc: 'تحلیلگر داده و طراح تجربه کاربری پلتفرم‌های پزشکی.',
      icon: <FaChartLine />
    },
    {
      id: 4,
      name: 'سارا احمدی',
      role: 'پشتیبانی فنی',
      desc: 'مسئول ارتباط با مشتریان و حل مشکلات فنی کاربران.',
      icon: <FaHeadset /> // 👈 الان این از ایمپورت بالا خوانده می‌شود و خطا نمی‌دهد
    }
  ];

  const popularBots = [
    { id: 1, name: 'دستیار سگ‌ها', icon: <FaDog />, desc: 'تشخیص بیماری‌های نژادهای مختلف سگ' },
    { id: 2, name: 'دستیار گربه‌ها', icon: <FaCat />, desc: 'مشاوره تغذیه و سلامت گربه‌های خانگی' },
    { id: 3, name: 'دام‌های بزرگ', icon: <FaStethoscope />, desc: 'مدیریت سلامت گاو و گوسفند صنعتی' },
    { id: 4, name: 'طیور صنعتی', icon: <FaChartLine />, desc: 'بهینه‌سازی رشد و پیشگیری از بیماری طیور' },
  ];

  return (
    <div className="bg-white">
      
      {/* ۱. بخش Hero */}
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

      {/* ۲. بخش توضیحات */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">چرا Iran Vet AI؟</h2>
            <p className="text-gray-500">
              سیستم ما فراتر از یک چت‌بات ساده است. این یک اکوسیستم کامل پزشکی است که با تحلیل هزاران پرونده پزشکی، بهترین راهکار را به شما پیشنهاد می‌دهد.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6"><FaStethoscope /></div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">دقت بالای تشخیص</h3>
              <p className="text-gray-500 text-sm leading-relaxed">استفاده از الگوریتم‌های پیشرفته برای کاهش خطای انسانی در تشخیص اولیه بیماری‌ها.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-2xl mb-6"><FaRobot /></div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">پاسخگویی ۲۴ ساعته</h3>
              <p className="text-gray-500 text-sm leading-relaxed">ربات‌های ما هرگز نمی‌خوابند و در هر ساعت از شبانه روز آماده پاسخگویی به سوالات شما هستند.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-2xl mb-6"><FaChartLine /></div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">مدیریت گله و فارم</h3>
              <p className="text-gray-500 text-sm leading-relaxed">ابزارهای اختصاصی برای دامداران جهت پایش سلامت گله و افزایش بهره‌وری تولید.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ۳. بخش اعضای تیم */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-800 mb-12 text-center">تیم متخصص ما</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-lg transition group">
                <div className="w-16 h-16 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center text-2xl text-slate-400 mb-4 group-hover:border-blue-500 group-hover:text-blue-500 transition">
                  {member.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{member.name}</h3>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3 block">{member.role}</span>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {member.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ۴. ربات‌های محبوب */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">ربات‌های پرطرفدار</h2>
              <p className="text-slate-400">ابزارهایی که بیشترین استفاده را توسط کاربران داشته‌اند</p>
            </div>
            <Link to="/bots" className="hidden md:flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold transition">
              مشاهده همه ربات‌ها <FaArrowLeft />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {popularBots.map((bot) => (
              <div key={bot.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:bg-slate-700 transition">
                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-2xl text-blue-400 mb-4 shadow-inner">
                  {bot.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{bot.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{bot.desc}</p>
                {/* هدایت به تیکت‌ها چون چت حذف شد */}
                <Link to="/dashboard/tickets" className="text-sm font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  شروع مشاوره <FaArrowLeft size={12} />
                </Link>
              </div>
            ))}
          </div>
          
           <div className="mt-8 text-center md:hidden">
            <Link to="/bots" className="inline-flex items-center gap-2 text-blue-400 font-bold">
              مشاهده همه ربات‌ها <FaArrowLeft />
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;
