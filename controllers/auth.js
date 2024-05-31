const User = require("../model/User");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const path = require("path");
const ejs = require("ejs");
const nodemailer = require("nodemailer");
const fs = require("fs");
const { promisify } = require("util");
const otp = require("otp-generator");

const readFileAsync = promisify(fs.readFile);

const { Resend } = require("resend");

async function sendEMail(username, email) {
  console.log('testing email.');
  const htmlTemplate = await readFileAsync("./public/html/template.ejs");
  const imageAttachment = await readFileAsync("./public/images/mail.png");

  const templatePath = path.join(__dirname, "..", "public/html/template.ejs");
  const template = fs.readFileSync(templatePath, "utf-8");

  const password = otp.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
  const htmlContent = ejs.render(template, {
    username: username,
    password: password,
  });

  console.log(password);

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `Dribble <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Dribble Account Verification",
    html : htmlContent,
    attachments: [
      {
        filename: "mail.png",
        content: imageAttachment,
        encoding: "base64",
        cid: "uniqueImageCID", // Referenced in the HTML template
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email: ", error);
    } else {
      console.log("Email sent: ", info.response);
    }
  });
}

exports.validUsername = (req, res, next) => {
  const username = req.body.username;
  User.findOne({ username: username })
    .then((user) => {
      if (user === null) {
        res.status(200).json({
          isUsernameTaken: false,
        });
      }
      res.status(200).json({
        isUsernameTaken: true,
        message: "This username is already taken!",
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.validEmail = (req, res, next) => {
  const email = req.body.email;
  User.findOne({ email: email })
    .then((user) => {
      if (user === null) {
        res.status(200).json({
          isEmailUsed: false,
        });
      }
      res.status(200).json({
        isEmailUsed: true,
        message: "This email is already in use!",
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.signUp = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new Error("Validation Failed!");
  }

  const name = req.body.name;
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  console.log('Signup Form Triggerd!');

  // check if the user already exists or not
  User.findOne({ $or: [{ email: email }, { username: username }] })
    .then((user) => {
      if (!user) {
        return bcrypt.hash(password, 12);
      } else throw new Error("Username or Email is already in use!");
    })
    .then((hasedPassword) => {
      const user = new User({
        name: name,
        username: username,
        email: email,
        password: hasedPassword,
      });
      sendEMail(username, email);
      console.log('sendemil Line Crossed!')
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
        process.env.SECRET_KEY,
        {
          expiresIn: "1h",
        }
      );
      req.userId = loadedUser._id;

      const resend = new Resend(process.env.RESEND_API_KEY);
      try {
        await resend.emails.send({
          from: `Dribble <${process.env.EMAIL_FROM}>`,
          to: [`${process.env.EMAIL_TO}`],
          subject: "Verify Your Account",
          text: "Your one time Otp is ....",
        });
      } catch (err) {
        next(err);
      }
      res.status(200).json({
        token: token,
        email : loadedUser.email,
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
