const express = require('express');
const postController = require('../controllers/postController');
const upload = require('../middleware/upload');
const validateRequest = require('../middleware/validateRequest');
const { authenticate, authenticateOptional, requireRole } = require('../middleware/auth');
const {
  listPostsValidator,
  createPostValidator,
  updatePostValidator,
  postIdentifierValidator,
} = require('../validators/postValidators');

const router = express.Router();

router.get(
  '/',
  authenticateOptional,
  listPostsValidator,
  validateRequest,
  postController.listPosts
);
router.get(
  '/:identifier',
  authenticateOptional,
  postIdentifierValidator,
  validateRequest,
  postController.getPost
);

router.post(
  '/',
  authenticate,
  requireRole('admin', 'editor', 'author'),
  upload.single('coverImage'),
  createPostValidator,
  validateRequest,
  postController.createPost
);

router.put(
  '/:identifier',
  authenticate,
  requireRole('admin', 'editor', 'author'),
  upload.single('coverImage'),
  updatePostValidator,
  validateRequest,
  postController.updatePost
);

router.delete(
  '/:identifier',
  authenticate,
  requireRole('admin', 'editor', 'author'),
  postController.removePost
);

module.exports = router;
