const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  apiId: { type: Number, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  position: { type: String, default: "N/A" },
  teamName: { type: String, default: "N/A" },
  teamAbbr: { type: String, default: "N/A" },
  jerseyNumber: { type: String, default: "N/A" },
  college: { type: String, default: "N/A" },
  country: { type: String, default: "N/A" },
  addedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Player", playerSchema);
