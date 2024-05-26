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
        return res
          .status(403)
          .json({ message: "Students are not allowed to create absences" });
      }

      // Calculate the number of vacation days requested
      const start = new Date(startDate);
      const end = new Date(endDate);
      const vacationDaysRequested = eachDayOfInterval({
        start,
        end
      }).filter(date => date.getDay() !== 0 && date.getDay() !== 6).length;

      // Check if the user has enough vacation days left
      if (user.vacationDaysLeft < vacationDaysRequested) {
        return res
          .status(400)
          .json({ message: "Not enough vacation days left" });
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
        absence.vacations.push({ startDate, endDate, reason, status: "waiting for approval" });
      } else {
        // Create a new absence document
        absence = new AbsenceModel({
          userId,
          ime: user.ime,
          priimek: user.priimek,
          vacations: [{ startDate, endDate, reason, status: "waiting for approval" }],
          year,
        });
      }

      // Save the absence to the database
      const savedAbsence = await absence.save();

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
   * absenceController.approveVacation()
   */
  approveVacation: async function (req, res) {
    try {
      const { absenceId, vacationId } = req.params;

      const absence = await AbsenceModel.findById(absenceId);
      if (!absence) {
        return res.status(404).json({ message: "Absence not found" });
      }

      const vacation = absence.vacations.id(vacationId);
      if (!vacation) {
        return res.status(404).json({ message: "Vacation not found" });
      }

      vacation.status = "approved";

      const user = await UserModel.findById(absence.userId);
      const start = new Date(vacation.startDate);
      const end = new Date(vacation.endDate);
      let vacationDays = 0;

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const day = d.getDay();
        if (day !== 0 && day !== 6) { // Exclude Sunday and Saturday
          vacationDays++;
        }
      }

      user.vacationDaysLeft -= vacationDays;
      await user.save();

      await absence.save();

      return res.status(200).json(absence);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Error when approving vacation.",
        error: err,
      });
    }
  },
  /**
   * absenceController.rejectVacation()
   */
  rejectVacation: async function (req, res) {
    try {
      const { absenceId, vacationId } = req.params;

      const absence = await AbsenceModel.findById(absenceId);
      if (!absence) {
        return res.status(404).json({ message: "Absence not found" });
      }

      const vacation = absence.vacations.id(vacationId);
      if (!vacation) {
        return res.status(404).json({ message: "Vacation not found" });
      }

      vacation.status = "rejected";
      await absence.save();

      return res.status(200).json(absence);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Error when rejecting vacation.",
        error: err,
      });
    }
  },

  /**
   * absenceController.list()
   */
  list: async function (req, res) {
    try {
      const absences = await AbsenceModel.find();
      return res.status(200).json(absences);
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Error when getting absences",
        error: err,
      });
    }
  },
  /**
   * absenceController.getAbsencesByUser()
   */
  getAbsencesByUser: async function (req, res) {
    const userId = req.params.userId;

    try {
      const absences = await AbsenceModel.find({ userId: userId });

      if (!absences) {
        return res
          .status(404)
          .json({ message: "No absences found for this user." });
      }

      return res.status(200).json(absences);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Error when getting absences.",
        error: err,
      });
    }
  },
};
