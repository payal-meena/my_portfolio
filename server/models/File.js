const mongoose = require("mongoose");

// One document per kind: "resume" or "photo". Uploading again replaces it.
const fileSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ["resume", "photo"], required: true, unique: true },
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", fileSchema);
