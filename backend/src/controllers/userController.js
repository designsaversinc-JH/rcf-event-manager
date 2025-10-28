const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');
const { buildResponse } = require('../utils/buildResponse');
const userModel = require('../models/userModel');

const listUsers = asyncHandler(async (_req, res) => {
  const users = await userModel.getUsers();
  return res.status(200).json(buildResponse(users, 'Users fetched'));
});

const createUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role = 'viewer' } = req.body;

  const existing = await userModel.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ message: 'Email is already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await userModel.createUser({
    firstName,
    lastName,
    email,
    passwordHash,
    role,
  });

  return res.status(201).json(buildResponse(user, 'User created successfully'));
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const updatedUser = await userModel.updateUserRole(Number(id), role);

  if (!updatedUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res
    .status(200)
    .json(buildResponse(updatedUser, 'User role updated successfully'));
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const updatedUser = await userModel.updateUserStatus(Number(id), isActive);

  if (!updatedUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res
    .status(200)
    .json(buildResponse(updatedUser, 'User status updated successfully'));
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const removedUser = await userModel.deleteUser(Number(id));

  if (!removedUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res
    .status(200)
    .json(buildResponse(removedUser, 'User deleted successfully'));
});

module.exports = {
  listUsers,
  createUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
};
