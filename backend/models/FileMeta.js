const mongoose = require('mongoose');

const fileMetaSchema = new mongoose.Schema({
    filename: { type: String, required: true, unique: true },
    hash: { type: String, required: true }, // اثر انگشت فایل
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FileMeta', fileMetaSchema);

