const TreatmentProtocol = require('../models/TreatmentProtocol');
const fs = require('fs');
const path = require('path');

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
// بخش مربوط به تزریق داده‌های اولیه (Seed) از فایل JSON
// ==========================================

// @desc    تزریق داده‌های اولیه از فایل JSON به دیتابیس
// @route   GET /api/v1/calculator/seed
exports.seedTreatments = async (req, res) => {
    try {
        // پیدا کردن آدرس دقیق فایل JSON در سرور (یک پوشه قبل‌تر از کنترلرها)
        const dataPath = path.join(__dirname, '../veterinary_data.json');
        
        // خواندن اطلاعات فایل
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const jsonData = JSON.parse(rawData);
        
        // پاک کردن دیتای قدیمی و وارد کردن تمام دیتای فایل JSON
        await TreatmentProtocol.deleteMany(); 
        await TreatmentProtocol.insertMany(jsonData); 
        
        return res.status(200).json({
            success: true,
            totalInserted: jsonData.length,
            message: `داده‌های کلینیکال با موفقیت به روزرسانی شدند! (${jsonData.length} رکورد اضافه شد) 🎉`
        });
    } catch (error) {
        console.error('Seed Error:', error);
        return res.status(500).json({
            success: false,
            message: 'خطا در خواندن فایل یا تزریق داده‌ها. مطمئن شوید فایل veterinary_data.json در پوشه اصلی بک‌اند وجود دارد.',
            error: error.message
        });
    }
};
