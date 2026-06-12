const express = require("express");
const router = express.Router();
const { authUser } = require("../middlewares/auth");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");

router.post(
  "/sendConnectionRequest/:status/:toUserId",
  authUser,
  async (req, res) => {
    try {
      const user = req.user;
      const fromUserId = user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      if (!status) {
        throw new Error("Status can't be empty");
      }

      const acceptedStatus = ["interested", "ignored"];
      const isValidStatus = acceptedStatus.includes(status);
      if (!isValidStatus) {
        throw new Error(`Invalid status - "${status}"`);
      }

      const isDuplicateEntry = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (isDuplicateEntry) {
        throw new Error("Sending duplicate requests is not allowed");
      }

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        throw new Error("Requested user not found");
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const connection = await connectionRequest.save();

      res.status(200).json({
        message: `${user.firstName} ${status} ${toUser.firstName}`,
        data: { receiver: toUser, loggedUser: user },
        connection: connection,
      });
    } catch (error) {
      res
        .status(400)
        .json({ message: "Connection request failed", error: error.message });
    }
  },
);

router.post(
  "/sendConnectionRequest/review/:status/:requestId",
  authUser,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      // verify status is allowed status
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        throw new Error(`Invalid status - "${status}"`);
      }

      // verify requestId is valid
      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      // verify such request exist with interested status
      if (!connectionRequest) {
        throw new Error("Connection request does not exist");
      }

      // change the status in existing request from interested to accepted/rejected
      connectionRequest.status = status;
      await connectionRequest.save();

      res.status(200).json({
        message: `${status} request succefully`,
        data: connectionRequest,
      });
    } catch (error) {
      res.status(400).json({
        message: "Connection request review failed",
        error: error.message,
      });
    }
  },
);

module.exports = router;
