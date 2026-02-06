const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protectAdmin = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      if (req.user && req.user.role === 'admin') {
        next(); // اجازه عبور
      } else {
        res.status(403).json({ message: 'دسترسی غیرمجاز! فقط مدیران دسترسی دارند.' });
      }
    } catch (error) {
      res.status(401).json({ message: 'توکن نامعتبر است.' });
    }
  } else {
    res.status(401).json({ message: 'توکن یافت نشد.' });
  }
};

module.exports = { protectAdmin };

