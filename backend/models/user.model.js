// backend/models/user.model.js
const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }
    ],
    favoriteCountries: [
      {
        code: String,  // Country code (cca3)
        name: String,  // Country name
        flag: String   // URL to flag image
      }
    ]
  })
);

module.exports = User;
