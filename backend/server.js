const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const importData = require('./seeder'); // <--- اضافه شد

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({ origin: '*' }));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(async () => { // <--- async اضافه شد
        console.log('MongoDB Connected Successfully');
        
        // اجرای اسکریپت آپدیت دیتابیس از روی فایل‌های اکسل
        // هر بار که سرور ریستارت شود (یا دیپلوی جدید شود)، دیتابیس آپدیت می‌شود
        await importData(); 
    })
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes')); // روت آپلود اکسل را از اینجا پاک کنید یا غیرفعال کنید
app.use('/api/chat', require('./routes/chatRoutes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
