const absenceController = require("../controllers/absenceController.js");
var express = require("express");
var router = express.Router();
const auth = require("../middleware/auth");
/*
 
POST absences*/
router.post("/create/new", absenceController.create);

/*
 
GET absences*/
router.get("/all", absenceController.list);

/*
 
GET absences by user*/
router.get("/user/:userId", absenceController.getAbsencesByUser);
/*

  POST approve vacation*/
router.post('/approve/:absenceId/:vacationId', absenceController.approveVacation);
 /*

  POST reject vacation*/
router.post('/reject/:absenceId/:vacationId', absenceController.rejectVacation);

module.exports = router;
