const OpenAI = require('openai');
const mongoose = require('mongoose');

// دریافت مدل‌ها از Mongoose (چون در server.js تعریف شده‌اند)
const ChatLog = mongoose.model('ChatLog');
const ChatSession = mongoose.model('ChatSession');
const User = mongoose.model('User');
const KnowledgeBase = mongoose.model('KnowledgeBase');
const License = mongoose.model('License');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// عناوین ربات‌ها برای پرامپت سیستم
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
    let { message, botType, licenseCode, sessionId } = req.body;
    const user = req.user; // از میدل‌ور authenticateToken می‌آید

    // ============================================================
    // 1️⃣ مدیریت نشست گفتگو (Session Management)
    // ============================================================
    let currentSession;
    if (sessionId) {
        currentSession = await ChatSession.findById(sessionId);
        // بررسی مالکیت سشن
        if (!currentSession || currentSession.user.toString() !== user._id.toString()) {
            return res.status(404).json({ message: 'نشست گفتگو یافت نشد یا دسترسی ندارید.' });
        }
    } else {
        // ایجاد سشن جدید با عنوان هوشمند (۶ کلمه اول پیام)
        const generatedTitle = message.split(' ').slice(0, 6).join(' ') + '...';
        currentSession = await ChatSession.create({
            user: user._id,
            botType: botType,
            title: generatedTitle
        });
        sessionId = currentSession._id;
    }

    // ============================================================
    // 2️⃣ پاسخ سریع به احوالپرسی (Cost Optimization)
    // ============================================================
    const greetings = ['سلام', 'درود', 'خسته نباشید', 'چطوری', 'خوبی', 'صبح بخیر', 'شب بخیر', 'hi', 'hello'];
    // شرط: شروع با سلام باشد و طول پیام کوتاه باشد
    const isGreeting = greetings.some(g => message.trim().toLowerCase().startsWith(g)) && message.length < 30;

    if (isGreeting) {
        const botName = BOT_TITLES[botType] || 'دامپزشکی';
        return res.json({ 
            response: `سلام! من دستیار هوشمند ${botName} هستم. لطفاً مشکل یا سوال خود را بفرمایید.`, 
            remainingTokens: user.tokens, 
            sessionId: currentSession._id,
            title: currentSession.title,
            isFallback: false 
        });
    }

    // ============================================================
    // 3️⃣ بررسی اعتبار (Token / License)
    // ============================================================
    let activeLicense = null;
    let useUserTokens = false;

    if (licenseCode) {
        activeLicense = await License.findOne({ code: licenseCode, isActive: true });
        if (!activeLicense || activeLicense.tokens < 1) {
            return res.status(400).json({ message: 'لایسنس نامعتبر یا فاقد اعتبار است.' });
        }
    } else {
        if (user.tokens < 1) {
            return res.status(403).json({ message: 'اعتبار توکن حساب شما تمام شده است.' });
        }
        useUserTokens = true;
    }

    // ============================================================
    // 4️⃣ دریافت تاریخچه گفتگو (Memory)
    // ============================================================
    // فقط پیام‌های مربوط به همین Session را می‌گیریم
    const historyLogs = await ChatLog.find({ session: sessionId })
        .sort({ timestamp: -1 })
        .limit(6); // ۶ پیام آخر (۳ رفت و برگشت)

    const historyMessages = historyLogs.reverse().flatMap(log => [
        { role: "user", content: log.question },
        { role: "assistant", content: log.answer }
    ]);

    // ============================================================
    // 5️⃣ جستجوی هوشمند (RAG - Keyword Extraction)
    // ============================================================
    const botTitle = BOT_TITLES[botType] || botType;
    
    // از مدل ارزان برای استخراج کلمات کلیدی استفاده می‌کنیم
    const searchPrompt = `
        Context: Veterinary query about "${botTitle}".
        User Query: "${message}"
        Task: Extract technical keywords, diseases, symptoms, and synonyms.
        Output: Only space-separated keywords. No text.
    `;

    const keywordExtraction = await openai.chat.completions.create({
        model: "gpt-4o-mini", // مدل سریع و ارزان
        messages: [
            { role: "system", content: "You are a keyword extractor API." }, 
            { role: "user", content: searchPrompt }
        ],
        temperature: 0.3,
    });

    const smartKeywords = keywordExtraction.choices[0].message.content.split(/\s+/);

    // جستجوی ترکیبی در دیتابیس
    let searchCondition = {
        category: botType,
        $or: [
            { content: { $regex: message, $options: 'i' } }, // عین جمله کاربر
            ...smartKeywords.map(word => ({ content: { $regex: word, $options: 'i' } })) // کلمات هوشمند
        ]
    };

    const relatedDocs = await KnowledgeBase.find(searchCondition).limit(4);

    // ============================================================
    // 6️⃣ تولید پاسخ نهایی (Decision Making)
    // ============================================================
    let aiAnswer = "";
    let referenceText = "";
    let isFallback = false;
    let shouldDeductToken = true; 

    // آیا کاربر دارد در مورد موضوع قبلی صحبت می‌کند؟ (Follow-up Check)
    const isFollowUp = historyMessages.length > 0 && relatedDocs.length === 0;

    if (relatedDocs.length === 0 && !isFollowUp) {
        // 🔴 حالت Fallback: دیتابیس خالی است و سوال جدید است
        isFallback = true;
        referenceText = "دانش عمومی (General Knowledge)"; 
        
        const systemPrompt = `You are a helpful veterinary AI assistant. Answer the user's question about ${botTitle} using your general knowledge. Respond in Persian.`;
        
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: systemPrompt }, ...historyMessages, { role: "user", content: message }],
            temperature: 0.7 
        });
        
        aiAnswer = response.choices[0].message.content;
        
        // ⚠️ اضافه کردن متن سلب مسئولیت
        aiAnswer += "\n\n⚠️ **توجه:** این پاسخ بر اساس دانش عمومی هوش مصنوعی است و هنوز توسط دیتابیس تخصصی ما تأیید نشده است. لطفاً با دامپزشک مشورت کنید.";

    } else {
        // 🟢 حالت Normal: پاسخ از دیتابیس یا حافظه
        isFallback = false;
        
        const titles = relatedDocs.map(doc => doc.title);
        referenceText = titles.length > 0 ? titles.join(" | ") : "حافظه گفتگو";

        const contextData = relatedDocs.map(doc => doc.content).join("\n---\n");
        
        // پرامپت تخصصی دامپزشکی [attachment_0](attachment)
        const systemPrompt = `
            شما یک "دامپزشک متخصص" در زمینه "${botTitle}" هستید.
            
            اطلاعات علمی معتبر (CONTEXT):
            ${contextData ? contextData : "استفاده از حافظه گفتگو"}

            دستورالعمل‌ها:
            1. فقط و فقط از اطلاعات CONTEXT و حافظه (History) استفاده کن.
            2. اگر کاربر سوال کوتاه پرسید (مثل "بله")، آن را با توجه به سوال قبلی خودت تحلیل کن.
            3. پاسخ باید دلسوزانه، علمی و به زبان فارسی باشد.
            4. اگر بیماری تشخیص داده شد، راه درمان موجود در CONTEXT را بگو.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                ...historyMessages,
                { role: "user", content: message }
            ],
            temperature: 0.4, 
        });

        aiAnswer = response.choices[0].message.content;
    }

    // ============================================================
    // 7️⃣ کسر اعتبار و ذخیره لاگ
    // ============================================================
    if (shouldDeductToken) {
        if (useUserTokens) {
            user.tokens -= 1;
            await user.save();
        } else if (activeLicense) {
            activeLicense.tokens -= 1;
            await activeLicense.save();
        }
    }

    // ذخیره در دیتابیس
    const newLog = await ChatLog.create({
        user: user._id,
        session: sessionId,
        botType: botType,
        question: message,
        answer: aiAnswer,
        reference: referenceText,
        licenseUsed: licenseCode || 'UserTokens',
        isFallbackResponse: isFallback
    });

    // ارسال پاسخ به کلاینت
    res.json({
        response: aiAnswer,
        remainingTokens: useUserTokens ? user.tokens : (activeLicense ? activeLicense.tokens : 0),
        sessionId: sessionId,
        title: currentSession.title,
        messageId: newLog._id, // برای لایک و دیس‌لایک فرانت لازم است
        isFallback: isFallback
    });

  } catch (error) {
    console.error("Chat Controller Error:", error);
    res.status(500).json({ message: 'خطا در پردازش هوش مصنوعی.' });
  }
};
