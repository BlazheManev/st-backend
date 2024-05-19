const AbsenceModel = require("../models/absenceModel.js");
const UserModel = require("../models/userModel.js");

module.exports = {
  /**
   * absenceController.create()
   */
  create: async function (req, res) {
    try {
      const { userId, startDate, endDate, reason } = req.body;

      // Find the user
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if the user is a student
      if (user.roles.includes("STUDENT")) {
        return res.status(403).json({ message: "Students are not allowed to create absences" });
      }

      // Calculate the number of vacation days requested
      const start = new Date(startDate);
      const end = new Date(endDate);
      const vacationDaysRequested = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      // Check if the user has enough vacation days left
      if (user.vacationDaysLeft < vacationDaysRequested) {
        return res.status(400).json({ message: "Not enough vacation days left" });
      }

      // Extract the year from the start date
      const year = start.getFullYear();

      // Find the existing absence document for the user for the current year
      let absence = await AbsenceModel.findOne({ userId: userId, year: year });

      if (absence) {
        // Update the existing document by adding the new vacation
        if (!absence.vacations) {
          absence.vacations = [];
        }
        absence.vacations.push({ startDate, endDate, reason });
      } else {
        // Create a new absence document
        absence = new AbsenceModel({
          userId,
          ime: user.ime,
          priimek: user.priimek,
          vacations: [{ startDate, endDate, reason }],
          year
        });
      }

      // Save the absence to the database
      const savedAbsence = await absence.save();

      // Update the user's vacation days left
      user.vacationDaysLeft -= vacationDaysRequested;
      await user.save();

      return res.status(201).json(savedAbsence);
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Error when creating absence",
        error: err,
      });
    }
  },

  /**
   * absenceController.list()
   */
  list: async function (req, res) {
    try {
      const userId = req.params.userId;
      const absences = await AbsenceModel.find({ userId: userId });

      return res.status(200).json(absences);
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Error when getting absences",
        error: err,
      });
    }
  }
};
