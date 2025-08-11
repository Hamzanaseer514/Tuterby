const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  phone_number: {
    type: String,
  },
  role: {
    type: String,
    enum: ['tutor', 'student', 'parent', 'admin']
  },
  age: {
    type: Number,
    min: 0
  },
  photo_url: {
    type: String,
    default: ''
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  is_verified: {
    type: String,
    enum: ['active', 'inactive', 'partial_active'],
    default: 'inactive'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// 🔐 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔐 Method to compare entered password with stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
