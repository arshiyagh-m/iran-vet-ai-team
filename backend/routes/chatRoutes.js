const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const License = require('../models/License');
const ChatLog = require('../models/ChatLog');
const KnowledgeBase = require('../models/KnowledgeBase');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/', protect, async (req, res) => {
    const { message, licenseCode, category, subCategory, topic } = req.body;

    // ۱. بررسی لایسنس و توکن (مثل قبل) ...
    const license = await License.findOne({ code: licenseCode, isActive: true });
    if (!license || license.tokens < 2) { // فرض بر هزینه ۲ توکن
        return res.status(400).json({ message: 'اعتبار کافی نیست یا لایسنس نامعتبر است.' });
    }

    try {
        // ۲. جستجو در دیتابیس (RAG)
        const relatedDocs = await KnowledgeBase.find({
            category, subCategory,
            $text: { $search: message }
        }).limit(3);

        let systemPrompt = "";
        let isFallback = false; // پرچم تشخیص حالت

        if (relatedDocs.length > 0) {
            // حالت اول: اطلاعات در دیتابیس موجود است
            const contextData = relatedDocs.map(doc => doc.content).join("\n---\n");
            systemPrompt = `
                شما دستیار دامپزشک متخصص هستید.
                اطلاعات علمی تایید شده: ${contextData}
                دستورالعمل: فقط بر اساس اطلاعات بالا پاسخ بده.
            `;
        } else {
            // حالت دوم: اطلاعات در دیتابیس نیست (Fallback)
            isFallback = true;
            systemPrompt = `
                شما یک دستیار هوشمند دامپزشکی باتجربه هستید.
                دستورالعمل: کاربر سوالی پرسیده که در دیتابیس اختصاصی ما موجود نیست.
                لطفاً با تکیه بر دانش عمومی خودت به عنوان یک هوش مصنوعی پیشرفته پاسخ بده.
                پاسخ باید علمی، محتاطانه و دقیق باشد.
            `;
        }

        // ۳. ارسال به OpenAI
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            temperature: isFallback ? 0.7 : 0.3, // اگر از خودت میگی کمی خلاق‌تر باش، اگه از دیتابیسه دقیق باش
        });

        let aiAnswer = response.choices[0].message.content;

        // ۴. اگر حالت Fallback بود، هشدارهای ایمنی را اضافه کن
        if (isFallback) {
            const warningStart = "⚠️ **توجه:** این پاسخ بر اساس دانش عمومی هوش مصنوعی تولید شده و هنوز توسط تیم تخصصی ما در دیتابیس تایید نشده است.\n\n";
            const warningEnd = "\n\n🔴 **هشدار:** لطفاً پیش از هرگونه اقدام درمانی یا مدیریتی، حتماً با یک دامپزشک مشورت کنید.";
            
            aiAnswer = warningStart + aiAnswer + warningEnd;
        }

        // ۵. کسر توکن و ذخیره
        let cost = (category === 'Poultry') ? 3 : 2; // محاسبه هزینه
        license.tokens -= cost;
        await license.save();

        await ChatLog.create({
            user: req.user._id,
            botType: `${category}-${subCategory}`,
            question: message,
            answer: aiAnswer,
            licenseUsed: licenseCode,
            isFallbackResponse: isFallback // ذخیره وضعیت برای ادمین
        });

        res.json({ answer: aiAnswer, tokensRemaining: license.tokens });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'خطا در پردازش' });
    }
});

module.exports = router;
