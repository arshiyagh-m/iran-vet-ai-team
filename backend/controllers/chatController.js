const OpenAI = require('openai');
const ChatLog = require('../models/ChatLog');
const User = require('../models/User');
const KnowledgeBase = require('../models/KnowledgeBase');
const License = require('../models/License');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// نگاشت نام لاتین به فارسی برای پرامپت
const BOT_TITLES = {
    bee: "زنبور عسل",
    dog: "سگ‌ها",
    cat: "گربه‌ها",
    cow: "دام بزرگ",
    horse: "اسب",
    poultry: "طیور",
    fish: "آبزیان",
    general: "دامپزشکی عمومی"
};

exports.chat = async (req, res) => {
  try {
    // ۱. دریافت اطلاعات ورودی
    const { message, botType, licenseCode } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);

    // --- گام صفر: پاسخ به سلام و احوال‌پرسی (بدون هزینه) ---
    const greetings = ['سلام', 'درود', 'خسته نباشید', 'چطوری', 'خوبی', 'صبح بخیر', 'شب بخیر', 'hi', 'hello'];
    // اگر پیام کوتاه بود و با سلام شروع می‌شد
    const isGreeting = greetings.some(g => message.trim().toLowerCase().startsWith(g)) && message.length < 30;

    if (isGreeting) {
        const botName = BOT_TITLES[botType] || 'دامپزشکی';
        return res.json({ 
            response: `سلام! من دستیار هوشمند و تخصصی ${botName} هستم. سوال خود را بپرسید تا در پایگاه دانش جستجو کنم.`, 
            remainingTokens: user.tokens, 
            isFallback: false 
        });
    }

    // --- گام یک: بررسی اعتبار (لایسنس یا توکن کاربر) ---
    let activeLicense = null;
    let useUserTokens = false;

    if (licenseCode) {
        // بررسی لایسنس
        activeLicense = await License.findOne({ code: licenseCode, isActive: true });
        if (!activeLicense || activeLicense.tokens < 1) {
            return res.status(400).json({ message: 'لایسنس نامعتبر یا فاقد اعتبار است.' });
        }
    } else {
        // بررسی توکن کاربر
        if (user.tokens < 1) {
            return res.status(403).json({ message: 'اعتبار توکن حساب شما تمام شده است. لطفاً حساب خود را شارژ کنید.' });
        }
        useUserTokens = true;
    }

    // --- گام دو: جستجو در دیتابیس (Strict RAG) ---
    // فقط در دسته‌بندی مربوطه (botType) جستجو می‌کنیم
    const relatedDocs = await KnowledgeBase.find({
        category: botType,
        content: { $regex: message, $options: 'i' } // جستجوی کلمه کلیدی
    }).limit(3); // حداکثر ۳ سند مرتبط

    let aiAnswer = "";
    let referenceText = "";
    let shouldDeductToken = false; // پیش‌فرض: توکن کم نمی‌شود مگر جواب پیدا شود

    // 🔴 لاجیک اصلی: فقط اگر داکیومنت بود به OpenAI بفرست
    if (relatedDocs.length === 0) {
        // حالت ۱: اطلاعاتی در دیتابیس نیست
        // ⛔ اینجا اصلا به OpenAI وصل نمی‌شویم (صرفه‌جویی در هزینه)
        aiAnswer = "متاسفانه اطلاعاتی در مورد این موضوع در پایگاه دانش تخصصی من یافت نشد. لطفاً با یک دامپزشک مشورت کنید.";
        referenceText = "بدون منبع";
        shouldDeductToken = false; // توکن کم نمی‌کنیم چون جوابی ندادیم
    } else {
        // حالت ۲: اطلاعات پیدا شد
        shouldDeductToken = true; // چون جواب می‌دهیم، توکن کم می‌کنیم
        
        // آماده‌سازی متن منبع برای هوش مصنوعی
        const contextData = relatedDocs.map(doc => doc.content).join("\n---\n");
        referenceText = relatedDocs.map(doc => doc.title).join(", ");
        const botTitle = BOT_TITLES[botType] || botType;

        // 🔥 پرامپت سخت‌گیرانه (Strict Prompt)
        const systemPrompt = `
        شما یک دستیار هوشمند متخصص در زمینه "${botTitle}" هستید.
        
        🔴 دستورالعمل بسیار مهم (Strict Rules):
        1. به سوال کاربر **فقط و فقط** با استفاده از متن‌های زیر ("CONTEXT") پاسخ بده.
        2. حق استفاده از دانش عمومی خودت را نداری. اگر جواب در متن زیر نیست، بگو "اطلاعات کافی در متن موجود نیست".
        3. پاسخ را کاملاً علمی، دقیق و به زبان فارسی بنویس.

        CONTEXT:
        ${contextData}
        `;

        // ارسال به OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            temperature: 0, // 🔥 دمای صفر: یعنی خلاقیت صفر (فقط واقعیت)
        });

        aiAnswer = completion.choices[0].message.content;
    }

    // --- گام سه: کسر اعتبار (فقط اگر از دیتابیس جواب داده باشد) ---
    if (shouldDeductToken) {
        if (useUserTokens) {
            user.tokens -= 1;
            await user.save();
        } else if (activeLicense) {
            activeLicense.tokens -= 1;
            await activeLicense.save();
        }
    }

    // --- گام چهار: ذخیره لاگ ---
    const newChat = new ChatLog({
        user: userId,
        botType: botType,
        question: message,
        answer: aiAnswer,
        reference: referenceText,
        licenseUsed: licenseCode || 'UserTokens',
        isFallbackResponse: relatedDocs.length === 0 // اگر داکیومنت نبود، یعنی فال‌بک
    });
    await newChat.save();

    // --- گام پنج: ارسال پاسخ به فرانت ---
    res.json({
        response: aiAnswer,
        remainingTokens: useUserTokens ? user.tokens : (activeLicense ? activeLicense.tokens : 0),
        isFallback: relatedDocs.length === 0
    });

  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ message: 'خطا در پردازش درخواست.' });
  }
};
