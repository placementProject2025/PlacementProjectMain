const express = require("express");
const router = express.Router();

const {
  updateRounds,
  getShortlisted,
  getSelectedCompanyIdsForStudent,
  getStudentCompaniesWithRounds,
  getFinalSelectedCompaniesForStudentByYear,
  addShortlist,
  deleteShortlistStudent,
  studentRoleUpdate
} = require("../controllers/shortListController");

router.post("/addshortlist", addShortlist);
router.put("/update-rounds", updateRounds);
router.get("/getshortlist/:year/:companyId", getShortlisted);  
router.get("/:id/companies", getSelectedCompanyIdsForStudent);
router.get("/:id/companies-rounds", getStudentCompaniesWithRounds);
router.get("/final-selected-students/:year", getFinalSelectedCompaniesForStudentByYear);
router.delete("/deleteshortlist/:year/:companyId" , deleteShortlistStudent);
router.put("/student-role-update" , studentRoleUpdate);

module.exports = router;