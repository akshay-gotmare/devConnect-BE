const express = require("express");
const router = express.Router();

const { signUpValidation } = require("../utils/validation");
const { hashedPassword, comparedPassword } = require("../utils/password");
const User = require("../models/user");

router.post("/signup", async (req, res) => {
  try {
    // Validate req data
    signUpValidation(req);

    // encrypt password
    const {
      firstName,
      lastName,
      email,
      password,
      skills,
      gender,
      age,
      photoUrl,
      about,
    } = req.body;

    // Set encrypted password to db
    const hashedPass = await hashedPassword(password);
    const user = new User({
      firstName,
      lastName,
      email,
      skills,
      gender,
      age,
      photoUrl,
      about,
      password: hashedPass,
    });
    if (skills && skills.length > 5) {
      throw new Error("More than 5 skills not allowed");
    }
    await user.save();
    res.status(200).json({ message: "success", data: user });
  } catch (error) {
    res.status(400).json({ message: "signup failed", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
      throw new Error("Invalid credentials!");
    }
    const isMatchingPassword = await comparedPassword(password, user.password);

    if (!isMatchingPassword) {
      throw new Error("Invalid credentials!");
    }

    // create JWT token
    const token = user.getJWT();

    // store the token in cookies
    res.cookie("token", token);

    res.status(200).json({ data: user });
  } catch (error) {
    res.status(400).json({ message: "login failed", error: error.message });
  }
});

router.get("/logout", async (req, res) => {
  res.clearCookie("token").send("logged out successfully!");
});

module.exports = router;
