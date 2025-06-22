const express = require('express');
const {uploadExcel , getStudentInformation} = require('../controllers/StudentController');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single("excel"), uploadExcel); 
router.get('/getStudentInfo' , getStudentInformation);

module.exports = router;