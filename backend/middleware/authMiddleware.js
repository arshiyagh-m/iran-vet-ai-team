const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'توکن نامعتبر است، لطفا دوباره وارد شوید.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'دسترسی غیرمجاز، توکن یافت نشد.' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'دسترسی محدود به مدیران سیستم است.' });
  }
};

module.exports = { protect, admin };
