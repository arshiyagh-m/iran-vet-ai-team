const OpenAI = require('openai');
const ChatLog = require('../models/ChatLog');
const User = require('../models/User');
// فرض بر این است که این مدل‌ها را داری. اگر نداری بگو تا کدشان را بدهم.
const KnowledgeBase = require('../models/KnowledgeBase'); 
// const License = require('../models/License'); // اگر سیستم لایسنس داری آن‌کامنت کن

// تنظیمات OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // کلید را حتما در فایل .env بگذار
});

exports.chat = async (req, res) => {
  try {
    // ۱. دریافت اطلاعات از فرانت‌‌اند
    // botType: نوع ربات (bee, dog, ...)
    // message: سوال کاربر
    const { message, botType } = req.body;
    const userId = req.user.id; // از میدل‌ور auth می‌آید

    // ۲. بررسی اعتبار کاربر (توکن)
    const user = await User.findById(userId);
    if (!user || user.tokens < 1) {
      return res.status(403).json({ message: 'اعتبار توکن شما کافی نیست. لطفاً حساب خود را شارژ کنید.' });
    }

    // ۳. جستجو در دیتابیس دانش (RAG - Retrieval Augmented Generation)
    // اینجا دنبال اسنادی می‌گردیم که به سوال کاربر و نوع ربات مرتبط باشند
    let contextData = "";
    let references = [];
    
    // نکته: برای این کار باید روی فیلد content مدل KnowledgeBase ایندکس متنی (Text Index) ساخته باشی
    // یا می‌تونی از جستجوی ساده Regex استفاده کنی (برای شروع Regex ساده‌تره)
    const relatedDocs = await KnowledgeBase.find({
        category: botType, // فقط در دسته بندی مربوطه بگرد (مثلا فقط اسناد زنبور)
        $or: [
            { content: { $regex: message, $options: 'i' } }, // جستجو در متن
            { title: { $regex: message, $options: 'i' } }    // جستجو در عنوان
        ]
    }).limit(2); // فقط ۲ سند مرتبط‌ترین را بردار که توکن زیاد مصرف نشه

    if (relatedDocs.length > 0) {
        contextData = relatedDocs.map(doc => doc.content).join("\n\n---\n\n");
        references = relatedDocs.map(doc => doc.title || 'منبع داخلی');
    }

    // ۴. ساخت پرامپت سیستم (System Prompt)
    let systemPrompt = "";
    let isFallback = false;

    if (contextData) {
        // حالت اول: اطلاعات در دیتابیس ما هست
        systemPrompt = `
        شما یک دستیار هوشمند دامپزشکی تخصصی در زمینه "${botType}" هستید.
        من به شما اطلاعاتی از منابع معتبر خودم می‌دهم. وظیفه شما این است که **فقط و فقط** با استفاده از این اطلاعات به سوال کاربر پاسخ دهید.
        
        اطلاعات منبع:
        ${contextData}

        اگر پاسخ در اطلاعات بالا نبود، بگو "متاسفانه در منابع من اطلاعات کافی برای این سوال وجود ندارد".
        `;
    } else {
        // حالت دوم: اطلاعات در دیتابیس نیست (Fallback) -> استفاده از دانش عمومی هوش مصنوعی
        isFallback = true;
        systemPrompt = `
        شما یک متخصص دامپزشکی با تجربه و دلسوز هستید. تخصص شما: ${botType}.
        کاربر سوالی پرسیده که در دیتابیس اختصاصی ما موجود نیست.
        لطفاً با استفاده از دانش عمومی و علمی خودت پاسخ دهید.
        
        قوانین مهم:
        1. پاسخ باید کوتاه، کاربردی و دقیق باشد.
        2. اگر موضوع خطرناک است (مثل بیماری‌های کشنده)، حتما توصیه کن به دامپزشک مراجعه کنند.
        3. لحن شما باید رسمی و محترمانه باشد.
        `;
    }

    // ۵. ارسال به OpenAI
    const completion = await openai.chat.completions.create({
        model: "gpt-4o", // یا gpt-3.5-turbo (ارزان‌تر) یا gpt-4-turbo
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
        ],
        temperature: isFallback ? 0.7 : 0.2, // اگر از دیتابیس می‌خونی دقیق باش (0.2)، اگر از خودت میگی خلاق باش (0.7)
    });

    let aiAnswer = completion.choices[0].message.content;

    // ۶. اضافه کردن هشدار در حالت Fallback
    if (isFallback) {
        aiAnswer = `⚠️ **پاسخ عمومی هوش مصنوعی:**\n${aiAnswer}\n\n🔴 *توجه: این پاسخ بر اساس دیتابیس اختصاصی ما نیست. لطفاً برای موارد حساس با دامپزشک مشورت کنید.*`;
    }

    // ۷. کسر توکن از کاربر
    user.tokens -= 1; 
    await user.save();

    // ۸. ذخیره در لاگ چت
    const newChat = new ChatLog({
        user: userId,
        botType: botType,
        question: message,
        answer: aiAnswer,
        reference: references.join(', '), // لیست منابع استفاده شده
        isFallbackResponse: isFallback
    });
    await newChat.save();

    // ۹. ارسال پاسخ به فرانت‌‌اند
    res.json({
        response: aiAnswer,
        remainingTokens: user.tokens,
        isFallback: isFallback
    });

  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ message: 'خطا در برقراری ارتباط با سرویس هوش مصنوعی.' });
  }
};

