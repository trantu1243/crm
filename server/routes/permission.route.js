const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");
const isAdmin = require("../middlewares/isAdmin");
const { permissionController } = require("../controllers");

const router = express.Router();

router.get("/", authenticateToken, isAdmin, permissionController.getPermissions);

module.exports = router;
