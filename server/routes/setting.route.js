const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");
const isAdmin = require("../middlewares/isAdmin");
const { settingController } = require("../controllers");

const router = express.Router();

router.get("/", authenticateToken, isAdmin, settingController.getSetting);

router.post("/toggle/fee", authenticateToken, isAdmin, settingController.toggleFeeSetting);

module.exports = router;
