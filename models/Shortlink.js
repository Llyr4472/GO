const mongoose = require("mongoose");

const shortlinkSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true }, // e.g., "resume"
  destination: { type: String, required: true }, // e.g., "https://prashantgiri360.com.np/resume.pdf"
});

module.exports = mongoose.model("Shortlink", shortlinkSchema);