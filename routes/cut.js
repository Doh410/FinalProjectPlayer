const express = require("express");
const router = express.Router();
const Player = require("../models/Player");

// GET /cut
router.get("/", async (req, res) => {
  try {
    const players = await Player.find().sort({ lastName: 1 });
    res.render("cut", { players, message: null, error: null });
  } catch (err) {
    console.error(err);
    res.render("cut", { players: [], message: null, error: "Could not load players." });
  }
});

// POST /cut — cut by player name (text form) or by id (card button)
router.post("/", async (req, res) => {
  const { playerName, playerId } = req.body;

  try {
    let deleted = null;

    if (playerId) {
      deleted = await Player.findByIdAndDelete(playerId);
    } else if (playerName && playerName.trim()) {
      const nameParts = playerName.trim().split(/\s+/);
      const query =
        nameParts.length === 1
          ? { $or: [{ firstName: new RegExp(nameParts[0], "i") }, { lastName: new RegExp(nameParts[0], "i") }] }
          : { firstName: new RegExp(nameParts[0], "i"), lastName: new RegExp(nameParts.slice(1).join(" "), "i") };

      deleted = await Player.findOneAndDelete(query);
    }

    const players = await Player.find().sort({ lastName: 1 });

    if (deleted) {
      const name = `${deleted.firstName} ${deleted.lastName}`;
      res.render("cut", { players, message: `${name} has been cut from your lineup.`, error: null });
    } else {
      res.render("cut", { players, message: null, error: "Player not found in your lineup." });
    }
  } catch (err) {
    console.error(err);
    const players = await Player.find().sort({ lastName: 1 });
    res.render("cut", { players, message: null, error: "Something went wrong." });
  }
});

module.exports = router;
