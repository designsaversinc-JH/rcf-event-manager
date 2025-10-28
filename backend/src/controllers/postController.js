const asyncHandler = require('../utils/asyncHandler');
const { buildResponse } = require('../utils/buildResponse');
const { uploadImageBuffer } = require('../utils/uploadImage');
const postModel = require('../models/postModel');

const parseCategories = (input) => {
  if (!input) {
    return [];
  }

  if (Array.isArray(input)) {
    return input.map((value) => Number(value)).filter((value) => Number.isInteger(value));
  }

  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) {
        return parsed.map((value) => Number(value)).filter((value) => Number.isInteger(value));
      }
    } catch (_error) {
      // Fall through to return empty array if parsing fails.
    }
  }

  return [];
};

const listPosts = asyncHandler(async (req, res) => {
  const { status, category, search, page, limit, featured } = req.query;

  const payload = await postModel.getPosts({
    status,
    categoryId: category ? Number(category) : undefined,
    search,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    featured:
      typeof featured === 'string' ? featured.toLowerCase() === 'true' : featured,
    includeDrafts: req.user?.role && req.user.role !== 'viewer',
  });

  return res.status(200).json(buildResponse(payload.posts, 'Posts fetched', {
    pagination: {
      total: payload.total,
      page: payload.page,
      limit: payload.limit,
      totalPages: payload.totalPages,
    },
  }));
});

const getPost = asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  const idCandidate = Number(identifier);

  let post = null;
  if (!Number.isNaN(idCandidate)) {
    post = await postModel.getPostById(idCandidate);
  }

  if (!post) {
    post = await postModel.getPostBySlug(identifier);
  }

  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  if (
    post.status !== 'published' &&
    (!req.user || (req.user.role !== 'admin' && req.user.role !== 'editor'))
  ) {
    return res.status(403).json({ message: 'You do not have access to this post' });
  }

  return res.status(200).json(buildResponse(post));
});

const createPost = asyncHandler(async (req, res) => {
  const {
    title,
    excerpt,
    content,
    status = 'draft',
    coverImageUrl: existingCoverUrl,
    publishedAt,
    categories,
    isFeatured = false,
  } = req.body;

  let coverImageUrl = existingCoverUrl || null;

  if (req.file) {
    coverImageUrl = await uploadImageBuffer(req.file.buffer, {
      folder: 'blog-management-app/posts',
    });
  }

  const categoryIds = parseCategories(categories);

  const post = await postModel.createPost({
    title,
    excerpt,
    content,
    coverImageUrl,
    status,
    publishedAt: publishedAt ? new Date(publishedAt) : null,
    authorId: req.user.id,
    categories: categoryIds,
    isFeatured,
  });

  return res.status(201).json(buildResponse(post, 'Post created successfully'));
});

const updatePost = asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  const {
    title,
    excerpt,
    content,
    status,
    coverImageUrl: providedCoverUrl,
    publishedAt,
    categories,
    isFeatured,
  } = req.body;

  const idCandidate = Number(identifier);

  let existingPost = null;
  if (!Number.isNaN(idCandidate)) {
    existingPost = await postModel.getPostById(idCandidate);
  } else {
    existingPost = await postModel.getPostBySlug(identifier);
  }

  if (!existingPost) {
    return res.status(404).json({ message: 'Post not found' });
  }

  if (req.user.role === 'author' && existingPost.authorId !== req.user.id) {
    return res.status(403).json({ message: 'You can only edit your own posts' });
  }

  let coverImageUrl = providedCoverUrl;

  if (req.file) {
    coverImageUrl = await uploadImageBuffer(req.file.buffer, {
      folder: 'blog-management-app/posts',
    });
  }

  const categoryIds = categories ? parseCategories(categories) : undefined;

  const updatedPost = await postModel.updatePost(existingPost.id, {
    title,
    excerpt,
    content,
    status,
    coverImageUrl,
    publishedAt: publishedAt ? new Date(publishedAt) : undefined,
    categories: categoryIds,
    isFeatured,
  });

  return res.status(200).json(buildResponse(updatedPost, 'Post updated successfully'));
});

const removePost = asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  const idCandidate = Number(identifier);

  let post = null;
  if (!Number.isNaN(idCandidate)) {
    post = await postModel.getPostById(idCandidate);
  } else {
    post = await postModel.getPostBySlug(identifier);
  }

  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  if (req.user.role === 'author' && post.authorId !== req.user.id) {
    return res.status(403).json({ message: 'You can only delete your own posts' });
  }

  await postModel.deletePost(post.id);

  return res.status(200).json(buildResponse({ id: post.id }, 'Post deleted successfully'));
});

module.exports = {
  listPosts,
  getPost,
  createPost,
  updatePost,
  removePost,
};
