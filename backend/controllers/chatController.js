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

    // --- گام صفر: پاسخ به سلام (بدون هزینه) ---
    const greetings = ['سلام', 'درود', 'خسته نباشید', 'چطوری', 'خوبی', 'صبح بخیر', 'شب بخیر', 'hi', 'hello'];
    const isGreeting = greetings.some(g => message.trim().toLowerCase().startsWith(g)) && message.length < 30;

    if (isGreeting) {
        const botName = BOT_TITLES[botType] || 'دامپزشکی';
        return res.json({ 
            response: `سلام! من دستیار هوشمند و تخصصی ${botName} هستم. لطفاً علائم و مشکل حیوان را توضیح دهید تا بررسی کنم.`, 
            remainingTokens: user.tokens, 
            isFallback: false 
        });
    }

    // --- گام یک: بررسی اعتبار (لایسنس یا توکن) ---
    let activeLicense = null;
    let useUserTokens = false;

    if (licenseCode) {
        activeLicense = await License.findOne({ code: licenseCode, isActive: true });
        if (!activeLicense || activeLicense.tokens < 1) {
            return res.status(400).json({ message: 'لایسنس نامعتبر یا فاقد اعتبار است.' });
        }
    } else {
        if (user.tokens < 1) {
            return res.status(403).json({ message: 'اعتبار توکن حساب شما تمام شده است. لطفاً حساب خود را شارژ کنید.' });
        }
        useUserTokens = true;
    }

    // --- گام دو: دریافت حافظه ۵ پیام آخر (Memory) 🔥 ---
    const historyLogs = await ChatLog.find({ user: userId, botType })
        .sort({ timestamp: -1 }) // جدیدترین‌ها اول
        .limit(5); // ۵ تعامل آخر
    
    // تبدیل به فرمت OpenAI (از قدیمی به جدید)
    const historyMessages = historyLogs.reverse().flatMap(log => [
        { role: "user", content: log.question },
        { role: "assistant", content: log.answer }
    ]);

    // --- گام سه: جستجو در دیتابیس (Keywords) 🔥 ---
    const stopWords = ['اقا', 'آقا', 'من', 'تو', 'ما', 'شما', 'است', 'که', 'در', 'با', 'از', 'به', 'را', 'این', 'آن', 'زنبور', 'عسل', 'دارم', 'داره', 'هست', 'اره', 'آره', 'بله', 'خیر', 'نه', 'ندارم', 'ولی']; 
    const cleanMessage = message.replace(/[،؛:!?.()]/g, ''); 
    const words = cleanMessage.split(/\s+/).filter(w => w.length > 2 && !stopWords.includes(w));

    let searchCondition = {};
    if (words.length > 0) {
        searchCondition = {
            category: botType,
            $or: words.map(word => ({ content: { $regex: word, $options: 'i' } }))
        };
    } else {
        searchCondition = { category: botType, content: { $regex: message, $options: 'i' } };
    }

    const relatedDocs = await KnowledgeBase.find(searchCondition).limit(3);

    let aiAnswer = "";
    let referenceText = "";
    let shouldDeductToken = false; 

    // --- گام چهار: تصمیم‌گیری هوشمند ---
    // اگر دیتابیس خالی است اما تاریخچه داریم (Follow-up)، نباید قطع کنیم
    const isFollowUp = historyMessages.length > 0 && relatedDocs.length === 0;

    if (relatedDocs.length === 0 && !isFollowUp) {
        // حالت ۱: اطلاعاتی نیست و بحث جدید است
        aiAnswer = "متاسفانه با این کلمات، اطلاعاتی در پایگاه دانش تخصصی یافت نشد. لطفاً علائم را کامل‌تر توضیح دهید.";
        referenceText = "بدون منبع";
        shouldDeductToken = false; // توکن کسر نمی‌شود
    } else {
        // حالت ۲: اطلاعات داریم یا داریم از حافظه استفاده می‌کنیم
        shouldDeductToken = true;
        
        const contextData = relatedDocs.map(doc => doc.content).join("\n---\n");
        referenceText = relatedDocs.length > 0 ? relatedDocs.map(doc => doc.title).join(", ") : "حافظه گفتگو";
        const botTitle = BOT_TITLES[botType] || botType;

        // 🔥 پرامپت دکتر هوشمند با حافظه
        const systemPrompt = `
            شما یک "دامپزشک متخصص" و هوشمند در زمینه "${botTitle}" هستید.
            
            منابع دانش جدید (CONTEXT):
            ${contextData ? contextData : "اطلاعات جدیدی یافت نشد، فقط به حافظه گفتگو (History) مراجعه کن."}

            دستورالعمل حیاتی (Diagnosis Protocol):
            1. شما به ۵ پیام آخر گفتگو دسترسی دارید.
            2. اگر کاربر پاسخی کوتاه داد (مثل "بله"، "خیر"، "همینطوره")، آن را در کنار سوال قبلی خودت در History تحلیل کن.
            3. تشخیص بیماری:
               - اگر با ترکیب پاسخ جدید کاربر و اطلاعات قبلی، بیماری قطعی شد -> درمان را کامل توضیح بده.
               - اگر هنوز شک داری -> سوال بعدی را بپرس تا علائم شفاف شود.
            
            4. فقط از اطلاعات CONTEXT و History استفاده کن. دانش عمومی ممنوع.
            5. لحن: دلسوزانه و علمی.
        `;

        // ارسال به OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                ...historyMessages, // تزریق حافظه
                { role: "user", content: message } // پیام جدید
            ],
            temperature: 0.3, 
        });

        aiAnswer = completion.choices[0].message.content;
    }

    // --- گام پنج: کسر اعتبار ---
    if (shouldDeductToken) {
        if (useUserTokens) {
            user.tokens -= 1;
            await user.save();
        } else if (activeLicense) {
            activeLicense.tokens -= 1;
            await activeLicense.save();
        }
    }

    // --- گام شش: ذخیره لاگ ---
    await ChatLog.create({
        user: userId,
        botType: botType,
        question: message,
        answer: aiAnswer,
        reference: referenceText,
        licenseUsed: licenseCode || 'UserTokens',
        isFallbackResponse: relatedDocs.length === 0 && !isFollowUp
    });

    // --- گام هفت: پاسخ به کلاینت ---
    res.json({
        response: aiAnswer,
        remainingTokens: useUserTokens ? user.tokens : (activeLicense ? activeLicense.tokens : 0),
        isFallback: relatedDocs.length === 0 && !isFollowUp
    });

  } catch (error) {
    console.error("Chat Controller Error:", error);
    res.status(500).json({ message: 'خطا در پردازش درخواست.' });
  }
};
