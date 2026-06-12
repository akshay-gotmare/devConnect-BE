const express = require("express");
const router = express.Router();
const { authUser } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const { connection } = require("mongoose");
const User = require("../models/user");

const USER_SAFE_FIELDS = "firstName lastName gender age skills";

router.get("/user/requests/received", authUser, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connections = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_FIELDS);

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

router.get("/user/connections", authUser, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connections = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_FIELDS)
      .populate("toUserId", USER_SAFE_FIELDS);

    const cleanConnections = connections.map((connection) => {
      console.log({
        From: connection.fromUserId._id,
        To: connection.toUserId._id,
      });
      if (
        connection.fromUserId._id.toString() === loggedInUser._id.toString()
      ) {
        return connection.toUserId;
      }
      return connection.fromUserId;
    });

    res.status(200).json({
      message: "active connections fetched successfully",
      data: cleanConnections,
    });
  } catch (error) {
    res.status(400).json({
      message: "failed to fetch accepted connections",
      error: error.message,
    });
  }
});

router.get("/user/feed", authUser, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * 10;

    const loggdInUser = req.user;

    // find connections that includes the logged in user as either fromUser or toUser
    const connections = await ConnectionRequest.find({
      $or: [{ fromUserId: loggdInUser._id }, { toUserId: loggdInUser._id }],
    }).select("fromUserId toUserId");

    const excludedUserIds = new Set();

    // create SET of users from fromUserId or toUserId
    connections.forEach((row) => {
      excludedUserIds.add(row.fromUserId);
      excludedUserIds.add(row.toUserId);
    });

    // find all users except the excluded users
    const users = await User.find({
      _id: { $nin: Array.from(excludedUserIds) },
    })
      .select(USER_SAFE_FIELDS)
      .skip(skip)
      .limit(limit);

    res
      .status(200)
      .json({ message: "users fetched successfully", data: users });
  } catch (error) {
    res
      .status(400)
      .json({ message: "failed to get the feed", error: error.message });
  }
});

module.exports = router;
