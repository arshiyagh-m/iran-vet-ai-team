import React from 'react';
import { FaShieldAlt, FaExclamationTriangle, FaGavel, FaFileContract, FaUserMd } from 'react-icons/fa';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        
        {/* باکس اصلی */}
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100">
          
          {/* هدر */}
          <div className="flex flex-col md:flex-row items-center gap-4 mb-10 border-b pb-8">
            <div className="bg-blue-100 p-4 rounded-2xl">
                <FaFileContract className="text-4xl text-blue-600" />
            </div>
            <div className="text-center md:text-right">
                <h1 className="text-3xl font-extrabold text-slate-800">قوانین و مقررات استفاده</h1>
                <p className="text-gray-500 mt-2 text-sm">آخرین بروزرسانی: اسفند ۱۴۰۴</p>
            </div>
          </div>

          {/* باکس هشدار مهم (سلب مسئولیت اصلی) */}
          <div className="bg-red-50 border-r-4 border-red-500 p-6 rounded-xl mb-10">
            <h3 className="text-red-700 font-bold text-lg flex items-center gap-2 mb-2">
                <FaExclamationTriangle /> سلب مسئولیت حیاتی (بسیار مهم)
            </h3>
            <p className="text-red-800 text-sm leading-7 text-justify">
                سامانه <strong>Iran Vet AI</strong> صرفاً یک ابزار هوشمند جهت «آگاهی‌بخشی» و «راهنمایی اولیه» است. اطلاعات ارائه‌شده توسط این هوش مصنوعی به هیچ عنوان جایگزین معاینه بالینی، آزمایشگاهی و تشخیص نهایی توسط دامپزشک دارای پروانه نظام دامپزشکی نمی‌باشد. <br/>
                <strong>مالکیت و مدیریت این سایت هیچگونه مسئولیتی در قبال تشخیص اشتباه، عوارض جانبی داروها، تلف شدن حیوان یا هرگونه خسارت مالی و جانی ناشی از عمل به توصیه‌های هوش مصنوعی را نمی‌پذیرد. تصمیم نهایی و مسئولیت درمان، ۱۰۰٪ بر عهده کاربر و دامپزشک معالج اوست.</strong>
            </p>
          </div>

          {/* محتوای قوانین */}
          <div className="space-y-10 text-gray-700 leading-8 text-justify">
            
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="bg-slate-200 w-8 h-8 flex items-center justify-center rounded-full text-sm">1</span>
                پذیرش شرایط
              </h2>
              <p>
                ورود به وب‌سایت، ثبت‌نام و استفاده از هر یک از خدمات (ربات‌ها، مقالات، تیکت‌ها) به منزله مطالعه دقیق و پذیرش بی‌قید و شرط تمام بندهای این توافق‌نامه است. اگر با هر بخشی از این قوانین مخالفید، لطفاً فوراً استفاده از سرویس را متوقف کنید.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="bg-slate-200 w-8 h-8 flex items-center justify-center rounded-full text-sm">2</span>
                ماهیت خدمات و محدودیت‌های هوش مصنوعی
              </h2>
              <ul className="list-disc list-inside space-y-2 pr-4 text-sm">
                <li>پاسخ‌های این سیستم بر اساس الگوریتم‌های احتمالاتی و دیتابیس‌های علمی تولید می‌شود و <strong>امکان خطا (Hallucination)</strong> در آن وجود دارد.</li>
                <li>هوش مصنوعی توانایی دیدن، لمس کردن و شنیدن صدای قلب حیوان شما را ندارد؛ بنابراین تشخیص آن همیشه ناقص است.</li>
                <li>توصیه‌های دارویی صرفاً جنبه اطلاع‌رسانی دارد و تهیه و مصرف هرگونه دارو باید با نسخه دامپزشک انجام شود.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="bg-slate-200 w-8 h-8 flex items-center justify-center rounded-full text-sm">3</span>
                شرایط اضطراری و اورژانسی
              </h2>
              <p>
                این پلتفرم برای موارد اورژانسی طراحی <strong>نشده است</strong>. در صورت مشاهده علائمی نظیر: خونریزی شدید، تشنج، بیهوشی، تصادف، سخت‌زایی، خفگی و ضربه مغزی، استفاده از این سایت را رها کرده و فوراً حیوان را به نزدیک‌ترین بیمارستان دامپزشکی برسانید. اتلاف وقت برای چت با ربات در این شرایط می‌تواند منجر به مرگ حیوان شود و مسئولیت آن با کاربر است.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="bg-slate-200 w-8 h-8 flex items-center justify-center rounded-full text-sm">4</span>
                سلب مسئولیت کامل (Indemnification)
              </h2>
              <p>
                کاربر توافق می‌کند که مدیران، توسعه‌دهندگان و مالکان Iran Vet AI را از هرگونه ادعا، شکایت، خسارت یا تقاضایی که ناشی از استفاده یا سوءاستفاده از سرویس، نقض قوانین توسط کاربر، یا اتکا به اطلاعات سایت باشد، مبرا بداند. ما هیچ تعهدی برای تضمین سلامت حیوان شما پس از استفاده از مشاوره‌ها نداریم.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="bg-slate-200 w-8 h-8 flex items-center justify-center rounded-full text-sm">5</span>
                قوانین مالی و بازگشت وجه
              </h2>
              <ul className="list-disc list-inside space-y-2 pr-4 text-sm">
                <li>خرید توکن و اشتراک‌ها قطعی است و پس از پرداخت، امکان عودت وجه وجود ندارد (مگر در موارد خطای فنی اثبات شده).</li>
                <li>توکن‌ها دارای ارزش ریالی نیستند و قابل انتقال به حساب کاربری دیگر نمی‌باشند.</li>
                <li>ما حق تغییر قیمت‌ها را در هر زمان برای خود محفوظ می‌داریم.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="bg-slate-200 w-8 h-8 flex items-center justify-center rounded-full text-sm">6</span>
                مالکیت فکری و سوءاستفاده
              </h2>
              <p>
                تمامی محتوا، کدها، دیتابیس‌ها و نام تجاری متعلق به Iran Vet AI است. هرگونه کپی‌برداری، مهندسی معکوس، یا استفاده از ربات‌ها برای استخراج داده‌ها ممنوع بوده و پیگرد قانونی دارد. استفاده از سرویس برای مقاصد غیرقانونی یا آسیب رساندن به حیوانات اکیداً ممنوع است.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="bg-slate-200 w-8 h-8 flex items-center justify-center rounded-full text-sm">7</span>
                قانون حاکم
              </h2>
              <p>
                این توافق‌نامه بر اساس قوانین جمهوری اسلامی ایران تنظیم شده است. در صورت بروز هرگونه اختلاف حقوقی، صالح‌ترین مرجع رسیدگی، مراجع قضایی محل اقامت مدیر سایت خواهد بود.
              </p>
            </section>

          </div>

          {/* فوتر قوانین */}
          <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-200 text-center">
            <FaUserMd className="text-4xl text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-bold">
                «سلامت حیوان شما اولویت ماست؛ اما هوش مصنوعی هرگز جایگزین دستان پزشک نیست.»
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Terms;
