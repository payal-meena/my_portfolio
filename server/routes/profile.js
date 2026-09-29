const express = require("express");
const Profile = require("../models/Profile");
const auth = require("../middleware/auth");
const { stripMeta, flatten } = require("../utils/clean");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    res.json((await Profile.findOne()) || (await Profile.create({})));
  } catch (err) {
    next(err);
  }
});

router.put("/", auth, async (req, res, next) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      {},
      { $set: flatten(stripMeta(req.body)) },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
