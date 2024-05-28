const AbsenceModel = require("../models/absenceModel.js");
const UserModel = require("../models/userModel.js");
const Subscription = require("../models/subscriptionModel");
const { eachDayOfInterval, isWeekend, parseISO } = require("date-fns");
const webpush = require("../utilities/web-push"); // Ensure the correct path

const holidays = [
  "2024-01-01",
  "2024-02-08",
  "2024-04-21",
  "2024-04-22",
  "2024-05-01",
  "2024-05-02",
  "2024-06-25",
  "2024-08-15",
  "2024-10-31",
  "2024-11-01",
  "2024-12-25",
  "2024-12-26",
];

const isHoliday = (date) => {
  return holidays.some(
    (holiday) => date.toISOString().split("T")[0] === holiday
  );
};

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
      const vacationDaysRequested = eachDayOfInterval({ start, end }).filter(
        (date) => !isWeekend(date) && !isHoliday(date)
      ).length;

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
        absence.vacations.push({
          startDate,
          endDate,
          reason,
          status: "waiting for approval",
        });
      } else {
        // Create a new absence document
        absence = new AbsenceModel({
          userId,
          ime: user.ime,
          priimek: user.priimek,
          vacations: [
            { startDate, endDate, reason, status: "waiting for approval" },
          ],
          year,
        });
      }

      // Save the absence to the database
      const savedAbsence = await absence.save();

      // Send notification to admins
      const admins = await UserModel.find({ roles: "ADMIN" });
      const subscriptions = await Subscription.find({
        userId: { $in: admins.map((admin) => admin._id) },
      });

      const notificationPayload = {
        notification: {
          title: "New Absence Request",
          body: `${user.ime} ${user.priimek} has requested an absence.`,
          icon: "../icons/favicon.png",
          data: { url: "/vacation-approval" },
        },
      };

      subscriptions.forEach((sub) => {
        webpush
          .sendNotification(
            sub.subscription,
            JSON.stringify(notificationPayload)
          )
          .catch((error) => {
            console.error("Error sending notification:", error);
          });
      });

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

      // Calculate the number of vacation days and add working hours
      let vacationDays = 0;
      const workingHoursPerDay = 8; // Assuming 8 working hours per day

      const days = eachDayOfInterval({ start, end }).filter(
        (date) => !isWeekend(date) && !isHoliday(date)
      );

      days.forEach((date) => {
        const currentTime = new Date();
        const currentTimeString = currentTime.toTimeString().split(" ")[0]; // format as HH:MM:SS

        const dateString = date.toISOString().split("T")[0];
        let dayEntry = user.dan.find(
          (d) => d.datum.toISOString().split("T")[0] === dateString
        );
        if (!dayEntry) {
          dayEntry = {
            datum: date,
            vhodi: [],
            izhodi: [],
          };
          dayEntry.vhodi.push("07:00:00");
          dayEntry.izhodi.push("15:00:00");
          user.dan.push(dayEntry);
        }
        vacationDays++;
      });

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
