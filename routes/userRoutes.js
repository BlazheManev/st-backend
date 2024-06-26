var express = require("express");
var router = express.Router();
var userController = require("../controllers/userController.js");
const auth = require("../middleware/auth");

/*
 
GET*/
router.get("/", auth, userController.list);

/*
 
GET*/
router.get("/get/:id", userController.show);

/*
 
POST*/
router.post("/", userController.create);

/*
 
PUT*/
router.put("/update/:id", auth, userController.update);

/*
 
DELETE*/
router.delete("/:id", auth, userController.remove);

/*
 
LOGIN*/
router.post("/login", userController.login);

/*
 
RECORD*/
router.post("/:id/record", userController.recordEntryOrExit);

/*
 
CALCULATE WORKING HOURS*/
router.post(
    "/calculateWorkingHours",
    userController.calculateWorkedTimeByInterval
);

/*
 
CHECK CURRENT STATUS*/
router.get("/checkCurrentStatus", userController.checkCurrentStatus);

/*
 
MOST HOURS WORKED IN LAST MONTH*/
router.get("/mostWorkingHours", userController.calculateMostWorkedLastMonth);

/*
 
Get Working Hours*/
router.get("/:id/working-hours", userController.getWorkingHours);

/*
 
total-earnings*/
router.get("/:id/total-earnings", userController.calculateTotalEarnings);

/*

Book equipment*/
router.post("/book-equipment", userController.addEquipment);

/*
 
Return equipment*/
router.put("/return-equipment", userController.returnEquipment);

/*

Add education history for user*/
router.post("/add-education", userController.addEducation);

/*

Delete education history for user*/
router.delete("/delete-education", userController.deleteEducation);

/*

Calculate salary in month*/
router.post("/calculateMonthlyEarnings", userController.calculateEarningsByInterval);

router.post("/add-sick-leave-or-work-from-home/:id", userController.addSickLeaveOrWorkFromHome);

module.exports = router;
