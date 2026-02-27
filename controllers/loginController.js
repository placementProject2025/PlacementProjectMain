const jwt = require("jsonwebtoken");
const mongodbConnection = require("../config/db.js");
const getStudentModel = require("../models/Student.js");
const getShortListModel = require("../models/ShortList.js");
const getCompanyModel = require("../models/Company.js");

exports.loginStudent = async (req, res) => {
  const { registerNumber, dob: dobStr, year } = req.body;
  console.log("➡️ Login body:", { registerNumber, year });

  if (!registerNumber || !dobStr || !year) {
    return res.status(400).json({ message: "registerNumber, dob, and year are required" });
  }

  try {

    const conn = await mongodbConnection(year);
    const Student = getStudentModel(conn);
    const student = await Student.findOne({ studentRegisterNumber: Number(registerNumber) });
    if (!student) {
      return res.status(401).json({ message: "Student not found" });
    }
    let dob = null;
    const sep = dobStr.includes(".") ? "." : "-";
    const [dd, mm, yyyy] = dobStr.split(sep);
    if (dd && mm && yyyy) {
      dob = new Date(`${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`);
    }

    const isDOBMatch =
      dob &&
      new Date(student.studentDOB).toISOString().split("T")[0] === dob.toISOString().split("T")[0];

    if (!isDOBMatch) {
      return res.status(401).json({ message: "Invalid credentials (DOB mismatch)" });
    }
    const token = jwt.sign(
      { studentId: student._id, year, role: 'student' },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "1h" }
    );
    res.status(200).json({ token, role: 'student', profile: student });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getStudentProfile = async (req, res) => {
  try {
    const { studentId, year } = req; // Set by JWT middleware
    const conn = await mongodbConnection(year);
    const Student = getStudentModel(conn);

    const student = await Student.findById(studentId).select("-__v");
    if (!student) return res.status(404).json({ message: "Student not found" });

    res.status(200).json(student);
  } catch (err) {
    console.error("Profile Fetch Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAttendedCompanies = async (req, res) => {
  try {
    const { studentId, year } = req;
    const conn = await mongodbConnection(year);

    const ShortList = conn.model("shortList", getShortListModel.schema);
    const Company = conn.model("Company", getCompanyModel.schema);

    const shortlisted = await ShortList.find({ studentId })
      .populate("companyId")
      .select("companyId");

    const companyNames = shortlisted
      .map(entry => entry.companyId?.name)
      .filter(Boolean);

    res.status(200).json({ companyNames });
  } catch (err) {
    console.error("Attended Companies Fetch Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getSelectedCompanies = async (req, res) => {
  try {
    const { studentId, year } = req;
    const conn = await mongodbConnection(year);

    const ShortList = conn.model("shortList", getShortListModel.schema);
    const Company = conn.model("Company", getCompanyModel.schema);

    const shortlisted = await ShortList.find({
      studentId,
      finalResult: true
    })
      .populate("companyId")
      .select("companyId");

    const companyNames = shortlisted
      .map(entry => entry.companyId?.name)
      .filter(Boolean);

    res.status(200).json({ companyNames });
  } catch (err) {
    console.error("Selected Companies Fetch Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
