const asyncHandler = require('../utils/asyncHandler');
const { buildResponse } = require('../utils/buildResponse');
const categoryModel = require('../models/categoryModel');

const listCategories = asyncHandler(async (_req, res) => {
  const categories = await categoryModel.getCategories();
  return res.status(200).json(buildResponse(categories, 'Categories fetched'));
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, description } = req.body;
  const category = await categoryModel.createCategory({ name, slug, description });
  return res
    .status(201)
    .json(buildResponse(category, 'Category created successfully'));
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await categoryModel.updateCategory(Number(id), req.body);

  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }

  return res
    .status(200)
    .json(buildResponse(category, 'Category updated successfully'));
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await categoryModel.deleteCategory(Number(id));

  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }

  return res
    .status(200)
    .json(buildResponse(category, 'Category deleted successfully'));
});

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
