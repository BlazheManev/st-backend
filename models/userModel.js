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
  equipment: [
    {
      name: String,
      from: Date,
      to: Date
    }
  ],
  hash: String,
  salt: String,
  roles: { type: [String], default: ["WORKER"] },
  wagePerHour: { type: Number, required: true },
});

module.exports = mongoose.model("User", userSchema);
