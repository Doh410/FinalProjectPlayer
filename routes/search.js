const express = require("express");
const router = express.Router();
const axios = require("axios");
const Player = require("../models/Player");

const API_KEY = process.env.BALLDONTLIE_API_KEY;
const BASE_URL = "https://api.balldontlie.io/v1";

router.get("/", (req, res) => {
  const added = req.query.added || null;
  const name = req.query.name ? decodeURIComponent(req.query.name) : "";
  res.render("search", { results: [], query: name, error: null, added });
});

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
    const parts = query.split(" ");
    const searchTerm = parts.pop();

    const response = await axios.get(`${BASE_URL}/players`, {
      headers: { Authorization: API_KEY },
      params: { search: searchTerm, per_page: 25 },
    });

    let results = response.data.data || [];

    if (parts.length > 0) {
      const firstName = parts.join(" ").toLowerCase();
      results = results.filter(p =>
        p.first_name.toLowerCase().includes(firstName)
      );
    }

    res.render("search", { results, query, error: null, added: null });
  } catch (err) {
    console.error("API error:", err.response?.status, err.message);

    if (err.response?.status === 429) {
      return res.render("search", {
        results: [],
        query,
        error: "Too many searches too fast — wait a few seconds and try again.",
        added: null,
      });
    }

    res.render("search", {
      results: [],
      query,
      error: "Could not reach the NBA API. Try a different name or check your API key.",
      added: null,
    });
  }
});

router.post("/add", async (req, res) => {
  const { apiId, firstName, lastName, position, teamName, teamAbbr, jerseyNumber, college, country } = req.body;

  try {
    const existing = await Player.findOne({ apiId: Number(apiId) });
    if (existing) {
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

module.exports = router;