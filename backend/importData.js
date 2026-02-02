const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const crypto = require('crypto');
const KnowledgeBase = require('./models/KnowledgeBase');
const FileMeta = require('./models/FileMeta');

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
        
        // اگر پوشه data نبود، بسازش که ارور نده
        if (!fs.existsSync(dataDir)) {
            console.log('⚠️ Data directory not found. Creating one...');
            fs.mkdirSync(dataDir);
            return;
        }

        const files = fs.readdirSync(dataDir);
        
        for (const file of files) {
            if (file.endsWith('.xlsx') || file.endsWith('.xls')) {
                const filePath = path.join(dataDir, file);
                const currentHash = getFileHash(filePath);
                const fileMeta = await FileMeta.findOne({ filename: file });

                if (fileMeta && fileMeta.hash === currentHash) {
                    console.log(`✅ ${file} is up-to-date. Skipping...`);
                    continue;
                }

                console.log(`🔄 Detecting changes in ${file}. Updating database...`);
                const workbook = xlsx.readFile(filePath);
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const rawData = xlsx.utils.sheet_to_json(sheet);

                if (rawData.length > 0) {
                    const knowledgeEntries = rawData.map(row => ({
                        category: row.Category || 'General',
                        subCategory: row.SubCategory || 'General',
                        topic: row.Topic || 'General',
                        title: row.Title || 'Untitled',
                        content: row.Content || '',
                        tags: row.Tags ? row.Tags.split(',') : [],
                        sourceFile: file 
                    }));

                    await KnowledgeBase.deleteMany({ sourceFile: file });
                    await KnowledgeBase.insertMany(knowledgeEntries);

                    await FileMeta.findOneAndUpdate(
                        { filename: file },
                        { hash: currentHash, lastUpdated: new Date() },
                        { upsert: true, new: true }
                    );
                    console.log(`🎉 Updated records from ${file}`);
                }
            }
        }
        console.log('🏁 Knowledge Base Sync Complete.');
    } catch (error) {
        console.error('❌ Error during Smart Sync:', error);
    }
};

module.exports = importData;
