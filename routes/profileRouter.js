const express = require("express");
const router = express.Router();

const { authUser } = require("../middlewares/auth");
const {
  editProfileValidation,
  updatePasswordValidate,
} = require("../utils/validation");
const { hashedPassword } = require("../utils/password");

router.get("/profile/view", authUser, async (req, res) => {
  try {
    const { user } = req;

    res.status(200).json({ user: user });
  } catch (error) {
    res
      .status(400)
      .json({ message: "profile not found", error: error.message });
  }
});

router.patch("/profile/edit", authUser, async (req, res) => {
  try {
    editProfileValidation(req);
    const user = req.user;
    Object.keys(req.body).forEach((field) => (user[field] = req.body[field]));
    await user.save();
    res
      .status(200)
      .json({ message: "Profile updated successfully", data: user });
  } catch (error) {
    res
      .status(400)
      .json({ message: "update profile failed", error: error.message });
  }
});

router.patch("/profile/password", authUser, async (req, res) => {
  try {
    await updatePasswordValidate(req);
    const { password } = req.body;
    const hashedPass = await hashedPassword(password);
    const user = req.user;
    user["password"] = hashedPass;
    await user.save();
    res
      .status(200)
      .json({ message: "password updated successfully", user: user });
  } catch (error) {
    res
      .status(400)
      .json({ message: "update password failed", error: error.message });
  }
});

module.exports = router;
