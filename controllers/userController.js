var UserModel = require("../models/userModel.js");
var crypto = require("crypto");
const { validatePassword } = require("../utilities/passwordUtility"); // Import the validatePassword function
const jwt = require("jsonwebtoken");
const webpush = require("web-push"); // Make sure you have web-push installed

/**
 * userController.js
 *
 * @description :: Server-side logic for managing users.
 */
module.exports = {
  /**
   * userController.list()
   */
  list: async function (req, res) {
    try {
      const Users = await UserModel.find();
      return res.json(Users);
    } catch (err) {
      return res.status(500).json({
        message: "Error when getting User.",
        error: err,
      });
    }
  },

  /**
   * userController.show()
   */
  show: async function (req, res) {
    var id = req.params.id;

    try {
      const user = await UserModel.findOne({ _id: id });

      if (!user) {
        return res.status(404).json({
          message: "No such User",
        });
      }

      return res.json(user);
    } catch (err) {
      return res.status(500).json({
        message: "Error when getting User.",
        error: err,
      });
    }
  },

  /**
   * userController.create()
   */
  create: async function (req, res) {
    try {
      // Generating a unique salt for a new user
      var salt = crypto.randomBytes(16).toString("hex");
      // Hashing user's password with the salt
      var hash = crypto
        .pbkdf2Sync(req.body.password, salt, 1000, 64, "sha512")
        .toString("hex");

      var User = new UserModel({
        ime: req.body.ime,
        priimek: req.body.priimek,
        email: req.body.email,
        dan: req.body.dan, // Expecting an array of objects with datum, vhodi, izhodi
        hash: hash,
        salt: salt,
        roles: req.body.roles || ["WORKER"]  // Accept roles from request body or default to "WORKER"
      });

      // Saving the new user to the database
      const savedUser = await User.save();
      return res.status(201).json(savedUser);
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Error when creating User",
        error: err,
      });
    }
  },

  /**
   * userController.update()
   */
  update: async function (req, res) {
    var id = req.params.id;

    try {
      const user = await UserModel.findOne({ _id: id }); // Use 'user' consistently
      if (!user) {
        return res.status(404).json({
          message: "No such User",
        });
      }

      user.ime = req.body.ime ? req.body.ime : user.ime;
      user.priimek = req.body.priimek ? req.body.priimek : user.priimek;
      user.dan = req.body.dan ? req.body.dan : user.dan;
      user.email = req.body.email ? req.body.email : user.email;

      const updatedUser = await user.save();
      return res.json(updatedUser);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Error when updating User.",
        error: err.message,
      });
    }
  },

  /**
   * userController.login()
   */
  login: async function (req, res) {
    try {
      const user = await UserModel.findOne({ email: req.body.email });
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (validatePassword(user, req.body.password)) {
        const payload = {
          userId: user._id,
          email: user.email,
          roles: user.roles,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        return res.status(200).json({
          message: "Login successful",
          token: token,
        });
      } else {
        return res.status(401).json({ message: "Login failed" });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Error when trying to login",
        error: err,
      });
    }
  },

  /**
   * userController.remove()
   */
  remove: async function (req, res) {
    var id = req.params.id;

    try {
      await UserModel.findByIdAndDelete(id);
      return res.status(204).json();
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Error when deleting the User.",
        error: err,
      });
    }
  },

  /**
   * userController.recordEntryOrExit()
   */
  recordEntryOrExit: async function (req, res) {
    try {
      const userId = req.params.id; // assuming you're passing the user's ID as a parameter
      const type = req.body.type; // expecting "vhod" or "izhod"
      const currentTime = new Date();
      const currentDate = currentTime.toISOString().split('T')[0]; // format as YYYY-MM-DD
      const currentTimeString = currentTime.toTimeString().split(' ')[0]; // format as HH:MM:SS

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if entry for current date exists
      let dateEntry = user.dan.find(entry => entry.datum.toISOString().split('T')[0] === currentDate);

      if (dateEntry) {
        // Determine the last scan type and time
        const lastVhodTime = dateEntry.vhodi[dateEntry.vhodi.length - 1];
        const lastIzhodTime = dateEntry.izhodi[dateEntry.izhodi.length - 1];
        const lastVhodTimeInMs = lastVhodTime ? new Date(`${currentDate}T${lastVhodTime}Z`).getTime() : 0;
        const lastIzhodTimeInMs = lastIzhodTime ? new Date(`${currentDate}T${lastIzhodTime}Z`).getTime() : 0;
        const lastScanTimeInMs = Math.max(lastVhodTimeInMs, lastIzhodTimeInMs);
        const lastScanType = lastVhodTimeInMs > lastIzhodTimeInMs ? 'vhod' : 'izhod';

        // Check if the last scan type is the same as the current one
        if (lastScanType === type) {
          return res.status(400).json({ message: `Cannot record the same type (${type}) consecutively.` });
        }

        // Update vhodi or izhodi
        if (type === 'vhod') {
          dateEntry.vhodi.push(currentTimeString);
        } else if (type === 'izhod') {
          dateEntry.izhodi.push(currentTimeString);
        }
      } else {
        // Date doesn't exist, create new date entry
        const newEntry = {
          datum: currentDate,
          vhodi: type === 'vhod' ? [currentTimeString] : [],
          izhodi: type === 'izhod' ? [currentTimeString] : []
        };
        user.dan.push(newEntry);
      }

      await user.save();
      return res.status(200).json(user);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: 'Error when updating entry/exit',
        error: err
      });
    }
  },

  /**
   * userController.calculateWorkedTime()
   */
  calculateWorkedTime: async function (req, res) {
    const { email, startDate, endDate } = req.body;

    try {
      const user = await UserModel.findOne({ email: email });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Convert the input dates to Date objects
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Filter records within the date range
      const relevantDays = user.dan.filter((day) => {
        const dayDate = new Date(day.datum);
        return dayDate >= start && dayDate <= end;
      });

      let totalWorkedSeconds = 0;

      relevantDays.forEach((day) => {
        const { vhodi, izhodi } = day;
        // if (vhodi.length !== izhodi.length) {
        //   throw new Error("Mismatch between entry and exit times");
        // }

        for (let i = 0; i < vhodi.length; i++) {
          const entryTime = new Date(
            `${day.datum.toISOString().split("T")[0]}T${vhodi[i]}Z`
          );
          const exitTime = new Date(
            `${day.datum.toISOString().split("T")[0]}T${izhodi[i]}Z`
          );
          const workedTime = (exitTime - entryTime) / 1000; // in seconds
          totalWorkedSeconds += workedTime;
        }
      });

      const totalWorkedHours = Math.floor(totalWorkedSeconds / 3600);
      const totalWorkedMinutes = Math.floor((totalWorkedSeconds % 3600) / 60);
      const totalWorkedSecondsLeft = totalWorkedSeconds % 60;

      return res.status(200).json({
        hours: totalWorkedHours,
        minutes: totalWorkedMinutes,
        seconds: totalWorkedSecondsLeft,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Error when calculating worked time",
        error: err.message,
      });
    }
  },
  checkCurrentStatus: async function (req, res) {
    try {
      const currentTime = new Date();
      const currentDate = currentTime.toISOString().split('T')[0]; // format as YYYY-MM-DD
      const currentTimeString = currentTime.toTimeString().split(' ')[0]; // format as HH:MM:SS

      const users = await UserModel.find();

      const usersInCompany = [];

      for (const user of users) {
        const { dan } = user;

        // Check if the user has any entries for the current date
        const dateEntry = dan.find(entry => entry.datum.toISOString().split('T')[0] === currentDate);

        if (dateEntry) {
          // User has an entry for the current date
          const lastEntryTime = dateEntry.vhodi[dateEntry.vhodi.length - 1]; // Get the last entry time

          // Check if the user has checked out (last entry has a corresponding exit)
          if (dateEntry.izhodi.length < dateEntry.vhodi.length || lastEntryTime > currentTimeString) {
            usersInCompany.push({
              userId: user._id,
              userName: user.ime + ' ' + user.priimek,
              entryTime: lastEntryTime
            });
          }
        }
      }

      return res.status(200).json(usersInCompany);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: 'Error when checking current status',
        error: err.message
      });
    }
  },

  calculateMostWorkedLastMonth: async function (req, res) {
    try {
      const currentTime = new Date();
      const lastMonth = new Date(currentTime);
      lastMonth.setMonth(currentTime.getMonth() - 1);

      const users = await UserModel.find();

      let mostWorkedUser = null;
      let maxWorkedSeconds = 0;

      for (const user of users) {
        const { dan } = user;
        let totalWorkedSeconds = 0;

        const relevantDays = dan.filter(day => {
          const dayDate = new Date(day.datum);
          return dayDate >= lastMonth && dayDate <= currentTime;
        });

        relevantDays.forEach(day => {
          const { vhodi, izhodi } = day;
          for (let i = 0; i < vhodi.length; i++) {
            if (izhodi[i]) {
              const entryTime = new Date(`${day.datum.toISOString().split('T')[0]}T${vhodi[i]}Z`);
              const exitTime = new Date(`${day.datum.toISOString().split('T')[0]}T${izhodi[i]}Z`);
              const workedTime = (exitTime - entryTime) / 1000; // in seconds
              totalWorkedSeconds += workedTime;
            }
          }
        });

        if (totalWorkedSeconds > maxWorkedSeconds) {
          maxWorkedSeconds = totalWorkedSeconds;
          mostWorkedUser = user;
        }
      }

      if (mostWorkedUser) {
        const totalWorkedHours = Math.floor(maxWorkedSeconds / 3600);
        const totalWorkedMinutes = Math.floor((maxWorkedSeconds % 3600) / 60);
        const totalWorkedSecondsLeft = maxWorkedSeconds % 60;

        return res.status(200).json({
          userId: mostWorkedUser._id,
          userName: mostWorkedUser.ime + ' ' + mostWorkedUser.priimek,
          hours: totalWorkedHours,
          minutes: totalWorkedMinutes,
          seconds: totalWorkedSecondsLeft
        });
      } else {
        return res.status(200).json({
          message: 'No work records found for the last month.'
        });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: 'Error when calculating most worked time',
        error: err.message
      });
    }
  }
};
