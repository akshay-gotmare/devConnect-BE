const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    status: {
      type: String,
      enum: {
        values: ["interested", "ignored", "accepted", "rejected"],
        message: "No such entry for status is acceptable",
      },
    },
  },
  { timestamps: true },
);

connectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;

  // check if the request is send by loggedin user to itself

  const isSameUser = connectionRequest.fromUserId.equals(
    connectionRequest.toUserId,
  );
  if (isSameUser) {
    throw new Error("Cannot send connection request to yourself");
  }
});

const ConnectionRequest = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema,
);
module.exports = ConnectionRequest;
