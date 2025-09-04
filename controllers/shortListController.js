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
   const Student = studentModel(conn); // 👈 add this

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
            finalResult: false,
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
      const { studentId, companyId, rounds: newRounds, finalResult } = update;

       
      console.log("➡ Updating", studentId, companyId); 
      
      const existing = await ShortList.findOne({
        studentId: new mongoose.Types.ObjectId(studentId),
        companyId: new mongoose.Types.ObjectId(companyId)
      });

      if (existing) {
        for (const [roundKey, status] of Object.entries(newRounds || {})) {
        
        existing.rounds.set(roundKey, status);
          
        }

        if (typeof finalResult === "boolean") {
          existing.finalResult = finalResult;
        }

        await existing.save();
      } else {
        await ShortList.create({
          studentId,
          companyId,
          rounds: new Map(Object.entries(newRounds || {})),
          finalResult: !!finalResult
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
    }).select("companyId -_id"); // Only return companyId

    const companyIds = selected.map(entry => entry.companyId.toString());

    res.status(200).json(companyIds);
  } catch (err) {
    console.error("Error fetching student company IDs:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};



module.exports = { updateRounds, getShortlisted , getSelectedCompanyIdsForStudent , addShortlist};


// const handleCompanyClick = async (req, res) => {
//   try {
//     const year =
//       req.body.year ||
//       req.app.locals.dbYear ||
//       req.params.year ||
//       req.query.year ||
//       req.headers["x-db-year"];

//     const { companyId } = req.body;

//     if (!companyId) {
//       return res.status(400).json({ error: "companyId is required" });
//     }

//     const conn = await mongodbConnection(year);
//     const ShortList = conn.model("shortList", shortListModel.schema);
//     const Student = studentModel(conn);
//     const Company = conn.model("Company", companyModel.schema);

//     const company = await Company.findById(companyId);
//     if (!company) return res.status(404).json({ message: "Company not found" });

//     let maxArrears = 0;

//     if (
//       company.historyofArrears &&
//       !["no", "none", "0", "nan"].includes(
//         company.historyofArrears.toString().trim().toLowerCase()
//       )
//     ) {
//       maxArrears = Number(company.historyofArrears);
//     }

//     const eligibleStudents = await Student.aggregate([
//         {
//           $addFields: {
//             twelfthNumeric: {
//               $cond: [
//                 {
//                   $or: [
//                     { $eq: ["$studentTwelthPercentage", "NA"] },
//                     { $eq: ["$studentTwelthPercentage", null] },
//                     { $eq: ["$studentTwelthPercentage", ""] }
//                   ]
//                 },
//                 0,
//                 { $toDouble: "$studentTwelthPercentage" }
//               ]
//             },
//             diplomaNumeric: {
//               $cond: [
//                 {
//                   $or: [
//                     { $eq: ["$studentDiploma", "NA"] },
//                     { $eq: ["$studentDiploma", null] },
//                     { $eq: ["$studentDiploma", ""] }
//                   ]
//                 },
//                 0,
//                 { $toDouble: "$studentDiploma" }
//               ]
//             }
//           }
//         },
//         {
//           $match: {
//             studentTenthPercentage: { $gte: company.tenth },
//             $or: [
//               { twelfthNumeric: { $gte: company.twelfth } },
//               { diplomaNumeric: { $gte: company.diploma } }
//             ],
//             studentUGCGPA: { $gte: company.cgpa },
//             studentHistoryOfArrears: { $lte: maxArrears },
//             studentCurrentArrears: { $lte: company.currentArrears }
//           }
//         }
//       ]);


//     for (const student of eligibleStudents) {
//       const already = await ShortList.findOne({
//         studentId: student._id,
//         companyId: companyId,
//       });
//       if (!already) {
//         await ShortList.create({
//           studentId: student._id,
//           companyId: companyId,
//           rounds: new Map(),
//           finalResult: false,
//         });
//       }
//     }

//     const shortListed = await ShortList.find({ companyId }).populate("studentId");
//     res.status(200).json(shortListed);
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// };