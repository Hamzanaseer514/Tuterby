const mongoose = require("mongoose");

const parentProfileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudentProfile" // only ObjectId references
  }],
  profile_status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("ParentProfile", parentProfileSchema);
