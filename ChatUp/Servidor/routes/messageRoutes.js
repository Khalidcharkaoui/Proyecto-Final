const express = require("express");
const {
  allMessages,
  sendMessage,
  markMessageAsDeleted,
} = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);
router.route("/mark-as-deleted/:messageId").put(protect, markMessageAsDeleted); 
module.exports = router;
