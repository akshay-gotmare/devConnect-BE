const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authUser = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      throw new Error("Authentication failed. Plese re-login");
    }

    const decodedPayload = jwt.verify(token, "Akshay@devConnectV0.1");
    const user = await User.findById(decodedPayload.userId);

    if (!user) {
      throw new Error("User not found!");
    }
    req.user = user;

    next();
  } catch (error) {
    res
      .status(400)
      .json({ message: "Authentications failed", error: error.message });
  }
};

module.exports = {
  authUser,
};
