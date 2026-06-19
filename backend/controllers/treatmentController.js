const TreatmentProtocol = require('../models/TreatmentProtocol');

// @desc    محاسبه دوز و حجم داروی مورد نیاز بر اساس گونه، بیماری و وزن
// @route   POST /api/v1/calculator/calculate
exports.calculateDosage = async (req, res) => {
    try {
        const { species, condition, weight } = req.body;

        // ۱. اعتبارسنجی ورودی‌ها
        if (!species || !condition || !weight) {
            return res.status(400).json({
                success: false,
                message: 'لطفاً گونه حیوان، وضعیت بیماری و وزن را وارد کنید.'
            });
        }

        if (isNaN(weight) || weight <= 0) {
            return res.status(400).json({
                success: false,
                message: 'وزن وارد شده باید یک عدد مثبت و بزرگتر از صفر باشد.'
            });
        }

        // ۲. جستجوی پروتکل‌های درمانی منطبق در دیتابیس
        const protocols = await TreatmentProtocol.find({ species, condition });

        if (!protocols || protocols.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'پروتکل درمانی یا دارویی برای این گونه و وضعیت یافت نشد.'
            });
        }

        // ۳. محاسبه دوز و حجم مورد نیاز برای هر دارو
        const calculationResults = protocols.map(protocol => {
            // محاسبه دوز کل به میلی‌گرم
            const totalDosageMg = Number((protocol.baseDosageMgPerKg * weight).toFixed(2));
            
            // محاسبه حجم دارو به میلی‌لیتر
            let totalVolumeMl = null;
            if (protocol.concentrationMgPerMl && protocol.concentrationMgPerMl > 0) {
                totalVolumeMl = Number((totalDosageMg / protocol.concentrationMgPerMl).toFixed(2));
            }

            return {
                drugName: protocol.drugName,
                baseDosageMgPerKg: protocol.baseDosageMgPerKg,
                totalDosageMg,
                totalVolumeMl,
                routeOfAdministration: protocol.routeOfAdministration,
                triageWarnings: protocol.triageWarnings,
                notes: protocol.notes
            };
        });

        // ۴. ارسال پاسخ نهایی به فرانت‌اند
        return res.status(200).json({
            success: true,
            animal: { species, weight: Number(weight) },
            condition,
            results: calculationResults
        });

    } catch (error) {
        console.error('خطا در کنترلر محاسبات دوز:', error);
        return res.status(500).json({
            success: false,
            message: 'خطایی در سرور رخ داده است. لطفاً مجدداً تلاش کنید.',
            error: error.message
        });
    }
};

// ==========================================
// بخش مربوط به تزریق داده‌های اولیه (Seed)
// ==========================================

const sampleProtocols = [
    {
        species: 'Cat',
        condition: 'Urinary Spasm',
        drugName: 'Diazepam',
        baseDosageMgPerKg: 0.5,
        concentrationMgPerMl: 5,
        routeOfAdministration: 'IV',
        triageWarnings: ['در گربه‌های با نارسایی کبد با احتیاط شدید مصرف شود.', 'تزریق وریدی بسیار آهسته باشد.'],
        notes: 'برای شل کردن اسفنکتر مجرای ادرار در موارد احتباس ادراری.'
    },
    {
        species: 'Dog',
        condition: 'Anaphylactic Shock',
        drugName: 'Epinephrine',
        baseDosageMgPerKg: 0.01,
        concentrationMgPerMl: 1,
        routeOfAdministration: 'IM',
        triageWarnings: ['مسیر عضلانی (IM) ترجیح داده می‌شود.', 'خطر آریتمی شدید در صورت تزریق اشتباه وریدی.'],
        notes: 'دوز دارویی اورژانسی برای مقابله با واکنش‌های حاد آلرژیک.'
    },
    {
        species: 'Poultry',
        condition: 'Bacterial Infection',
        drugName: 'Enrofloxacin',
        baseDosageMgPerKg: 10,
        concentrationMgPerMl: 100,
        routeOfAdministration: 'PO',
        triageWarnings: ['مدت زمان پرهیز از مصرف گوشت رعایت شود.'],
        notes: 'برای درمان عفونت‌های تنفسی و گوارشی باکتریایی در طیور.'
    }
];

// @desc    تزریق داده‌های اولیه به دیتابیس (فقط با باز کردن لینک)
// @route   GET /api/v1/calculator/seed
exports.seedTreatments = async (req, res) => {
    try {
        await TreatmentProtocol.deleteMany(); // پاک کردن دیتای قبلی
        await TreatmentProtocol.insertMany(sampleProtocols); // وارد کردن دیتای جدید
        
        return res.status(200).json({
            success: true,
            message: 'داده‌های اولیه دارویی و تریاژ با موفقیت به دیتابیس تزریق شدند! 🎉'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'خطا در تزریق داده‌ها',
            error: error.message
        });
    }
};
