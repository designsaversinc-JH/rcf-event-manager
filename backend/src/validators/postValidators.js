const { body, param, query } = require('express-validator');

const postIdentifierValidator = [
  param('identifier')
    .trim()
    .notEmpty()
    .withMessage('A post identifier (id or slug) is required'),
];

const listPostsValidator = [
  query('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be draft or published'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('featured').optional().isBoolean().toBoolean(),
];

const postBodyValidators = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('excerpt').optional().trim(),
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be draft or published'),
  body('categories')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Categories must be an array of category ids'),
  body('categories.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Each category id must be a positive integer'),
  body('coverImageUrl')
    .optional()
    .trim()
    .isURL({ require_protocol: true })
    .withMessage('Cover image must be a valid URL'),
  body('isFeatured').optional().isBoolean().toBoolean(),
  body('publishedAt')
    .optional()
    .isISO8601()
    .withMessage('Published date must be a valid ISO date'),
];

const createPostValidator = [...postBodyValidators];

const updatePostValidator = [
  ...postIdentifierValidator,
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('content').optional().trim().notEmpty().withMessage('Content cannot be empty'),
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be draft or published'),
  body('categories')
    .optional()
    .isArray()
    .withMessage('Categories must be an array of category ids'),
  body('categories.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Each category id must be a positive integer'),
  body('coverImageUrl')
    .optional()
    .trim()
    .isURL({ require_protocol: true })
    .withMessage('Cover image must be a valid URL'),
  body('isFeatured').optional().isBoolean().toBoolean(),
  body('publishedAt')
    .optional()
    .isISO8601()
    .withMessage('Published date must be a valid ISO date'),
];

module.exports = {
  listPostsValidator,
  createPostValidator,
  updatePostValidator,
  postIdentifierValidator,
};
