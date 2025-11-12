const express = require("express");
const router = express.Router();
const {
  setCompanyAsFinal,
  getFinalSelectedStudents,
  getIndividualFinalSelection,
} = require("../controllers/FinalSelectedController.js");

router.post("/set-company-as-final", setCompanyAsFinal);
router.get("/get-final-company-for-a-student", getFinalSelectedStudents);
router.get("/getstudent-individual-final-company/:studentId", getIndividualFinalSelection);

module.exports = router;
