const express = require("express");
const auth = require("../middleware/auth");
const { stripMeta } = require("../utils/clean");

// Public: GET. Admin only (JWT): POST, PUT, DELETE.
module.exports = (Model, sort = { order: 1, createdAt: 1 }) => {
  const router = express.Router();

  router.get("/", async (req, res, next) => {
    try {
      res.json(await Model.find().sort(sort));
    } catch (err) {
      next(err);
    }
  });

  router.post("/", auth, async (req, res, next) => {
    try {
      res.status(201).json(await Model.create(stripMeta(req.body)));
    } catch (err) {
      next(err);
    }
  });

  router.put("/:id", auth, async (req, res, next) => {
    try {
      const doc = await Model.findByIdAndUpdate(req.params.id, stripMeta(req.body), {
        new: true,
        runValidators: true,
      });
      if (!doc) return res.status(404).json({ message: "Not found" });
      res.json(doc);
    } catch (err) {
      next(err);
    }
  });

  router.delete("/:id", auth, async (req, res, next) => {
    try {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted" });
    } catch (err) {
      next(err);
    }
  });

  return router;
};
