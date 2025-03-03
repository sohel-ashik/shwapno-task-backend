const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);



const Category = mongoose.model('Category', categorySchema);

// Initialize default category if it doesn't exist
const initializeDefaultCategory = async () => {
  try {
    const defaultCategory = await Category.findOne({ name: 'Uncategorized' });
    if (!defaultCategory) {
      await Category.create({ name: 'Uncategorized', order: 0 });
      console.log('Default category created');
    }
  } catch (error) {
    console.error('Error initializing default category:', error);
  }
};

// Export both the model and the initialization function
module.exports = {
  Category,
  initializeDefaultCategory,
};