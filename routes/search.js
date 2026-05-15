const express = require("express");
const router = express.Router();
const axios = require("axios");
const Player = require("../models/Player");

const API_KEY = process.env.BALLDONTLIE_API_KEY;
const BASE_URL = "https://api.balldontlie.io/v1";

// GET /search
router.get("/", (req, res) => {
  res.render("search", { results: [], query: "", error: null, added: null });
});

// POST /search — search the BallDontLie API
router.post("/", async (req, res) => {
  const query = req.body.playerName ? req.body.playerName.trim() : "";
  if (!query) {
    return res.render("search", {
      results: [],
      query: "",
      error: "Please enter a player name.",
      added: null,
    });
  }

  try {
    const response = await axios.get(`${BASE_URL}/players`, {
      headers: { Authorization: API_KEY },
      params: { search: query, per_page: 10 },
    });

    const results = response.data.data || [];
    res.render("search", { results, query, error: null, added: null });
  } catch (err) {
    console.error("API error:", err.message);
    res.render("search", {
      results: [],
      query,
      error: "Could not reach the NBA API. Check your API key.",
      added: null,
    });
  }
});

// POST /search/add — save player to MongoDB lineup
router.post("/add", async (req, res) => {
  const { apiId, firstName, lastName, position, teamName, teamAbbr, jerseyNumber, college, country } = req.body;

  try {
    const existing = await Player.findOne({ apiId: Number(apiId) });
    if (existing) {
      // Player already on lineup — redirect with message
      return res.redirect(`/search?added=exists&name=${encodeURIComponent(firstName + " " + lastName)}`);
    }

    const player = new Player({
      apiId: Number(apiId),
      firstName,
      lastName,
      position: position || "N/A",
      teamName: teamName || "N/A",
      teamAbbr: teamAbbr || "N/A",
      jerseyNumber: jerseyNumber || "N/A",
      college: college || "N/A",
      country: country || "N/A",
    });

    await player.save();
    return res.redirect(`/search?added=yes&name=${encodeURIComponent(firstName + " " + lastName)}`);
  } catch (err) {
    console.error("Save error:", err.message);
    return res.redirect("/search?added=error");
  }
});

// GET /search?added=yes — show feedback banner after redirect
router.get("/", (req, res) => {
  res.render("search", { results: [], query: "", error: null, added: req.query.added || null });
});

module.exports = router;
