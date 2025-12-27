const mongoose = require("mongoose");
const mongodbConnection = require("../config/db.js");
const shortListModel = require("../models/ShortList.js");
const studentModel = require("../models/Student.js");
const companyModel = require("../models/Company.js");
const { Types } = require("mongoose");

const addShortlist = async (req, res) => {
  try {
    const year =
      req.body.year ||
      req.app.locals.dbYear ||
      req.params.year ||
      req.query.year ||
      req.headers["x-db-year"];

    const { companyId, studentIds } = req.body;

    if (!companyId) {
      return res.status(400).json({ error: "companyId is required" });
    }
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: "studentIds array is required" });
    }

    const conn = await mongodbConnection(year);
    const ShortList = conn.model("ShortList", shortListModel.schema);
    const Company = conn.model("Company", companyModel.schema);
   //const Student = studentModel(conn); 

    const company = await Company.findById(new Types.ObjectId(companyId));
    if (!company) return res.status(404).json({ message: "Company not found" });

    console.log("Building shortlist students...");

    const bulkOps = studentIds.map((id) => ({
      updateOne: {
        filter: { 
          studentId: new Types.ObjectId(id), 
          companyId: new Types.ObjectId(companyId) 
        },
        update: {
          $setOnInsert: {
            studentId: new Types.ObjectId(id),
            companyId: new Types.ObjectId(companyId),
            rounds: {},
            finalResult: false
          },
        },
        upsert: true,
      },
    }));

    if (bulkOps.length > 0) {
      await ShortList.bulkWrite(bulkOps, { ordered: false });
    }

    const shortListed = await ShortList.find({ companyId: new Types.ObjectId(companyId) })
      .populate("studentId"); 

    res.status(200).json(shortListed);
  } catch (error) {
    console.error("Error in addShortlist:", error);
    res.status(500).json({
      error: process.env.NODE_ENV === "development" ? error.message : "Server error",
    });
  }
};
const updateRounds = async (req, res) => {
  try {
    const year =
      req.app.locals.dbYear ||
      req.body.year ||
      req.query.year ||
      req.headers["x-db-year"];

    if (!year) {
      return res.status(400).json({ error: "Year is required" });
    }

    const updates = req.body.updates;
    const conn = await mongodbConnection(year);
    const ShortList = conn.model("shortList", shortListModel.schema);

    for (const update of updates) {
      const {
        studentId,
        companyId,
        rounds: newRounds,
        finalResult,
        studentRole,
      } = update;

      console.log("➡ Updating", studentId, companyId);

      const existing = await ShortList.findOne({
        studentId: new mongoose.Types.ObjectId(studentId),
        companyId: new mongoose.Types.ObjectId(companyId),
      });

      if (existing) {
        if (newRounds) {
          for (const [roundKey, status] of Object.entries(newRounds)) {
            existing.rounds.set(roundKey, status);
          }
        }

        if (typeof finalResult === "boolean") {
          existing.finalResult = finalResult;
        }

        if (studentRole) {
          existing.studentRole = studentRole;
        }

        await existing.save();
      } else {
        await ShortList.create({
          studentId,
          companyId,
          rounds: new Map(Object.entries(newRounds || {})),
          finalResult: !!finalResult,
          studentRole: studentRole || null,
        });
      }
    }

    res.status(200).json({ message: "Rounds updated successfully" });
  } catch (err) {
    console.error("🔥 Error updating rounds:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

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
    const ShortList = conn.model("ShortList", shortListModel.schema);
    const Student = studentModel(conn);

    const shortlisted = await ShortList.aggregate([
      {
        $match: { companyId: new mongoose.Types.ObjectId(companyId) }
      },
      {
        $group: {
          _id: "$studentId",
          latest: { $first: "$$ROOT" }
        }
      },
      {
        $replaceRoot: { newRoot: "$latest" }
      }
    ]);

    await ShortList.populate(shortlisted, {
      path: "studentId",
      model: Student
    });

    res.status(200).json(shortlisted);
  } catch (err) {
    console.error("Error fetching shortlisted students:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getSelectedCompanyIdsForStudent = async (req, res) => {
  try {
    const year =
      req.app.locals.dbYear ||
      req.query.year ||
      req.headers["x-db-year"];

    const studentId = req.params.id;

    if (!year || !studentId) {
      return res.status(400).json({ error: "Year and studentId are required" });
    }

    const conn = await mongodbConnection(year);
    const ShortList = conn.model("shortList", shortListModel.schema);

    const selected = await ShortList.find({
      studentId,
      finalResult: true
    }).select("companyId -_id"); 

    const companyIds = selected.map(entry => entry.companyId.toString());

    res.status(200).json(companyIds);
  } catch (err) {
    console.error("Error fetching student company IDs:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const deleteShortlistStudent = async (req , res) => {
  try {
    const year =
      req.app.locals.dbYear ||
      req.params.year ||
      req.query.year ||
      req.headers["x-db-year"];

    const companyId = req.params.companyId;

    if (!year || !companyId) {
      return res.status(400).json({ error: "Year and companyId are required" });
    }

    const conn = await mongodbConnection(year);
    const ShortList = conn.model("ShortList", shortListModel.schema);
    await ShortList.deleteMany({ companyId: new mongoose.Types.ObjectId(companyId) });
    res.status(200).json({ message : "success"});
    console.log(`Deleted shortlist docs for company ${companyId}`);  
  } catch (err) {
    console.error("Error deleting shortlist:", err);
  }
};

const getStudentCompaniesWithRounds = async (req, res) => {
  try {
    const year =
      req.app.locals.dbYear ||
      req.query.year ||
      req.params.year ||
      req.headers["x-db-year"];

    const studentId = req.params.id;
    if (!studentId) {
      return res.status(400).json({ error: "studentId is required" });
    }

    const conn = await mongodbConnection(year);
    const ShortList = conn.model("ShortList", shortListModel.schema);
    const Company = conn.model("Company", companyModel.schema);

    const companyColl = Company.collection.name;

    const agg = [
      { $match: { studentId: new mongoose.Types.ObjectId(studentId), companyId: { $ne: null } } },
      { $sort: { updatedAt: -1 } },
      { $group: { _id: "$companyId", latest: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$latest" } },
      { $lookup: { from: companyColl, localField: "companyId", foreignField: "_id", as: "company" } },
      { $unwind: { path: "$company", preserveNullAndEmptyArrays: false } },
      {
        $project: {
          _id: 0,
          companyId: "$company._id",
          companyName: "$company.name",
          rounds: "$rounds",
          finalResult: "$finalResult",
          studentRole: "$studentRole",
          updatedAt: "$updatedAt"
        }
      }
    ];

    const records = await ShortList.aggregate(agg);

    const companies = records.map((r) => ({
      companyId: r.companyId ? r.companyId.toString() : null,
      companyName: r.companyName || null,
      rounds: r.rounds && typeof r.rounds === 'object' ? (r.rounds instanceof Map ? Object.fromEntries(r.rounds) : r.rounds) : {},
      finalResult: !!r.finalResult,
      studentRole: r.studentRole || null,
      updatedAt: r.updatedAt
    }));


    return res.status(200).json({ studentId, companies });
  } catch (err) {
    console.error("Error in getStudentCompaniesWithRounds:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

const getFinalSelectedCompaniesForStudentByYear = async (req, res) => {
  try {
    const year = req.params.year || req.query.year || req.app.locals.dbYear || req.headers["x-db-year"];

    if (!year) {
      return res.status(400).json({ error: "Year required in params" });
    }

    const conn = await mongodbConnection(year);
    const ShortList = conn.model("ShortList", shortListModel.schema);
    const Company = conn.model("Company", companyModel.schema);

    const agg = [
      { $match: { finalResult: true } },
      { $sort: { updatedAt: -1 } },
      {
        $group: {
          _id: { studentId: "$studentId", companyId: "$companyId" },
          latest: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$latest" } },
      {
        $project: {
          _id: 0,
          studentId: "$studentId",
          companyId: "$companyId",
        },
      },
    ];

    const records = await ShortList.aggregate(agg);

    const results = records.map((r) => ({
      studentId: r.studentId ? r.studentId.toString() : null,
      companyId: r.companyId ? r.companyId.toString() : null,
    }));

    return res.status(200).json({ results });
  } catch (err) {
    console.error("Error in getFinalSelectedCompaniesForStudentByYear:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

const getPlacedStudentsReport = async (req, res) => {
  try {
    const year = req.app.locals.dbYear || req.query.year || req.headers["x-db-year"];
    if (!year) return res.status(400).json({ error: "Year is required" });

    const conn = await mongodbConnection(year);
    const Student = studentModel(conn);
    
    conn.model("shortList", shortListModel.schema); 
    conn.model("Company", companyModel.schema);

    const report = await Student.aggregate([
      {
        $lookup: {
          from: "shortlists", 
          let: { studentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$studentId", "$$studentId"] },
                    { $eq: ["$finalResult", true] }, 
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "companies",          
                localField: "companyId",   
                foreignField: "_id",       
                as: "companyInfo"          
              },
            },
            { $unwind: "$companyInfo" },
            {
              $project: {
                _id: 0,
                companyName: "$companyInfo.name", 
                role: "$studentRole" 
              }
            }
          ],
          as: "placedCompanies",
        },
      },
      {
        $match: {
          placedCompanies: { $ne: [] }
        }
      },
      {
        $project: {
          _id: 0,
          studentName: 1,
          studentRegisterNumber: 1,
          placedCompanies: 1
        },
      },
    ]);

    res.status(200).json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports = { updateRounds, getShortlisted , getSelectedCompanyIdsForStudent , addShortlist , deleteShortlistStudent , getStudentCompaniesWithRounds , getFinalSelectedCompaniesForStudentByYear , getPlacedStudentsReport};
