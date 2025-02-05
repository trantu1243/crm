const jwt = require('jsonwebtoken');
require('dotenv').config();

// Hàm tạo access token
const generateAccessToken = (user) => {
  // `user` nên là một object chứa các thông tin cần thiết, ví dụ: { id, username }
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
};

module.exports = { generateAccessToken };
