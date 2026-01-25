const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ثبت نام
router.post('/register', async (req, res) => {
    const { fullName, phone, password } = req.body;
    try {
        const userExists = await User.findOne({ phone });
        if (userExists) return res.status(400).json({ message: 'این شماره قبلا ثبت شده است' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({ fullName, phone, password: hashedPassword });
        
        // Generate Token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.status(201).json({ 
            _id: user._id, 
            fullName: user.fullName, 
            phone: user.phone, 
            role: user.role, 
            token 
        });
    } catch (error) {
        res.status(500).json({ message: 'خطای سرور' });
    }
});

// ورود
router.post('/login', async (req, res) => {
    const { phone, password } = req.body;
    try {
        const user = await User.findOne({ phone });
        if (user && (await bcrypt.compare(password, user.password))) {
            if(user.isBanned) return res.status(403).json({ message: 'حساب شما مسدود شده است' });

            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
            res.json({ 
                _id: user._id, 
                fullName: user.fullName, 
                role: user.role, 
                token 
            });
        } else {
            res.status(401).json({ message: 'شماره یا رمز عبور اشتباه است' });
        }
    } catch (error) {
        res.status(500).json({ message: 'خطای سرور' });
    }
});

module.exports = router;

