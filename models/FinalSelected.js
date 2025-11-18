const mongoose = require("mongoose");

const finalSelectedSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true , unique: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  studentRole : { type: String, default: null },
}, { timestamps: true });


module.exports = mongoose.model("FinalSelected", finalSelectedSchema);