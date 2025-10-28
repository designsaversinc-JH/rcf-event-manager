const express = require('express');
const userController = require('../controllers/userController');
const validateRequest = require('../middleware/validateRequest');
const { authenticate, requireRole } = require('../middleware/auth');
const {
  createUserValidator,
  updateUserRoleValidator,
  updateUserStatusValidator,
  userIdParamValidator,
} = require('../validators/userValidators');

const router = express.Router();

router.use(authenticate, requireRole('admin'));

router.get('/', userController.listUsers);

router.post('/', createUserValidator, validateRequest, userController.createUser);

router.patch(
  '/:id/role',
  updateUserRoleValidator,
  validateRequest,
  userController.updateUserRole
);

router.patch(
  '/:id/status',
  updateUserStatusValidator,
  validateRequest,
  userController.updateUserStatus
);

router.delete(
  '/:id',
  userIdParamValidator,
  validateRequest,
  userController.deleteUser
);

module.exports = router;
