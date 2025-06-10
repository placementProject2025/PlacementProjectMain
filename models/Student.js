const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentRegisterNumber:{ type: Number, required: true, unique: true },
  studentName:{ type: String, required: true },
  studentDegree:{ type: String, required: true },
  studentBranch:{ type: String, required: true },
  studentGender:{ type: String, enum: ["Male", "Female", "Other"], required: true },
  studentDOB:{type: Date},
  studentTenthPercentage:{ type: Number, required: true, min: 0, max: 100 },
  studentTwelthPercentage:{ type: String },
  studentDiploma:{ type: String },
  studentUGCGPA:{ type: Number, required: true, min: 0, max: 10 },
  studentMobileNumber:{ type: Number, required: true },
  studentEmailID:{ type: String, required: true },
  studentCollegeName:{ type: String, required: true },
  studentGraduationYear:{ type: Number, required: true },
  studentHistoryOfArrears:{ type: Number, required: true, min: 0 },
  studentPlacementInterest:{ type: String, required: true },
}, { timestamps: true }); 


module.exports = (conn) => conn.model("Student", studentSchema);