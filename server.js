const express = require("express");
const app = express();
require("dotenv").config();
app.use(express.json());

const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");

// routes
const authRouter = require("./routes/authRouter");
const profileRouter = require("./routes/profileRouter");
const connectionRouter = require("./routes/connectionRouter");
const userRouter = require("./routes/userRoute");
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(cookieParser());

connectDB();

// sign up
// login
app.use("/", authRouter);

//profile
app.use("/", profileRouter);

// send connection reuqest
app.use("/", connectionRouter);

// get user connections/requests, etc...
app.use("/", userRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server listening on PORT ${process.env.PORT}`);
});
