import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUserMd, FaCode, FaShieldAlt } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-brand-navy text-white p-4 shadow-md flex justify-between items-center px-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaShieldAlt className="text-brand-green" />
          هوش مصنوعی دامپزشکی ایران
        </h1>
        <div className="flex gap-4">
          <Link to="/login" className="hover:text-brand-gold transition">ورود / ثبت نام</Link>
          <Link to="/chat-selection" className="bg-brand-green px-4 py-2 rounded-lg hover:bg-green-600 transition">
            ورود به گفتگو
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-brand-navy to-blue-900 text-white py-20 text-center px-4">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold mb-6"
        >
          مشاور هوشمند سلامت دام و طیور
        </motion.h2>
        <p className="text-lg md:text-xl mb-8 opacity-90">
          دسترسی آنی به دانش تخصصی دامپزشکی با قدرت هوش مصنوعی
        </p>
        <Link to="/chat-selection" className="bg-white text-brand-navy px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-lg">
          شروع مشاوره رایگان
        </Link>
      </section>

      {/* About Us */}
      <section className="py-16 bg-white text-center">
        <h3 className="text-3xl font-bold text-brand-navy mb-10">تیم متخصص ما</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-10 max-w-6xl mx-auto">
          <TeamCard name="ارشیا قنبری میاندوآب" role="موسس و ریاست" icon={<FaShieldAlt />} />
          <TeamCard name="امین پاشایی" role="مدیر بخش دامپزشکی" icon={<FaUserMd />} />
          <TeamCard name="تیم نکسوس دیزاین" role="مدیر بخش برنامه‌نویسی" icon={<FaCode />} />
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h3 className="text-3xl font-bold text-brand-navy mb-10">تعرفه‌ها</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <PricingCard title="پایه" price="۵۰,۰۰۰" tokens="۲۰" />
            <PricingCard title="حرفه‌ای" price="۱۵۰,۰۰۰" tokens="۷۰" isPopular />
            <PricingCard title="سازمانی" price="تماس بگیرید" tokens="نامحدود" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-navy text-white py-8 text-center mt-auto">
        <p className="opacity-70">تمامی حقوق برای "ایران وترینری ای‌آی" محفوظ است © ۱۴۰۳</p>
      </footer>
    </div>
  );
};

const TeamCard = ({ name, role, icon }) => (
  <div className="p-6 border rounded-xl shadow-sm hover:shadow-md transition">
    <div className="text-4xl text-brand-navy mb-4 flex justify-center">{icon}</div>
    <h4 className="font-bold text-xl">{name}</h4>
    <p className="text-gray-500">{role}</p>
  </div>
);

const PricingCard = ({ title, price, tokens, isPopular }) => (
  <div className={`p-6 rounded-xl border ${isPopular ? 'bg-white border-brand-green shadow-xl transform scale-105' : 'bg-white'}`}>
    {isPopular && <span className="bg-brand-green text-white px-2 py-1 text-xs rounded mb-2 inline-block">پیشنهاد ویژه</span>}
    <h4 className="font-bold text-xl mb-2">{title}</h4>
    <p className="text-3xl font-bold text-brand-navy mb-4">{price} <span className="text-sm font-normal">تومان</span></p>
    <p className="text-gray-600 mb-6">{tokens} توکن هوشمند</p>
    <button className="w-full border border-brand-navy text-brand-navy py-2 rounded hover:bg-brand-navy hover:text-white transition">خرید</button>
  </div>
);

export default Home;

