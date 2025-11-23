const mongoose = require("mongoose");
const finalSelectedSchema = require("../models/FinalSelected.js");
const studentModel = require("../models/Student.js");
const companyModel = require("../models/Company.js");
const mongodbConnection = require("../config/db.js");
const shortListModel = require("../models/ShortList");

const setCompanyAsFinal = async (req, res) => {
  try {
    const { studentId, companyId} = req.body;
    const conn = await mongodbConnection(req.query.year || req.app.locals.dbYear || req.body.year);
    const FinalSelected = conn.model("FinalSelected", finalSelectedSchema.schema);
    const Shortlist = conn.model("shortList", shortListModel.schema); 

    if (!studentId || !companyId) {
      return res.status(400).json({
        error: "studentId and companyId are required"
      });
    }

    const shortlist = await Shortlist.findOne({ studentId, companyId });

    let studentRole = "Selected";

    if (shortlist && shortlist.studentRole) {
      studentRole = shortlist.studentRole;
    }

    console.log("🎯 ROLE FETCHED FROM SHORTLIST:", studentRole);

    const existing = await FinalSelected.findOne({ studentId });

    if (existing) {
      existing.companyId = companyId;
      existing.studentRole = studentRole;
      await existing.save();

      return res.status(200).json({
        message: "Final company updated for the student.",
        updated: existing,
      });
    }

    const final = await FinalSelected.create({ studentId, companyId , studentRole});
    res.status(201).json({
      message: "Final selection created successfully.",
      created: final,
    });

  } catch (error) {
    console.error("Error creating/updating final selection:", error);
    res.status(500).json({ error: "Failed to set final selection" });
  }
};


const getFinalSelectedStudents = async (req, res) => {
  try {
    const conn = await mongodbConnection(req.query.year || req.app.locals.dbYear);

    const FinalSelected = conn.model("FinalSelected", finalSelectedSchema.schema);
    const Student = studentModel(conn);
    const Company = conn.model("Company", companyModel.schema);
    const finalSelectedStudents = await FinalSelected.find()
      .populate({ path: "studentId", model: Student })
      .populate({ path: "companyId", model: Company });

    res.status(200).json(finalSelectedStudents);
  } catch (error) {
    console.error("Error fetching final selections:", error);
    res.status(500).json({ error: "Failed to fetch final selections" });
  }
};


const getIndividualFinalSelection = async (req, res) => {
  try {
    const { studentId } = req.params; // studentId passed in the URL
    const conn = await mongodbConnection(req.query.year || req.app.locals.dbYear);
    const FinalSelected = conn.model("FinalSelected", finalSelectedSchema.schema);
    const Student = studentModel(conn);
    const Company = conn.model("Company", companyModel.schema);

    const finalSelection = await FinalSelected.findOne({ studentId })
      .populate({ path: "studentId", model: Student })
      .populate({ path: "companyId", model: Company });

    if (!finalSelection) {
      return res.status(404).json({ message: "No final selection found for this student" });
    }

    res.json(finalSelection);
  } catch (error) {
    console.error("Error fetching individual final selection:", error);
    res.status(500).json({ error: "Failed to fetch final selection" });
  }
};


module.exports = {
  setCompanyAsFinal,
  getFinalSelectedStudents,
  getIndividualFinalSelection,
};
