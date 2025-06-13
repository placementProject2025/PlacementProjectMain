const express = require('express');
const router = express.Router();
const { addcompany, showAllcompanies, deletecompany } = require('../controllers/CompanyController');

router.post('/addcompany', addcompany);
router.get('/showAllcompanies', showAllcompanies);
router.delete('/deletecompany/:id', deletecompany);

module.exports = router;
