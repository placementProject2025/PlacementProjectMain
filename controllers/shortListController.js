/*const mongoose = require('mongoose');
const mongodbConnection = require('../config/db.js');
const ShortListModel = require('../models/ShortList.js');
const CompanyModel = require('../models/Company.js');

const updateShortListRound = async (req, res) => {
  try {
    const { studentId, companyId, roundNumber } = req.body;
    const roundNum = Number(roundNumber);
    const year = req.app.locals.dbYear;

    if (!studentId || !companyId || !roundNum) {
      return res.status(400).json({ error: "studentId, companyId, and roundNumber are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ error: "Invalid studentId or companyId" });
    }

    const conn = await mongodbConnection(year);
    const ShortList = conn.model('shortList', ShortListModel.schema);
    const Company = conn.model('Company', CompanyModel.schema);

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    const totalRounds = company.rounds;

    if (roundNum < 1 || roundNum > totalRounds) {
      return res.status(400).json({ error: "Invalid round number" });
    }

    const roundField = `rounds.round${roundNum}`;

    // If current round is the last round, also set finalResult to true
    const updateFields = { [roundField]: true };
    if (roundNum === totalRounds) {
      updateFields['rounds.finalResult'] = true;
    }

    const shortListDoc = await ShortList.findOneAndUpdate(
      { studentId, companyId },
      { $set: updateFields },
      { new: true, upsert: true }
    );

    // If new document was created, initialize missing rounds
    if (shortListDoc.isNew) {
      let roundsObj = {};
      for (let i = 1; i <= totalRounds; i++) {
        roundsObj[`round${i}`] = false;
      }
      roundsObj[`round${roundNum}`] = true;

      if (roundNum === totalRounds) {
        roundsObj.finalResult = true;
      } else {
        roundsObj.finalResult = false;
      }

      shortListDoc.studentId = studentId;
      shortListDoc.companyId = companyId;
      shortListDoc.rounds = roundsObj;
      await shortListDoc.save();
    }

    res.json({ message: "Round updated successfully", data: shortListDoc });

  } catch (err) {
    console.error("Error updating shortList:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { updateShortListRound };


*/

const mongoose = require('mongoose');
const mongodbConnection = require('../config/db.js');
const ShortListModel = require('../models/ShortList.js');
const CompanyModel = require('../models/Company.js');
const StudentModel = require('../models/Student.js');

const updateShortListRound = async (req, res) => {
  try {
    const { studentId, companyId, roundNumber } = req.body;
    const roundNum = Number(roundNumber);
    const year = req.body.year || req.query.year || req.headers['x-db-year'] || req.app.locals.dbYear;

    if (!year) {
       return res.status(400).json({ error: "Year is required" });
     } 

    if (!studentId || !companyId || !roundNum) {
      return res.status(400).json({ error: "studentId, companyId, and roundNumber are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ error: "Invalid studentId or companyId" });
    }

    const conn = await mongodbConnection(year);
    const ShortList = conn.model('shortList', ShortListModel.schema);
    const Company = conn.model('Company', CompanyModel.schema);
    const Student = StudentModel(conn);

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    
    const student = await Student.findById(studentId);
    if (!student) {
       return res.status(404).json({ error: "Student not found" });
    }

    const totalRounds = company.rounds;

    if (roundNum < 1 || roundNum > totalRounds) {
      return res.status(400).json({ error: "Invalid round number" });
    }

    let shortListDoc = await ShortList.findOne({
      studentId: new mongoose.Types.ObjectId(studentId),
      companyId: new mongoose.Types.ObjectId(companyId)
    });

    if (!shortListDoc) {
      if (roundNum !== 1) {
        return res.status(400).json({ error: "You must complete round 1 first." });
      }

      let roundsObj = new Map();
      for (let i = 1; i <= totalRounds; i++) {
        roundsObj.set(`round${i}`, false);
      }
      roundsObj.set(`round${roundNum}`, true);

      shortListDoc = await ShortList.create({
        studentId,
        companyId,
        rounds: roundsObj
      });

      return res.status(200).json({ message: `Round ${roundNum} updated successfully.` });
    }

    // Validate previous round is completed
    if (roundNum > 1 && !shortListDoc.rounds.get(`round${roundNum - 1}`)) {
      return res.status(400).json({ error: `You must complete round ${roundNum - 1} first.` });
    }

    // Check if this round is already completed
    if (shortListDoc.rounds.get(`round${roundNum}`)) {
      return res.status(200).json({ message: `Round ${roundNum} is already completed.` });
    }

    // Update the current round
    shortListDoc.rounds.set(`round${roundNum}`, true);

    // Check if all rounds are completed
    let allRoundsCompleted = true;
    for (let i = 1; i <= totalRounds; i++) {
      if (!shortListDoc.rounds.get(`round${i}`)) {
        allRoundsCompleted = false;
        break;
      }
    }

    // Update finalResult if all rounds completed
    if (allRoundsCompleted) {
      shortListDoc.finalResult = true;
    }

    await shortListDoc.save();

    return res.status(200).json({
      message: `Round ${roundNum} updated successfully.`,
      finalResult: shortListDoc.finalResult
    });

  } catch (error) {
    console.error("Error updating shortList:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { updateShortListRound };
