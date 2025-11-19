const express = require('express');
const adminLogin = require("../controllers/AdminloginController.js");

const router = express.Router();

router.post("/login", adminLogin);

module.exports = router;
