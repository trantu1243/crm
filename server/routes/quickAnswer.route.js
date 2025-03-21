const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");
const isAdmin = require("../middlewares/isAdmin");
const { quickAnswerController } = require("../controllers");

const router = express.Router();

router.get("/", authenticateToken, quickAnswerController.getQuickAnswers);

router.post("/create", authenticateToken, isAdmin, quickAnswerController.addQuickAnswer);

router.post("/:id/update", authenticateToken, isAdmin, quickAnswerController.editQuickAnswer);

router.post("/:id/delete", authenticateToken, isAdmin, quickAnswerController.deleteQuickAnswer);

module.exports = router;
