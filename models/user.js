const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  skills: { type: [String] },
  age: { type: String },
  gender: { type: String },
  photoUrl: { type: String },
  about: { type: String },
});

// schema methods
userSchema.methods.getJWT = function () {
  const user = this;

  const payload = {
    userId: user._id,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET);

  return token;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
