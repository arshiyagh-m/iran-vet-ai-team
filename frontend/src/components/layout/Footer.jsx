import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-brand-navy text-white pt-12 pb-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* ستون اول */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-brand-gold">هوش مصنوعی دامپزشکی</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              اولین سامانه تشخیص هوشمند بیماری‌های دامی و طیور در ایران. 
              ما با ترکیب دانش دامپزشکی و تکنولوژی، سلامت گله شما را تضمین می‌کنیم.
            </p>
          </div>

          {/* ستون دوم */}
          <div>
            <h4 className="font-bold mb-4">دسترسی سریع</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="#" className="hover:text-brand-gold">تشخیص بیماری</a></li>
              <li><a href="#" className="hover:text-brand-gold">تعرفه خدمات</a></li>
              <li><a href="#" className="hover:text-brand-gold">قوانین و مقررات</a></li>
            </ul>
          </div>

          {/* ستون سوم */}
          <div>
            <h4 className="font-bold mb-4">پشتیبانی</h4>
            <p className="text-gray-300 text-sm mb-2">تلفن: ۰۲۱-۱۲۳۴۵۶۷۸</p>
            <p className="text-gray-300 text-sm">ایمیل: support@iranvetai.ir</p>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6 text-center text-xs text-gray-400">
          © ۱۴۰۳ تمامی حقوق محفوظ است | طراحی توسط نکسوس دیزاین
        </div>
      </div>
    </footer>
  );
};

export default Footer;

