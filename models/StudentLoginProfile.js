const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
   
    studentRegisterNumber: {
      type: Number,             
      required: true,
      unique: true,
    },

   
    studentName:           { type: String, required: true },
    studentEmailID:        String,
    studentGraduationYear: { type: String, required: true },

    
    studentDegree:         String,
    studentBranch:         String,
    studentMobileNumber:   String,
  },
  { collection: "students", timestamps: true }
);


module.exports = (conn) =>
  conn.models.StudentLoginProfile ||
  conn.model("StudentLoginProfile", studentSchema);
