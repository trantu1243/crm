const express = require("express");
const { roleController } = require("../controllers");
const authenticateToken = require("../middlewares/authenticateToken");
const isAdmin = require("../middlewares/isAdmin");

const router = express.Router();

router.get("/", authenticateToken, isAdmin, roleController.getRoles);

router.post("/create", authenticateToken, isAdmin, roleController.createRole);

router.post("/:id/update", authenticateToken, isAdmin, roleController.updateRole);

router.post("/:id/delete", authenticateToken, isAdmin, roleController.deleteRole);

module.exports = router;
