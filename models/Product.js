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



const Product = mongoose.model('Product', productSchema);

module.exports = Product;