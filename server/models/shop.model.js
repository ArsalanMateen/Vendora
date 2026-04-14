import mongoose from 'mongoose';

const ShopSchema = new mongoose.Schema({
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
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  updated: Date,
  created: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Shop', ShopSchema);
