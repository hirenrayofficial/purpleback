const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uuid: {
    type: String,
    require: true,
    uniqe: true,
  },
  relation_user_uuid: {
    type: String,
  },
  user_name: {
    type: String,
    require: true,
  },
  user_email: {
    type: String,
    require: true,
    unique: true,
  },
  user_username: {
    type: String,
    require: true,
    unique: true,
  },
  user_pass: {
    type: String,
    require: true,
    unique: true,
  },
  user_role: {
    type: String,
    enum: ["user", "admin","manager"],
  },
  createAt: {
    type: Date,
  },
  last_login: {
    type: Date,
  },
  is_active: {
    type: Boolean,
  },
});

const user = mongoose.model("purpleuser", userSchema);
module.exports = user;
