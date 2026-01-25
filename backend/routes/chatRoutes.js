const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const License = require('../models/License');
const ChatLog = require('../models/ChatLog');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/', protect, async (req, res) => {
    const { message, licenseCode, category, subCategory } = req.body;

    // 1. بررسی لایسنس
    const license = await License.findOne({ code: licenseCode, isActive: true });
    
    if (!license) {
        return res.status(400).json({ message: 'کد لایسنس نامعتبر است' });
    }

    // 2. محاسبه هزینه توکن
    // طیور (پیچیده) = ۳ توکن، زنبور (ساده) = ۱ توکن، بقیه = ۲ توکن (پیش‌فرض)
    let cost = 2;
    if (category === 'Poultry') cost = 3;
    if (category === 'Bees') cost = 1;

    if (license.tokens < cost) {
        return res.status(400).json({ message: 'اعتبار توکن شما کافی نیست. لطفا شارژ کنید.' });
    }

    // 3. ارسال به OpenAI (RAG Logic Simplified)
    // اینجا باید پرامپت مهندسی شده بر اساس دسته‌بندی ارسال شود
    const systemPrompt = `You are an expert veterinary AI assistant specializing in ${category} -> ${subCategory}. 
    Respond ONLY in Persian (Farsi). Be professional, medical, and concise.`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4", // یا gpt-3.5-turbo برای هزینه کمتر
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
        });

        const aiAnswer = response.choices[0].message.content;

        // 4. کسر توکن و ذخیره تاریخچه
        license.tokens -= cost;
        await license.save();

        await ChatLog.create({
            user: req.user._id,
            botType: category,
            question: message,
            answer: aiAnswer,
            licenseUsed: licenseCode
        });

        res.json({ answer: aiAnswer, tokensRemaining: license.tokens });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'خطا در ارتباط با هوش مصنوعی' });
    }
});

// دریافت تاریخچه چت کاربر
router.get('/history', protect, async (req, res) => {
    const history = await ChatLog.find({ user: req.user._id }).sort({ timestamp: -1 });
    res.json(history);
});

module.exports = router;

