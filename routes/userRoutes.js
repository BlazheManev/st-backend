var express = require("express");
var router = express.Router();
var userController = require("../controllers/userController.js");
const auth = require("../middleware/auth");

/*
 * GET
 */
router.get("/", auth, userController.list);

/*
 * GET
 */
router.get("/get/:id", auth, userController.show);

/*
 * POST
 */
router.post("/", userController.create);

/*
 * PUT
 */
router.put("/:id", auth, userController.update);

/*
 * DELETE
 */
router.delete("/:id", auth, userController.remove);

/*
 * LOGIN
 */
router.post("/login", userController.login);

/*
 * RECORD
 */
router.post("/:id/record", auth, userController.recordEntryOrExit);

/*
 * CALCULATE WORKING HOURS
 */
router.post("/calculateWorkingHours", userController.calculateWorkedTimeByInterval);


/*
 * CHECK CURRENT STATUS
 */
router.get("/checkCurrentStatus", userController.checkCurrentStatus);

/*
 * MOST HOURS WORKED IN LAST MONTH
 */
router.get("/mostWorkingHours", userController.calculateMostWorkedLastMonth);

/*
 * Get Working Hours
 */
router.get('/:id/working-hours', auth, userController.getWorkingHours);

module.exports = router;
