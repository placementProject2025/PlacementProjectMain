const mongoose = require("mongoose");
const mongodbConnection = require("../config/db.js");
const shortListModel = require("../models/ShortList.js");
const studentModel = require("../models/Student.js");
const companyModel = require("../models/Company.js");

// Handle company click and filter eligible students
const handleCompanyClick = async (req, res) => {
  try {
    const year =
      req.body.year ||
      req.app.locals.dbYear ||
      req.params.year ||
      req.query.year ||
      req.headers["x-db-year"];

    const { companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({ error: "companyId is required" });
    }

    const conn = await mongodbConnection(year);
    const ShortList = conn.model("shortList", shortListModel.schema);
    const Student = studentModel(conn);
    const Company = conn.model("Company", companyModel.schema);

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    let maxArrears = 0;

    if (
      company.historyofArrears &&
      !["no", "none", "0", "nan"].includes(
        company.historyofArrears.toString().trim().toLowerCase()
      )
    ) {
      maxArrears = Number(company.historyofArrears);
    }

    const eligibleStudents = await Student.find({
      studentTenthPercentage: { $gte: company.tenth },
      studentTwelthPercentage: { $gte: company.twelfth },
      studentUGCGPA: { $gte: company.cgpa },
      studentHistoryOfArrears: { $lte: maxArrears },
    });

    for (const student of eligibleStudents) {
      const already = await ShortList.findOne({
        studentId: student._id,
        companyId: companyId,
      });
      if (!already) {
        await ShortList.create({
          studentId: student._id,
          companyId: companyId,
          rounds: new Map(),
          finalResult: false,
        });
      }
    }

    const shortListed = await ShortList.find({ companyId }).populate("studentId");
    res.status(200).json(shortListed);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update round selection
const updateRounds = async (req, res) => {
  try {
    const year =
      req.app.locals.dbYear ||
      req.body.year ||
      req.query.year ||
      req.headers["x-db-year"];
    const updates = req.body.updates;

    const conn = await mongodbConnection(year);
    const ShortList = conn.model("shortList", shortListModel.schema);

    for (const update of updates) {
      const existing = await ShortList.findOne({
        studentId: update.studentId,
        companyId: update.companyId,
      });

      if (existing) {
        for (const [roundKey, status] of Object.entries(update.rounds)) {
          existing.rounds.set(roundKey, status);
        }
        if (update.finalResult !== undefined) {
          existing.finalResult = update.finalResult;
        }
        await existing.save();
      }
    }

    res.status(200).json({ message: "Rounds updated successfully" });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ error: "Failed to update rounds" });
  }
};

// Get shortlisted students
const getShortlisted = async (req, res) => {
  try {
    const year =
      req.app.locals.dbYear ||
      req.params.year ||
      req.query.year ||
      req.headers["x-db-year"];

    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ error: "companyId is required" });
    }

    const conn = await mongodbConnection(year);
    const ShortList = conn.model("shortList", shortListModel.schema);
    const Student = studentModel(conn);

    const shortlisted = await ShortList.find({ companyId })
      .populate({ path: "studentId", model: Student })
      .sort({ createdAt: 1 });

    res.status(200).json(shortlisted);
  } catch (err) {
    console.error("Error fetching shortlisted students:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { handleCompanyClick, updateRounds, getShortlisted };
