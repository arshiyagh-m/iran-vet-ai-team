import React from 'react';
import { FaShieldAlt } from 'react-icons/fa';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
          
          <div className="flex items-center gap-4 mb-8 border-b pb-6">
            <FaShieldAlt className="text-4xl text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-800">قوانین و مقررات</h1>
          </div>

          <div className="space-y-8 text-gray-600 leading-relaxed text-justify">
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">۱. مقدمه</h2>
              <p>استفاده شما از وب‌سایت و خدمات Iran Vet AI به معنی پذیرش کامل قوانین و مقررات زیر است. لطفاً پیش از استفاده، این موارد را با دقت مطالعه فرمایید.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">۲. ماهیت خدمات</h2>
              <p>این پلتفرم یک دستیار هوشمند مبتنی بر هوش مصنوعی است. پیشنهادات ارائه‌شده توسط ربات‌ها صرفاً جنبه مشورتی داشته و **هرگز جایگزین تشخیص نهایی دامپزشک حضوری نمی‌باشد**. در موارد اورژانسی، فوراً به کلینیک دامپزشکی مراجعه کنید.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">۳. حریم خصوصی</h2>
              <p>ما متعهد به حفظ اطلاعات شخصی و پرونده‌های پزشکی حیوانات شما هستیم. اطلاعات شما بدون اجازه کتبی در اختیار شخص ثالث قرار نخواهد گرفت.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">۴. مسئولیت کاربر</h2>
              <p>مسئولیت صحت اطلاعات ورودی (علائم، سن حیوان، نژاد و ...) بر عهده کاربر است. پاسخ‌های هوش مصنوعی بر اساس اطلاعاتی است که شما وارد می‌کنید.</p>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Terms;

