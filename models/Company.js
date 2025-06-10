const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  description: { type: String, required: true },
  positionRecruiting: { type: String, required: true },
  tenthRequirePercentage: { type: Number, required: true, min: 0, max: 100 },
  twelthRequirePercentage: { type: Number, required: true, min: 0, max: 100 },
  cgpaRequired: { type: Number, required: true, min: 0, max: 10 },
  historyOfArrearsNeeded: { type: Number, required: true, min: 0 },
  currentArrearsNeeded: { type: Number, required: true, min: 0 },
  dateOfInterview: { type: Date, required: true }
});

module.exports = mongoose.model("Company" , companySchema);