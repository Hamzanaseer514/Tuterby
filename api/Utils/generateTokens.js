const jwt = require("jsonwebtoken");

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" }); // Increased to 7 days
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_SECRET, { expiresIn: "30d" }); // Increased to 30 days
};


module.exports = {
  generateAccessToken,
  generateRefreshToken
};
