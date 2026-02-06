const OpenAI = require('openai');
const ChatLog = require('../models/ChatLog');
const User = require('../models/User');
const KnowledgeBase = require('../models/KnowledgeBase');
const License = require('../models/License'); // مدل لایسنس را هم اضافه کردیم

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.chat = async (req, res) => {
  try {
    // ۱. دریافت اطلاعات
    const { message, botType, licenseCode } = req.body;
    const userId = req.user.id;
    let user = await User.findById(userId);

    // --- گام صفر: بررسی سلام و احوال‌پرسی (رایگان) ---
    const greetings = ['سلام', 'درود', 'خسته نباشید', 'چطوری', 'خوبی', 'صبح بخیر', 'شب بخیر', 'hi', 'hello'];
    const isGreeting = greetings.some(g => message.trim().toLowerCase().startsWith(g)) && message.length < 30;

    if (isGreeting) {
        return res.json({ 
            response: `سلام! من دستیار هوشمند ${botType === 'general' ? 'دامپزشکی' : botType} هستم. چطور می‌توانم کمکتان کنم؟`, 
            remainingTokens: user.tokens, // کسر نمی‌شود
            isFallback: false 
        });
    }

    // --- گام یک: بررسی اعتبار (لایسنس یا توکن کاربر) ---
    let activeLicense = null;
    let useUserTokens = false;

    if (licenseCode) {
        // اگر کد لایسنس فرستاده شده
        activeLicense = await License.findOne({ code: licenseCode, isActive: true });
        if (!activeLicense || activeLicense.tokens < 1) {
            return res.status(400).json({ message: 'لایسنس نامعتبر یا فاقد اعتبار است.' });
        }
    } else {
        // استفاده از توکن شخصی
        if (user.tokens < 1) {
            return res.status(403).json({ message: 'اعتبار توکن حساب شما تمام شده است.' });
        }
        useUserTokens = true;
    }

    // --- گام دو: جستجو در دیتابیس (RAG) ---
    const relatedDocs = await KnowledgeBase.find({
        category: botType,
        content: { $regex: message, $options: 'i' }
    }).limit(3);

    let systemPrompt = "";
    let isFallback = false;
    let referenceText = "";
    let shouldDeductToken = true; // پیش‌فرض: توکن کم شود

    if (relatedDocs.length > 0) {
        // ✅ حالت اول: اطلاعات در دیتابیس هست
        const contextData = relatedDocs.map(doc => doc.content).join("\n---\n");
        referenceText = relatedDocs.map(doc => doc.title).join(", ");
        
        systemPrompt = `
        شما دستیار دامپزشک متخصص در زمینه "${botType}" هستید.
        من به شما اطلاعاتی از منابع معتبر خودم می‌دهم. 
        وظیفه شما این است که **فقط و فقط** با استفاده از این اطلاعات به سوال کاربر پاسخ دهید.
        
        اطلاعات منبع:
        ${contextData}
        `;
    } else {
        // ⚠️ حالت دوم: اطلاعات نیست (Fallback) -> بررسی مرتبط بودن سوال
        isFallback = true;
        referenceText = "دانش عمومی هوش مصنوعی";
        
        systemPrompt = `
        شما یک متخصص دامپزشکی با تجربه در زمینه "${botType}" هستید.
        
        دستورالعمل مهم:
        1. ابتدا بررسی کن آیا سوال کاربر مستقیماً به "${botType}" یا سلامت حیوانات مرتبط است؟
        2. اگر سوال درباره سیاست، ورزش، قیمت دلار، برنامه‌نویسی یا مسائل غیرمرتبط بود، فقط بگو: "OUT_OF_SCOPE".
        3. اگر سوال مرتبط بود ولی در دیتابیس نبود، با تکیه بر دانش عمومی پاسخ علمی و دقیق بده.
        `;
    }

    // --- گام سه: ارسال به OpenAI ---
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // برای صرفه‌جویی (می‌توانید به gpt-4o تغییر دهید)
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
        ],
        temperature: isFallback ? 0.5 : 0.2, 
    });

    let aiAnswer = completion.choices[0].message.content;

    // --- گام چهار: پردازش پاسخ ---
    if (aiAnswer.includes("OUT_OF_SCOPE")) {
        // سوال نامرتبط بود
        aiAnswer = `من ربات تخصصی ${botType} هستم و نمی‌توانم به سوالات خارج از این حیطه (مثل سیاست، دلار و...) پاسخ دهم. لطفاً سوال مرتبط بپرسید.`;
        shouldDeductToken = false; // ❌ توکن کسر نمی‌شود
        isFallback = false; 
    } 
    else if (isFallback) {
        // سوال مرتبط بود اما از دانش عمومی پاسخ داده شد
        const warningStart = "⚠️ **توجه:** این پاسخ بر اساس دانش عمومی هوش مصنوعی است و هنوز در دیتابیس اختصاصی ما تایید نشده است.\n\n";
        const warningEnd = "\n\n🔴 **هشدار:** لطفاً پیش از هرگونه اقدام درمانی، با دامپزشک مشورت کنید.";
        aiAnswer = warningStart + aiAnswer + warningEnd;
    }

    // --- گام پنج: کسر اعتبار (فقط اگر لازم باشد) ---
    if (shouldDeductToken) {
        if (useUserTokens) {
            user.tokens -= 1;
            await user.save();
        } else if (activeLicense) {
            activeLicense.tokens -= 1;
            await activeLicense.save();
        }
    }

    // --- گام شش: ذخیره در لاگ چت ---
    const newChat = new ChatLog({
        user: userId,
        botType: botType,
        question: message,
        answer: aiAnswer,
        reference: referenceText,
        licenseUsed: licenseCode || 'UserTokens',
        isFallbackResponse: isFallback && shouldDeductToken
    });
    await newChat.save();

    // --- گام هفت: ارسال پاسخ ---
    res.json({
        response: aiAnswer,
        remainingTokens: useUserTokens ? user.tokens : (activeLicense ? activeLicense.tokens : 0),
        isFallback: isFallback
    });

  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ message: 'خطا در برقراری ارتباط با سرویس هوش مصنوعی.' });
  }
};
