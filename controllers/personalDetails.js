const UserDetails = require("../model/UserDetails");

const { validationResult } = require("express-validator");
exports.postPersonalDetails = async (req, res, next) => {
  console.log("userID :  ", req.userId);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Falid, Data enterred is Incorrect");
    error.statusCode = 422;
    throw error;
  }
  // console.log(req);

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
  });

  const details = await userDetails.save();
  console.log(details);

  // res.redirect('/verify');
  res.json({
    messsage : 'successful'
  })


  // console.log(req.body.profilePhoto);
  // console.log(req.body.location);

  // console.log(req.userId);
};
