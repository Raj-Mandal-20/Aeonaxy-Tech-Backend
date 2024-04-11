const User = require("../model/User");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const  { Resend } = require('resend');


exports.validUsername = (req, res, next) => {

  console.log('check For Valid Username!');
  const username = req.body.username;
  User.findOne({ username: username })
    .then((user) => {
      // console.log(!user);
      if (user === null) {
        res.status(200).json({
          isUsernameTaken : false
        })
      }
      res.status(200).json({
          isUsernameTaken : true,
          message : 'This username is already taken!'
      })

    })
    .catch((err) => {
      next(err);
    });
};

exports.validEmail = (req, res, next)=>{
  const email = req.body.email;
  User.findOne({ email: email })
  .then((user)=> {
    // console.log(!user);
    if (user === null) {
      res.status(200).json({
        isEmailUsed : false
      })
    }
    res.status(200).json({
       isEmailUsed : true,
        message : 'This email is already in use!'
    })

    // throw new Error("Username Exists!");
  
  })
  .catch((err) => {
    next(err);
  });
}


exports.signUp = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new Error("Validation Failed!");
  }

  const name = req.body.name;
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  // check if the user already exists or not ---> add this later
  User.findOne({ username: username })
    .then((user) => {
      if (!user) {
        return bcrypt.hash(password, 12);
      } else throw new Error("Username Already Exists!");
    })
    .then((hasedPassword) => {
      const user = new User({
        name: name,
        username: username,
        email: email,
        password: hasedPassword,
      });
      return user.save();
    })
    .then((result) => {
      res.status(200).json({
        message: "User Created!",
        userId: result._id,
      });
    })
    .catch((err) => next(err));
};

exports.signIn = (req, res, next) => {
  // check signIn either using username or email
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new Error("Validation Failed!");
  }

  const credential = req.body.credential;
  const password = req.body.password;

  let checkCredential;
  if (credential.includes("@")) {
    console.log("logging through email....");
    checkCredential = {
      email: credential,
    };
  } else {
    checkCredential = {
      username: credential,
    };
  }
  let loadedUser;
  User.findOne(checkCredential)
    .then((user) => {
      if (!user) {
        throw new Error("User not Exists");
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(async (isEqual) => {
      if (!isEqual) {
        const error = new Error("Wrong Password!");
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          username: loadedUser.username,
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        "somesupersecret",
        {
          expiresIn: "1h",
        }
      );
      req.userId = loadedUser._id;
      
    const resend = new Resend(process.env.RESEND_API_KEY);
    try{
        await resend.emails.send({
        from: 'Dribble <rajmandal.live@resend.dev>',
        to: ['account@refero.design'],
        subject: 'Tesing Email Using Resend',
        text: 'Verify Your Account!'
        });
    }
    catch(err){
        next(err);
    }
    res.status(200).json({
        token: token,
        message: "Loggedin Successful!",
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
