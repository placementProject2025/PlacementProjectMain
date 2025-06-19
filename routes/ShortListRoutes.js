const express = require("express");
const router = express.Router();

const {
  handleCompanyClick,
  updateRounds,
  getShortlisted
} = require("../controllers/shortListController");


router.post("/addshortlist", handleCompanyClick);

router.put("/update-rounds", updateRounds);

router.get("/getshortlist/:year/:companyId", getShortlisted);  


module.exports = router;
