const mongoose = require("mongoose");

const ShortListSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },
  rounds: {
    type: Map,         
    of: Boolean,        
    default: {}
  },
  
  finalResult: {
    type: Boolean,
    default: false   
  },
  
  studentRole : {
    type: String,
    default: null,
  }
}, { timestamps: true });

module.exports = mongoose.model("shortList", ShortListSchema);
