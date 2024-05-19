const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  ime: String,
  priimek: String,
  email: String,
  dan: [
    {
      datum: Date,
      vhodi: [String],
      izhodi: [String],
    },
  ],
  hash: String,
  salt: String,
  roles: { type: [String], default: ["WORKER"] },
  wagePerHour: { type: Number, required: true },
  vacationDaysLeft: { type: Number, default: 24 } 
});

module.exports = mongoose.model("User", userSchema);
