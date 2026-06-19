const mongoose = require('mongoose');
// اگر مسیر فایلهای محیطی شما متفاوت است، آدرس را تغییر دهید
require('dotenv').config(); 
const TreatmentProtocol = require('./models/TreatmentProtocol');

// نمونه داده‌های واقعی دامپزشکی برای تست سیستم تریاژ و محاسبه دوز
const sampleProtocols = [
    {
        species: 'Cat',
        condition: 'Urinary Spasm', // به عنوان مثال برای کمک به رفع اسپاسم در انسداد مجاری ادراری
        drugName: 'Diazepam',
        baseDosageMgPerKg: 0.5,
        concentrationMgPerMl: 5, // غلظت استاندارد ۵ میلی‌گرم در میلی‌لیتر
        routeOfAdministration: 'IV',
        triageWarnings: [
            'در گربه‌های با نارسایی کبد با احتیاط شدید مصرف شود.',
            'تزریق وریدی باید بسیار آهسته انجام شود تا از آپنه جلوگیری شود.'
        ],
        notes: 'برای شل کردن اسفنکتر مجرای ادرار در موارد احتباس ادراری کاربرد دارد.'
    },
    {
        species: 'Dog',
        condition: 'Anaphylactic Shock',
        drugName: 'Epinephrine',
        baseDosageMgPerKg: 0.01,
        concentrationMgPerMl: 1, // غلظت ۱ میلی‌گرم در میلی‌لیتر (1:1000)
        routeOfAdministration: 'IM',
        triageWarnings: [
            'در وضعیت اورژانسی شوک آنافیلاکسی، مسیر عضلانی (IM) ترجیح داده می‌شود.',
            'در صورت تزریق اشتباهی داخل رگ بدون رقیق‌سازی مناسب، خطر آریتمی شدید وجود دارد.'
        ],
        notes: 'دوز دارویی اورژانسی برای مقابله با واکنش‌های حاد آلرژیک.'
    },
    {
        species: 'Poultry',
        condition: 'Bacterial Infection',
        drugName: 'Enrofloxacin',
        baseDosageMgPerKg: 10,
        concentrationMgPerMl: 100, // محلول ۱۰ درصد (۱۰۰ میلی‌گرم در میلی‌لیتر)
        routeOfAdministration: 'PO',
        triageWarnings: [
            'مدت زمان پرهیز از مصرف گوشت بعد از آخرین دوز رعایت شود.',
            'محلول باید به طور یکنواخت در آب آشامیدنی روزانه گله مخلوط شود.'
        ],
        notes: 'برای درمان عفونت‌های تنفسی و گوارشی باکتریایی در طیور.'
    }
];

const seedDatabase = async () => {
    try {
        // اتصال به دیتابیس (مطمئن شو که این متغیر در فایل .env وجود دارد)
        const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/iranvetai';
        await mongoose.connect(dbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('اتصال به دیتابیس جهت تزریق داده‌ها برقرار شد...');

        // پاک کردن داده‌های قبلی این کالکشن برای جلوگیری از تکرار داده‌ها هنگام اجرای مجدد
        await TreatmentProtocol.deleteMany();
        console.log('داده‌های قبلی پروتکل‌ها پاکسازی شدند.');

        // وارد کردن داده‌های جدید
        await TreatmentProtocol.insertMany(sampleProtocols);
        console.log('داده‌های اولیه دارویی و تریاژ با موفقیت تزریق شدند! 🎉');

        // قطع اتصال و خروج از پروسه
        mongoose.connection.close();
        process.exit();
    } catch (error) {
        console.error('خطا در تزریق داده‌های اولیه:', error);
        process.exit(1);
    }
};

seedDatabase();

