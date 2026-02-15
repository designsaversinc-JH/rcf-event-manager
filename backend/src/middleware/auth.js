const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const requireJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    const error = new Error('JWT_SECRET is not configured.');
    error.status = 500;
    throw error;
  }
};

const authenticate = async (req, res, next) => {
  try {
    requireJwtSecret();
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication token is required.' });
    }

    const token = authHeader.slice(7).trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { rows } = await query(
      'SELECT id, email, name, role, is_active FROM admin_users WHERE id = $1 LIMIT 1',
      [decoded.id]
    );

    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: 'User account not found.' });
    }

    if (user.is_active === false) {
      return res.status(403).json({ message: 'Your account has been disabled.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }

  return next();
};

module.exports = {
  authenticate,
  requireAdmin,
  requireJwtSecret,
};
