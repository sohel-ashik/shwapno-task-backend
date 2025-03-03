const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const fetch = require('node-fetch');

// @route   GET api/products
// @desc    Get all products (with optional category filter)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    // Apply filter if category is provided
    const filter = category ? { category } : {};
    
    const products = await Product.find(filter).sort({ createdAt: -1 });
    
    res.json({ status: true, data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ status: false, error: 'Server error' });
  }
});

// @route   GET api/products/:id
// @desc    Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ status: false, error: 'Product not found' });
    }
    
    res.json({ status: true, data: product });
  } catch (error) {
    console.error('Error fetching product:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ status: false, error: 'Product not found' });
    }
    
    res.status(500).json({ status: false, error: 'Server error' });
  }
});

// @route   POST api/products
// @desc    Add a new product
router.post('/', async (req, res) => {
  try {
    const { barcode, material, description, category } = req.body;
    
    // Check if a product with this barcode already exists
    let product = await Product.findOne({ barcode });
    
    if (product) {
      return res.status(400).json({ status: false, error: 'Product with this barcode already exists' });
    }
    
    // Create new product
    product = new Product({
      barcode,
      material,
      description,
      category: category || 'Uncategorized',
    });
    
    await product.save();
    
    res.status(201).json({ status: true, data: product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ status: false, error: 'Server error' });
  }
});

// @route   PATCH api/products/:id
// @desc    Update a product (especially for category changes)
router.patch('/:id', async (req, res) => {
  try {
    const { category } = req.body;
    
    // Find product by ID
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ status: false, error: 'Product not found' });
    }
    
    // Update only the provided fields
    if (category) product.category = category;
    
    // Save the updated product
    await product.save();
    
    res.json({ status: true, data: product });
  } catch (error) {
    console.error('Error updating product:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ status: false, error: 'Product not found' });
    }
    
    res.status(500).json({ status: false, error: 'Server error' });
  }
});

// @route   DELETE api/products/:id
// @desc    Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ status: false, error: 'Product not found' });
    }
    
    await product.remove();
    
    res.json({ status: true, data: { message: 'Product removed' } });
  } catch (error) {
    console.error('Error deleting product:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ status: false, error: 'Product not found' });
    }
    
    res.status(500).json({ status: false, error: 'Server error' });
  }
});

// @route   GET api/products/barcode/:barcode
// @desc    Fetch product from external API by barcode
router.get('/barcode/:barcode', async (req, res) => {
  try {
    const { barcode } = req.params;
    
    // First check if the product already exists in our database
    const existingProduct = await Product.findOne({ barcode });
    
    if (existingProduct) {
      return res.json({ status: true, data: existingProduct, source: 'local' });
    }
    
    // If not found locally, try to fetch from external API
    const response = await fetch(`https://products-test-aci.onrender.com/product/${barcode}`);
    const data = await response.json();
    
    if (!data.status || !data.product) {
      return res.status(404).json({ status: false, error: 'Product not found in external API' });
    }
    
    res.json({ status: true, data: data.product, source: 'external' });
  } catch (error) {
    console.error('Error fetching product from external API:', error);
    res.status(500).json({ status: false, error: 'Server error' });
  }
});

module.exports = router;