const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  userDetailsId : {
    type : Schema.Types.ObjectId,
    ref : 'UserDetail',
  },
  is_email_verified: {
    type: Boolean,
    default: false,
  },
 
});

module.exports = mongoose.model("User", userSchema);
