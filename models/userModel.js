const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const daySchema = new Schema({
  datum: Date,
  vhodi: [String],
  izhodi: [String],
  isAbsent: { type: Boolean, default: false },
  workLocation: { type: String, enum: ['office', 'home'], default: 'office' } // Add this field to store work location
});

const userSchema = new Schema({
  ime: String,
  priimek: String,
  email: String,
  dan: [daySchema],
  equipment: [
    {
      name: String,
      from: Date,
      to: Date,
    },
  ],
  education: [
    {
      institution: String,
      grade: String,
      title: String,
      from: Date,
      to: Date,
    },
  ],
  hash: String,
  salt: String,
  roles: { type: [String], default: ["WORKER"] },
  wagePerHour: { type: Number, required: true },
  vacationDaysLeft: { type: Number, default: 24 },
  sickDays: [{ type: Date }] // Add this line for sick days
});

module.exports = mongoose.model("User", userSchema);
