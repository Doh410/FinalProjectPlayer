const express = require("express");
const router = express.Router();
const Player = require("../models/Player");

// GET /lineup
router.get("/", async (req, res) => {
  try {
    const players = await Player.find().sort({ addedAt: -1 });
    res.render("lineup", { players });
  } catch (err) {
    console.error(err);
    res.render("lineup", { players: [] });
  }
});

module.exports = router;
