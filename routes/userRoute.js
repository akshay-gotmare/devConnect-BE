const express = require("express");
const router = express.Router();
const { authUser } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");

router.get("/user/requests/received", authUser, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connections = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", "firstName lastName gender age skills");

    if (!connections) {
      throw new Error("No connection requests available");
    }
    res.status(200).json({
      message: "Successfully fetched received requests",
      data: connections,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to get received requests",
      error: error.message,
    });
  }
});

module.exports = router;
