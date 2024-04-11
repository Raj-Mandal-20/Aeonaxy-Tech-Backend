const UserDetails = require("../model/UserDetails");
const User = require("../model/User");

const { validationResult } = require("express-validator");

exports.loadProfilePhoto = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Falid, Data enterred is Incorrect");
    error.statusCode = 422;
    throw error;
  }

  try {
    // const user = await User.findById(req.userId);
    // console.log(user.userDetailsId);
    const userDetails = await UserDetails.findOne({userId : req.userId });
    console.log(userDetails);
    res.status(201).json({
      profilePhoto: userDetails.profilePhoto,
    });
  } catch (err) {
    next(err);
  }
};

exports.postPersonalDetails = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Falid, Data enterred is Incorrect");
    error.statusCode = 422;
    throw error;
  }

  if (!req.file) {
    const error = new Error("No Image Provided");
    error.statusCode = 422;
    throw error;
  }

  const profilePhoto = req.file.path.replace("\\", "/");
  const location = req.body.location;

  const userDetails = new UserDetails({
    profilePhoto: profilePhoto,
    location: location,
    userId: req.userId,
  });

  const details = await userDetails.save();
  console.log(details);

  const user = await User.findById(req.userId);
  user.userDetailsId = details._id;
  await user.save();

  res.json({
    messsage: "successful",
  });
};

exports.isPersonalDetalilsTaken = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Falid !");
    error.statusCode = 422;
    throw error;
  }

  try {
    const user = await User.findById(req.userId);
    console.log("User : ", user);
    if (!user.userDetailsId) {
      res.status(200).json({
        isPersonalDataTaken: false,
      });
    }
    res.status(200).json({
      isDataTaken: true,
    });
  } catch (err) {
    next(err);
  }
};
