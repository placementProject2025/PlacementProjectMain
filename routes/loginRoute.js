const express = require("express");
const { loginStudent, getStudentProfile } = require("../controllers/loginController");
const verifyToken = require("../middleware/authMiddleware");
const {getAttendedCompanies,getSelectedCompanies } = require("../controllers/loginController");

const router = express.Router();


router.post("/login", loginStudent);
router.get("/profile", verifyToken, getStudentProfile);
router.get("/companies/attended", verifyToken, getAttendedCompanies);
router.get("/companies/selected", verifyToken, getSelectedCompanies);

module.exports = router;
