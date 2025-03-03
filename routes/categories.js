const express = require('express');
const router = express.Router();
const { Category } = require('../models/Category');
const Product = require('../models/Product');

// @route   GET api/categories
// @desc    Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    
    res.json({ status: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ status: false, error: 'Server error' });
  }
});

// @route   POST api/categories
// @desc    Create a new category
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ status: false, error: 'Category name is required' });
    }
    
    // Check if a category with this name already exists
    let category = await Category.findOne({ name: name.trim() });
    
    if (category) {
      return res.status(400).json({ status: false, error: 'Category already exists' });
    }
    
    // Get highest order value
    const highestOrder = await Category.findOne().sort({ order: -1 }).select('order');
    const order = highestOrder ? highestOrder.order + 1 : 1;
    
    // Create new category
    category = new Category({
      name: name.trim(),
      order,
    });
    
    await category.save();
    
    res.status(201).json({ status: true, data: category });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ status: false, error: 'Server error' });
  }
});

// @route   PATCH api/categories/:id
// @desc    Update a category
router.patch('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ status: false, error: 'Category name is required' });
    }
    
    // Check if the category exists
    let category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ status: false, error: 'Category not found' });
    }
    
    // Don't allow updating the default "Uncategorized" category name
    if (category.name === 'Uncategorized') {
      return res.status(400).json({ status: false, error: 'Cannot update the default Uncategorized category' });
    }
    
    // Check if another category with this name already exists
    const existingCategory = await Category.findOne({ name: name.trim(), _id: { $ne: req.params.id } });
    
    if (existingCategory) {
      return res.status(400).json({ status: false, error: 'Another category with this name already exists' });
    }
    
    // Update category name
    category.name = name.trim();
    await category.save();
    
    res.json({ status: true, data: category });
  } catch (error) {
    console.error('Error updating category:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ status: false, error: 'Category not found' });
    }
    
    res.status(500).json({ status: false, error: 'Server error' });
  }
});

// @route   DELETE api/categories/:id
// @desc    Delete a category
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ status: false, error: 'Category not found' });
    }
    
    // Don't allow deleting the default "Uncategorized" category
    if (category.name === 'Uncategorized') {
      return res.status(400).json({ status: false, error: 'Cannot delete the default Uncategorized category' });
    }
    
    // Move all products from this category to "Uncategorized"
    await Product.updateMany(
      { category: category.name },
      { $set: { category: 'Uncategorized' } }
    );
    
    // Delete the category
    await category.remove();
    
    res.json({ status: true, data: { message: 'Category removed and products moved to Uncategorized' } });
  } catch (error) {
    console.error('Error deleting category:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ status: false, error: 'Category not found' });
    }
    
    res.status(500).json({ status: false, error: 'Server error' });
  }
});

module.exports = router;