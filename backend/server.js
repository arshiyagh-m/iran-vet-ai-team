const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load Config
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: '*' })); // در پروداکشن دامنه فرانت‌اند خود را جایگزین * کنید

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Base Route
app.get('/', (req, res) => {
    res.send('Iran Veterinary AI Backend is Running...');
});

// Port Config for Liara
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

