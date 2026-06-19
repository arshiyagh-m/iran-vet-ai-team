const mongoose = require('mongoose');

const treatmentProtocolSchema = new mongoose.Schema({
    species: {
        type: String,
        required: [true, 'وارد کردن گونه حیوان الزامی است'],
        enum: ['Cat', 'Dog', 'Poultry', 'Large Animal', 'Bee', 'Other']
    },
    condition: {
        type: String,
        required: [true, 'نام بیماری یا وضعیت (مثل انسداد مجاری ادراری) الزامی است'],
        trim: true
    },
    drugName: {
        type: String,
        required: [true, 'نام دارو الزامی است'],
        trim: true
    },
    // دوز پایه: میلی‌گرم بر هر کیلوگرم از وزن بدن
    baseDosageMgPerKg: {
        type: Number,
        required: [true, 'دوز پایه دارو الزامی است']
    },
    // غلظت دارو برای محاسبه حجم تزریق: میلی‌گرم در هر میلی‌لیتر (برای داروهای مایع)
    concentrationMgPerMl: {
        type: Number,
        required: false,
        default: 1 // اگر دارو قرص باشد نیازی به این فیلد برای محاسبه حجم مایع نیست
    },
    routeOfAdministration: {
        type: String,
        required: [true, 'مسیر تجویز دارو الزامی است'],
        enum: ['IV', 'IM', 'SC', 'PO', 'Topical']
    },
    // هشدارهای حساس تریاژ که دامپزشک باید بداند
    triageWarnings: [{
        type: String
    }],
    // توضیحات تکمیلی
    notes: {
        type: String,
        trim: true
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('TreatmentProtocol', treatmentProtocolSchema);
