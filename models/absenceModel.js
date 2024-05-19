const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vacationSchema = new Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true }
});

const absenceSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ime: { type: String, required: true },
  priimek: { type: String, required: true },
  vacations: { type: [vacationSchema], default: [] },
  year: { type: Number, required: true }
});

module.exports = mongoose.model("Absence", absenceSchema);
