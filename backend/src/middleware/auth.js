const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const ensureJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined. Unable to generate or verify tokens.');
  }
};

const authenticate = async (req, res, next) => {
  try {
    ensureJwtSecret();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  const token = authHeader.replace('Bearer ', '').trim();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.getUserById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User is no longer active' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const requireRole =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have access to this resource' });
    }

    return next();
  };

const requireAdmin = requireRole('admin');

const authenticateOptional = async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  try {
    ensureJwtSecret();
    const token = authHeader.replace('Bearer ', '').trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.getUserById(decoded.id);

    if (user && user.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
      };
    }
  } catch (error) {
    // Ignore errors for optional auth to keep the request public.
  }

  return next();
};

module.exports = {
  authenticate,
  authenticateOptional,
  requireRole,
  requireAdmin,
  ensureJwtSecret,
};
