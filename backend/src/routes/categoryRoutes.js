const express = require('express');
const categoryController = require('../controllers/categoryController');
const validateRequest = require('../middleware/validateRequest');
const { authenticate, requireRole } = require('../middleware/auth');
const {
  createCategoryValidator,
  updateCategoryValidator,
  categoryIdValidator,
} = require('../validators/categoryValidators');

const router = express.Router();

router.get('/', categoryController.listCategories);

router.post(
  '/',
  authenticate,
  requireRole('admin', 'editor'),
  createCategoryValidator,
  validateRequest,
  categoryController.createCategory
);

router.put(
  '/:id',
  authenticate,
  requireRole('admin', 'editor'),
  updateCategoryValidator,
  validateRequest,
  categoryController.updateCategory
);

router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  categoryIdValidator,
  validateRequest,
  categoryController.deleteCategory
);

module.exports = router;
