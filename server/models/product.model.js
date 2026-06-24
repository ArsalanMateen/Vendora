import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Name is required',
  },
  image: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    default: 'General',
  },
  quantity: {
    type: Number,
    required: 'Quantity is required',
  },
  price: {
    type: Number,
    required: 'Price is required',
  },
  shop: {
    type: mongoose.Schema.ObjectId,
    ref: 'Shop',
  },
  updated: Date,
  created: {
    type: Date,
    default: Date.now,
  },
});

ProductSchema.index({ created: -1, _id: -1 });
ProductSchema.index({ shop: 1, created: -1, _id: -1 });
ProductSchema.index({ category: 1, created: -1, _id: -1 });
ProductSchema.index({ price: 1, _id: 1 });
ProductSchema.index({ name: 1, _id: 1 });
ProductSchema.index({ shop: 1, price: 1, _id: 1 });
ProductSchema.index({ category: 1, price: 1, _id: 1 });
export default mongoose.model('Product', ProductSchema);
