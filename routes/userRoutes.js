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
router.get("/:id", auth, userController.show);

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
router.post("/calculateWorkingHours", userController.calculateWorkedTime);

/*
 * CALCULATE WORKING HOURS
 */

router.post("/checkCurrentStatus", userController.checkCurrentStatus);

module.exports = router;
