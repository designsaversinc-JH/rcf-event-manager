const { body, param } = require('express-validator');

const createUserValidator = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('role')
    .optional()
    .isIn(['admin', 'editor', 'author', 'viewer'])
    .withMessage('Role must be one of admin, editor, author, or viewer'),
];

const updateUserRoleValidator = [
  param('id').isInt({ min: 1 }).withMessage('User id must be numeric'),
  body('role')
    .isIn(['admin', 'editor', 'author', 'viewer'])
    .withMessage('Role must be one of admin, editor, author, or viewer'),
];

const updateUserStatusValidator = [
  param('id').isInt({ min: 1 }).withMessage('User id must be numeric'),
  body('isActive').isBoolean().withMessage('isActive flag must be boolean'),
];

const userIdParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('User id must be numeric'),
];

module.exports = {
  createUserValidator,
  updateUserRoleValidator,
  updateUserStatusValidator,
  userIdParamValidator,
};
