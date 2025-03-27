const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");
const isAdmin = require("../middlewares/isAdmin");
const { settingController } = require("../controllers");

const router = express.Router();

router.get("/", authenticateToken, isAdmin, settingController.getSetting);

router.post("/toggle/fee", authenticateToken, isAdmin, settingController.toggleFeeSetting);

router.get("/all", authenticateToken, settingController.getSettings);

router.post("/update", authenticateToken, isAdmin, settingController.updateSettings);

router.post("/get-token", authenticateToken, settingController.getToken);

router.post("/get-token1", authenticateToken, settingController.getToken1);

router.post("/add-account", authenticateToken, isAdmin, settingController.addGDTGAccount);

router.post("/remove-account", authenticateToken, isAdmin, settingController.removeGDTGAccount);

router.post("/edit-account/:id", authenticateToken, isAdmin, settingController.editGDTGAccount);

router.get("/cookies", authenticateToken, settingController.getCookies);

router.post("/update-cookie", authenticateToken, settingController.updateCookie);

module.exports = router;
