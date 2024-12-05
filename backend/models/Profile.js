// backend/models/Profile.js
const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  src: { type: String, required: true },
  ratings: { type: Number, default: 0 }
});

const profileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String, required: true },
  images: [imageSchema] // Array de imagens
});

module.exports = mongoose.model('Profile', profileSchema);
