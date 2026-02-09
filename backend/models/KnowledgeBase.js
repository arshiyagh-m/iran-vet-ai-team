const mongoose = require('mongoose');

const knowledgeBaseSchema = new mongoose.Schema({
    // دسته‌بندی کلی (مثل: bee, dog, cat) - این اجباری است
    category: { 
        type: String, 
        required: true 
    },

    // عنوان بیماری یا موضوع - اجباری
    title: { 
        type: String, 
        required: true 
    },

    // متن اصلی توضیحات - اجباری
    content: { 
        type: String, 
        required: true 
    },

    // زیرمجموعه (مثل: بیماری‌های انگلی) - اختیاری با مقدار پیش‌فرض
    subCategory: { 
        type: String, 
        default: 'general' 
    },

    // موضوع دقیق‌تر - اختیاری با مقدار پیش‌فرض
    topic: { 
        type: String, 
        default: 'general' 
    },

    // تگ‌ها برای جستجو
    tags: [String],
    
    // نام فایل منبع (برای اینکه بدانیم از کجا ایمپورت شده) - اختیاری با پیش‌فرض
    sourceFile: { 
        type: String, 
        default: 'manual_entry' 
    }, 

    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// ایندکس‌گذاری برای جستجوی متنی سریع
knowledgeBaseSchema.index({ content: 'text', title: 'text', tags: 'text' });

// اکسپورت مدل (با جلوگیری از تعریف تکراری)
module.exports = mongoose.models.KnowledgeBase || mongoose.model('KnowledgeBase', knowledgeBaseSchema);
