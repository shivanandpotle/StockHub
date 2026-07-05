const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const filter = req.user.role === 'super_admin' ? {} : { businessId: req.user._id };
    const categories = await Category.find(filter).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('getCategories error:', error.message);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
  try {
    const categoryData = {
      ...req.body,
      businessId: req.user._id,
    };

    const category = await Category.create(categoryData);
    res.status(201).json(category);
  } catch (error) {
    console.error('createCategory error:', error.message);
    res.status(500).json({ message: 'Server error creating category' });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Verify ownership (unless super_admin)
    if (req.user.role !== 'super_admin' && category.businessId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this category' });
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(category);
  } catch (error) {
    console.error('updateCategory error:', error.message);
    res.status(500).json({ message: 'Server error updating category' });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Verify ownership (unless super_admin)
    if (req.user.role !== 'super_admin' && category.businessId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this category' });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('deleteCategory error:', error.message);
    res.status(500).json({ message: 'Server error deleting category' });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
