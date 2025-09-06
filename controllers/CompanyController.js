const mongoose = require('mongoose');
const mongodbConnection = require('../config/db.js');
const CompanyModel = require('../models/Company.js');

const addcompany= async (req, res) => {
  try {
    console.log("Received Company Data:", req.body);   
    const conn = await mongodbConnection(req.query.year || req.app.locals.dbYear);
    const Company = conn.model('Company', CompanyModel.schema);
    const newcompany = await Company.create(req.body);
    res.json(newcompany);
  } catch (err) {
    res.status(500).json({ error: "Failed to Insert data" });
  }
};

const showAllcompanies= async (req, res) => {
  try {
    const conn = await mongodbConnection(req.query.year || req.app.locals.dbYear);
    const Company = conn.model('Company', CompanyModel.schema);
    const companies = await Company.find();
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
};

const deletecompany=async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await mongodbConnection(req.query.year || req.app.locals.dbYear);
    const Company = conn.model('Company', CompanyModel.schema);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const deleted = await Company.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({ message: 'Company deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

module.exports={
    addcompany,
    showAllcompanies,
    deletecompany
};