const express = require("express");
const studentAuth = require("../middleware/studentAuth");
const {
    getProfile,
    getEnrolledCourses,
    getProgress,
    getAllCompaniesWithPlacements,
} = require("../controllers/studentPortalController");

const router = express.Router();

router.get("/profile", studentAuth, getProfile);
router.get("/courses", studentAuth, getEnrolledCourses);
router.get("/progress", studentAuth, getProgress);
router.get("/all-companies", studentAuth, getAllCompaniesWithPlacements);

module.exports = router;
