const absenceController = require("../controllers/absenceController.js");
var express = require("express");
var router = express.Router();
const auth = require("../middleware/auth");
/*
 
POST absences*/
router.post('/create/new', absenceController.create);

/*
 
GET absences*/
router.get('/absences/:userId', auth, absenceController.list);

module.exports = router;
