const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");
const isAdmin = require("../middlewares/isAdmin");
const { settingController } = require("../controllers");

const router = express.Router();

router.get("/", authenticateToken, isAdmin, settingController.getSetting);

router.post("/toggle/fee", authenticateToken, isAdmin, settingController.toggleFeeSetting);

router.get("/all", authenticateToken, isAdmin, settingController.getSettings);

router.post("/update", authenticateToken, isAdmin, settingController.updateSettings);

router.post("/get-token", authenticateToken, isAdmin, settingController.getToken);

router.post("/add-account", authenticateToken, isAdmin, settingController.addGDTGAccount);

router.post("/remove-account", authenticateToken, isAdmin, settingController.removeGDTGAccount);

module.exports = router;
