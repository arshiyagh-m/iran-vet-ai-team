const mongoose = require('mongoose');

const knowledgeBaseSchema = new mongoose.Schema({
    // ... فیلدهای قبلی ...
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    topic: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [String],
    
    // فیلد جدید: نام فایل منبع
    sourceFile: { type: String, required: true }, 

    createdAt: { type: Date, default: Date.now }
});

knowledgeBaseSchema.index({ content: 'text', title: 'text', tags: 'text' });

module.exports = mongoose.model('KnowledgeBase', knowledgeBaseSchema);
