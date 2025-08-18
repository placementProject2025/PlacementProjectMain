const express = require("express");
const router = express.Router();

const {
  handleCompanyClick,
  updateRounds,
  getShortlisted,
  getSelectedCompanyIdsForStudent
} = require("../controllers/shortListController");


router.post("/addshortlist", handleCompanyClick);

router.put("/update-rounds", updateRounds);

router.get("/getshortlist/:year/:companyId", getShortlisted);  

router.get("/:id/companies", getSelectedCompanyIdsForStudent);

module.exports = router;
