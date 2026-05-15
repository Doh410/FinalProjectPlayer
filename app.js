require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes
const homeRouter = require("./routes/home");
const searchRouter = require("./routes/search");
const lineupRouter = require("./routes/lineup");
const cutRouter = require("./routes/cut");

app.use("/", homeRouter);
app.use("/search", searchRouter);
app.use("/lineup", lineupRouter);
app.use("/cut", cutRouter);

// 404 fallback
app.use((req, res) => {
  res.status(404).render("404");
});

app.listen(PORT, () => {
  console.log(`🏀 PlayerVault running on http://localhost:${PORT}`);
});
