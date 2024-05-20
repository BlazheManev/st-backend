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

module.exports = router;
