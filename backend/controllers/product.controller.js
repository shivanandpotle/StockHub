const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
  try {
    const filter = req.user.role === 'super_admin' ? {} : { businessId: req.user._id };
    const products = await Product.find(filter).populate('categoryId', 'name');
    res.json(products);
  } catch (error) {
    console.error('getProducts error:', error.message);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('categoryId', 'name');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify ownership (unless super_admin)
    if (req.user.role !== 'super_admin' && product.businessId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this product' });
    }

    res.json(product);
  } catch (error) {
    console.error('getProduct error:', error.message);
    res.status(500).json({ message: 'Server error fetching product' });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      businessId: req.user._id,
    };

    const product = await Product.create(productData);
    const populatedProduct = await Product.findById(product._id).populate('categoryId', 'name');
    res.status(201).json(populatedProduct);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A product with this SKU already exists for your business' });
    }
    console.error('createProduct error:', error.message);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify ownership (unless super_admin)
    if (req.user.role !== 'super_admin' && product.businessId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('categoryId', 'name');

    res.json(product);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A product with this SKU already exists for your business' });
    }
    console.error('updateProduct error:', error.message);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify ownership (unless super_admin)
    if (req.user.role !== 'super_admin' && product.businessId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('deleteProduct error:', error.message);
    res.status(500).json({ message: 'Server error deleting product' });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
