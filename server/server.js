require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error("MONGO_URI and JWT_SECRET are required in .env");
  process.exit(1);
}

const app = express();
app.set("trust proxy", 1);

// cross-origin: the React site (another domain) must be allowed to show images/PDF served here
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: (process.env.CLIENT_URL || "").split(",").map((s) => s.trim()),
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/files", require("./routes/files"));
app.use("/api/skills", require("./routes/crud")(require("./models/Skill")));
app.use("/api/projects", require("./routes/crud")(require("./models/Project")));
app.use(
  "/api/education",
  require("./routes/crud")(require("./models/Education"))
);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

app.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }
  if (err.name === "MulterError") {
    const msg = err.code === "LIMIT_FILE_SIZE" ? "File too large (max 5MB)" : err.message;
    return res.status(400).json({ message: msg });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid id" });
  }
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
