const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true },
    items: [{ type: String, trim: true }],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Skill", skillSchema);
