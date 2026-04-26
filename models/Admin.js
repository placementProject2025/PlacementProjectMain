// models/Admin.js
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  id: String,
  password: String
});

module.exports = mongoose.model("Admin", adminSchema, "credentials");
