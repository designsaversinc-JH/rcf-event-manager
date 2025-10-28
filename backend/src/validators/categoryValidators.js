const { body, param } = require('express-validator');

const createCategoryValidator = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('slug')
    .optional()
    .trim()
    .isSlug()
    .withMessage('Slug must only contain letters, numbers, dashes, or underscores'),
  body('description').optional().trim(),
];

const updateCategoryValidator = [
  param('id').isInt({ min: 1 }).withMessage('Category id must be numeric'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('slug')
    .optional()
    .trim()
    .isSlug()
    .withMessage('Slug must only contain letters, numbers, dashes, or underscores'),
  body('description').optional().trim(),
];

const categoryIdValidator = [
  param('id').isInt({ min: 1 }).withMessage('Category id must be numeric'),
];

module.exports = {
  createCategoryValidator,
  updateCategoryValidator,
  categoryIdValidator,
};
