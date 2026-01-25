const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const crypto = require('crypto'); // برای ساخت Hash
const KnowledgeBase = require('./models/KnowledgeBase');
const FileMeta = require('./models/FileMeta');

// تابع کمکی برای تولید هش فایل
const getFileHash = (filePath) => {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('md5');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
};

const importData = async () => {
    try {
        console.log('🛡️ Checking Knowledge Base Integrity...');

        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) return;

        const files = fs.readdirSync(dataDir);
        
        for (const file of files) {
            if (file.endsWith('.xlsx') || file.endsWith('.xls')) {
                const filePath = path.join(dataDir, file);
                
                // ۱. محاسبه هش فایل فعلی
                const currentHash = getFileHash(filePath);

                // ۲. بررسی دیتابیس: آیا قبلا این فایل با همین محتوا ایمپورت شده؟
                const fileMeta = await FileMeta.findOne({ filename: file });

                if (fileMeta && fileMeta.hash === currentHash) {
                    console.log(`✅ ${file} is up-to-date. Skipping...`);
                    continue; // پرش به فایل بعدی (صرفه جویی در زمان و هزینه)
                }

                // ۳. اگر فایل جدید است یا تغییر کرده:
                console.log(`🔄 Detecting changes in ${file}. Updating database...`);

                // خواندن اکسل
                const workbook = xlsx.readFile(filePath);
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const rawData = xlsx.utils.sheet_to_json(sheet);

                if (rawData.length > 0) {
                    // الف: پاک کردن داده‌های قدیمیِ مربوط به "همین دسته بندی"
                    // نکته مهم: ما کل دیتابیس را پاک نمی‌کنیم، بلکه فقط دیتای مربوط به این فایل را آپدیت می‌کنیم
                    // برای این کار فرض می‌کنیم ستون Category در تمام ردیف‌های فایل یکسان است یا از نام فایل استفاده می‌کنیم
                    // اما روش ساده‌تر برای الان: پاک کردن بر اساس تگ یا سورس (که باید اضافه شه)
                    // برای سادگی فعلی: اگر تغییر دیدیم، کل دیتابیس را رفرش می‌کنیم (یا منطق پیچیده تر)
                    
                    // روش بهینه: حذف داده‌هایی که قبلاً از این فایل آمده بودند (نیاز به فیلد sourceFile در مدل KnowledgeBase دارد)
                    // اما چون می‌خواهید ساده باشد، بیایید این فایل را پردازش کنیم:
                    
                    const knowledgeEntries = rawData.map(row => ({
                        category: row.Category || 'General',
                        subCategory: row.SubCategory || 'General',
                        topic: row.Topic || 'General',
                        title: row.Title || 'Untitled',
                        content: row.Content || '',
                        tags: row.Tags ? row.Tags.split(',') : [],
                        sourceFile: file // <--- این فیلد را برای مدیریت بهتر اضافه می‌کنیم
                    }));

                    // حذف رکوردهای قبلی که از این فایل آمده بودند
                    await KnowledgeBase.deleteMany({ sourceFile: file });
                    
                    // درج رکوردهای جدید
                    await KnowledgeBase.insertMany(knowledgeEntries);

                    // آپدیت متا دیتا (Hash جدید)
                    await FileMeta.findOneAndUpdate(
                        { filename: file },
                        { hash: currentHash, lastUpdated: new Date() },
                        { upsert: true, new: true }
                    );

                    console.log(`🎉 Updated ${knowledgeEntries.length} records from ${file}`);
                }
            }
        }
        console.log('🏁 Knowledge Base Sync Complete.');

    } catch (error) {
        console.error('❌ Error during Smart Sync:', error);
    }
};

module.exports = importData;
