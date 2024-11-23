const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String, required: true },
  images: [{
    src: { type: String, required: true },
    ratings: { type: Number, default: 0 }
       }]
});

module.exports = mongoose.model('Profile', profileSchema);
