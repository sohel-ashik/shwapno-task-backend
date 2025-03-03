const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    material: {
      type: Number,
      required: true,
    },
    barcode: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: 'Uncategorized',
    },
  },
  {
    timestamps: true,
  }
);

// Create index on barcode for faster lookups
productSchema.index({ barcode: 1 });
// Create index on category for filtering
productSchema.index({ category: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;