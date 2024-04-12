const express = require("express");
const path = require('path');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authRouter = require('./routes/auth');
const personalDetailsRouter = require('./routes/personalDetails');
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

require("dotenv").config();
const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4());
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else cb(null, false);
};

app.use(bodyParser.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("profilePhoto")
);
app.use("/images", express.static(path.join(__dirname, "images")));



app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.use('/makeprofile', personalDetailsRouter);
app.use('/auth', authRouter);


app.use((error, req,res, next)=>{
  console.log(error);

  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(500).json({
    message : message,
    status : status
  })


});

mongoose
  .connect(process.env.DATABASE_URL)
  .then((result) => {
    console.log("Database Connection Successfull");
    app.listen(process.env.PORT);
  })
  .catch((err) => console.log(err));
