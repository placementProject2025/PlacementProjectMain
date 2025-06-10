const mongoose = require('mongoose');

const stuScheme = new mongoose.Schema({
  stuid: { type: Number, required: true, unique: true },
  stuname: { type: String, required: true, unique: true },
});

module.exports = (conn) => conn.model("StudentPro", stuScheme);
