const TreatmentProtocol = require('../models/TreatmentProtocol');

// @desc    محاسبه دوز و حجم داروی مورد نیاز بر اساس گونه، بیماری و وزن
// @route   POST /api/v1/calculator/calculate
// @access  Public (یا Private بر اساس ساختار احراز هویت سایت شما)
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
            // محاسبه دوز کل به میلی‌گرم (وزن حیوان * دوز پایه دارو)
            const totalDosageMg = Number((protocol.baseDosageMgPerKg * weight).toFixed(2));
            
            // محاسبه حجم دارو به میلی‌لیتر (اگر غلظت مشخص شده باشد و دارو مایع/تزریقی باشد)
            let totalVolumeMl = null;
            if (protocol.concentrationMgPerMl && protocol.concentrationMgPerMl > 0) {
                totalVolumeMl = Number((totalDosageMg / protocol.concentrationMgPerMl).toFixed(2));
            }

            return {
                drugName: protocol.drugName,
                baseDosageMgPerKg: protocol.baseDosageMgPerKg,
                totalDosageMg,
                totalVolumeMl, // اگر نال باشد یعنی دارو به صورت قرص یا پودر است و نیاز به حجم مایع ندارد
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

