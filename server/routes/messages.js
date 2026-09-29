const express = require("express");
const rateLimit = require("express-rate-limit");
const Message = require("../models/Message");
const auth = require("../middleware/auth");

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: "Too many messages, please try again later." },
});

// Public: contact form
router.post("/", contactLimiter, async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    await Message.create({ name, email, message });
    res.status(201).json({ message: "Message sent" });
  } catch (err) {
    next(err);
  }
});

// Admin only
router.get("/", auth, async (req, res, next) => {
  try {
    res.json(await Message.find().sort({ createdAt: -1 }));
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/read", auth, async (req, res, next) => {
  try {
    const doc = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: req.body.isRead !== false },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", auth, async (req, res, next) => {
  try {
    const doc = await Message.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
