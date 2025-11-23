const express = require("express");
const router = express.Router();

const {
  updateRounds,
  getShortlisted,
  getSelectedCompanyIdsForStudent,
  getStudentCompaniesWithRounds,
  addShortlist,
  deleteShortlistStudent,
  getFinalSelectedCompaniesForStudentByYear
} = require("../controllers/shortListController");

router.post("/addshortlist", addShortlist);
router.put("/update-rounds", updateRounds);
router.get("/getshortlist/:year/:companyId", getShortlisted);  
router.get("/:id/companies", getSelectedCompanyIdsForStudent);
router.get("/:id/companies-rounds", getStudentCompaniesWithRounds);
router.delete("/deleteshortlist/:year/:companyId" , deleteShortlistStudent);
router.get("/final-selected-students/:year", getFinalSelectedCompaniesForStudentByYear);

module.exports = router;
