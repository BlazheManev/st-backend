const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController.js");
const auth = require("../middleware/auth");

router.post("/new", subscriptionController.subscribe);

module.exports = router;
