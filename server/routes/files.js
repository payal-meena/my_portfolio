const express = require("express");
const multer = require("multer");
const File = require("../models/File");
const Profile = require("../models/Profile");
const auth = require("../middleware/auth");

const router = express.Router();

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE, files: 1 },
});

const ALLOWED = {
  resume: ["application/pdf"],
  photo: ["image/jpeg", "image/png", "image/webp"],
};
const PROFILE_FIELD = { resume: "resumeUrl", photo: "photoUrl" };

// Check the real file bytes, not just the type the browser claims
function looksValid(mime, buf) {
  if (mime === "application/pdf") return buf.subarray(0, 4).toString() === "%PDF";
  if (mime === "image/jpeg") return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  if (mime === "image/png") return buf.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  if (mime === "image/webp")
    return buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP";
  return false;
}

const checkKind = (req, res, next) =>
  ALLOWED[req.params.kind] ? next() : res.status(404).json({ message: "Unknown file type" });

// Public: GET /api/files/resume  or  /api/files/photo   (add ?download=1 to force download)
router.get("/:kind", checkKind, async (req, res, next) => {
  try {
    const file = await File.findOne({ kind: req.params.kind });
    if (!file) return res.status(404).json({ message: "File not uploaded yet" });

    const safeName = file.filename.replace(/[^\w.\- ]/g, "_");
    const disposition = req.query.download === "1" ? "attachment" : "inline";
    res.set({
      "Content-Type": file.contentType,
      "Content-Length": file.size,
      "Content-Disposition": `${disposition}; filename="${safeName}"`,
      "Cache-Control": "public, max-age=3600",
    });
    res.send(Buffer.from(file.data));
  } catch (err) {
    next(err);
  }
});

// Admin only: POST /api/files/resume  or  /api/files/photo  (form-data, field name "file")
router.post("/:kind", auth, checkKind, upload.single("file"), async (req, res, next) => {
  try {
    const { kind } = req.params;
    const f = req.file;
    if (!f) return res.status(400).json({ message: "No file received" });
    if (!ALLOWED[kind].includes(f.mimetype) || !looksValid(f.mimetype, f.buffer)) {
      const need = kind === "resume" ? "a PDF file" : "a JPG, PNG or WEBP image";
      return res.status(400).json({ message: `Please upload ${need}` });
    }

    await File.findOneAndUpdate(
      { kind },
      { kind, filename: f.originalname, contentType: f.mimetype, size: f.size, data: f.buffer },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Saved as a relative path, the frontend adds the API base URL.
    // ?v= changes on every upload so browsers never show the old file.
    const url = `/api/files/${kind}?v=${Date.now()}`;
    await Profile.findOneAndUpdate(
      {},
      { $set: { [PROFILE_FIELD[kind]]: url } },
      { upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ url });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
