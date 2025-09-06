const express = require("express");
const router = express.Router();

const {
  updateRounds,
  getShortlisted,
  getSelectedCompanyIdsForStudent,
  addShortlist,
  deleteShortlistStudent
} = require("../controllers/shortListController");

router.post("/addshortlist", addShortlist);
router.put("/update-rounds", updateRounds);
router.get("/getshortlist/:year/:companyId", getShortlisted);  
router.get("/:id/companies", getSelectedCompanyIdsForStudent);
router.delete("/deleteshortlist/:year/:companyId" , deleteShortlistStudent);

module.exports = router;
