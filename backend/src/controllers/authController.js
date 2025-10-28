const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const { buildResponse } = require('../utils/buildResponse');
const userModel = require('../models/userModel');
const { ensureJwtSecret } = require('../middleware/auth');

const buildTokenPayload = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role,
});

const createToken = (user) => {
  ensureJwtSecret();
  return jwt.sign(buildTokenPayload(user), process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
};

const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  const existing = await userModel.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ message: 'Email is already registered' });
  }

  const userCount = await userModel.countUsers();
  const assignedRole = userCount === 0 ? 'admin' : role || 'viewer';

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await userModel.createUser({
    firstName,
    lastName,
    email,
    passwordHash,
    role: assignedRole,
  });

  const token = createToken(user);

  return res
    .status(201)
    .json(buildResponse({ user, token }, 'Account created successfully'));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const authDetails = await userModel.getPasswordHashForUser(email);

  if (!authDetails) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const { user, passwordHash } = authDetails;

  if (!user.isActive) {
    return res.status(403).json({ message: 'User account is disabled' });
  }

  const passwordMatches = await bcrypt.compare(password, passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = createToken(user);

  return res
    .status(200)
    .json(buildResponse({ user, token }, 'Authentication successful'));
});

const me = asyncHandler(async (req, res) => {
  const user = await userModel.getUserById(req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.status(200).json(buildResponse({ user }));
});

module.exports = {
  register,
  login,
  me,
};
