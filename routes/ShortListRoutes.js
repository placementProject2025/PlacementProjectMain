const express = require("express");
const router = express.Router();

const {
  handleCompanyClick,
  updateRounds,
  getShortlisted,
  getSelectedCompanyIdsForStudent,
  addShortlist
} = require("../controllers/shortListController");


router.post("/addshortlist", addShortlist);

router.put("/update-rounds", updateRounds);

router.get("/getshortlist/:year/:companyId", getShortlisted);  

router.get("/:id/companies", getSelectedCompanyIdsForStudent);

module.exports = router;
