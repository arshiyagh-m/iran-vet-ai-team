const mongoose = require('mongoose');

const knowledgeBaseSchema = new mongoose.Schema({
    category: { type: String, required: true }, // مثال: Poultry
    subCategory: { type: String, required: true }, // مثال: Industrial
    topic: { type: String, required: true }, // مثال: Diseases
    title: { type: String, required: true },
    content: { type: String, required: true }, // متن علمی، فرمول یا روش درمان
    tags: [String], // کلمات کلیدی برای جستجو
    createdAt: { type: Date, default: Date.now }
});

// این خط باعث می‌شود بتوانیم در متن‌ها جستجو کنیم
knowledgeBaseSchema.index({ content: 'text', title: 'text', tags: 'text' });

module.exports = mongoose.model('KnowledgeBase', knowledgeBaseSchema);

