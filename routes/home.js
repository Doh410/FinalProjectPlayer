const express = require("express");
const router = express.Router();
const Player = require("../models/Player");

// GET /
router.get("/", async (req, res) => {
  try {
    const lineupCount = await Player.countDocuments();
    const recentPlayers = await Player.find().sort({ addedAt: -1 }).limit(3);
    res.render("home", { lineupCount, recentPlayers });
  } catch (err) {
    console.error(err);
    res.render("home", { lineupCount: 0, recentPlayers: [] });
  }
});

module.exports = router;
