const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  position: { type: String, required: true },
  tenth: { type: Number, required: true, min: 0, max: 100 },
  twelfth: { type: Number , min: 0, max: 100 },
  diploma: { type: Number , min: 0, max: 100 },
  cgpa: { type: Number, required: true, min: 0, max: 100 },
  historyofArrears: { type: String, required: true },
  currentArrears: { type: String, required: true },
  interviewDate: { type: String, required: true },
  rounds: { type: Number, required: true, min: 0, max: 10 }
});

module.exports = mongoose.model("Company" , companySchema);
