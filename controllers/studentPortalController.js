const mongoose = require("mongoose");
const mongodbConnection = require("../config/db");
const getStudentModel = require("../models/Student");
const shortListModel = require("../models/ShortList");
const companyModel = require("../models/Company");
const finalSelectedModel = require("../models/FinalSelected");

// GET /api/student-portal/profile
exports.getProfile = async (req, res) => {
    try {
        const { studentId, year } = req;
        const conn = await mongodbConnection(year);
        const Student = getStudentModel(conn);

        const student = await Student.findById(studentId).select("-__v");
        if (!student) return res.status(404).json({ message: "Student not found" });

        res.status(200).json(student);
    } catch (err) {
        console.error("Student Profile Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// GET /api/student-portal/courses
exports.getEnrolledCourses = async (req, res) => {
    try {
        const { studentId, year } = req;
        const conn = await mongodbConnection(year);

        const ShortList = conn.models.shortList || conn.model("shortList", shortListModel.schema);
        const Company = conn.models.Company || conn.model("Company", companyModel.schema);
        const Student = getStudentModel(conn);

        const shortlisted = await ShortList.find({ studentId })
            .populate({ path: "companyId", model: Company })
            .lean();

        const courses = shortlisted
            .filter((entry) => entry.companyId)
            .map((entry) => ({
                companyId: entry.companyId._id,
                companyName: entry.companyId.name,
                position: entry.companyId.position,
                interviewDate: entry.companyId.interviewDate,
                finalResult: entry.finalResult,
                role: entry.studentRole,
            }));

        res.status(200).json(courses);
    } catch (err) {
        console.error("Enrolled Courses Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// GET /api/student-portal/progress
exports.getProgress = async (req, res) => {
    try {
        const { studentId, year } = req;
        const conn = await mongodbConnection(year);

        const ShortList = conn.models.shortList || conn.model("shortList", shortListModel.schema);
        const Company = conn.models.Company || conn.model("Company", companyModel.schema);
        const FinalSelected = conn.models.FinalSelected || conn.model("FinalSelected", finalSelectedModel.schema);
        const Student = getStudentModel(conn);

        // Get all shortlisted companies with rounds
        const shortlisted = await ShortList.find({ studentId })
            .populate({ path: "companyId", model: Company })
            .lean();

        // Get the final selected company (if any)
        const finalSelection = await FinalSelected.findOne({ studentId })
            .populate({ path: "companyId", model: Company })
            .lean();

        const progress = shortlisted
            .filter((entry) => entry.companyId)
            .map((entry) => {
                // Convert Map to plain object if needed
                let rounds = {};
                if (entry.rounds) {
                    if (entry.rounds instanceof Map) {
                        rounds = Object.fromEntries(entry.rounds);
                    } else if (typeof entry.rounds === "object") {
                        rounds = entry.rounds;
                    }
                }

                // Check if THIS company is the final selected one
                const isFinalSelected =
                    finalSelection &&
                    finalSelection.companyId &&
                    finalSelection.companyId._id.toString() === entry.companyId._id.toString();

                return {
                    companyName: entry.companyId.name,
                    position: entry.companyId.position,
                    interviewDate: entry.companyId.interviewDate,
                    totalRounds: entry.companyId.rounds,
                    rounds,
                    finalResult: entry.finalResult,
                    role: entry.studentRole,
                    // Final placement status
                    isFinalSelected: !!isFinalSelected,
                    finalStatus: isFinalSelected
                        ? "Selected"
                        : entry.finalResult
                            ? "Cleared All Rounds"
                            : "In Progress",
                };
            });

        // Summary stats
        const totalCompanies = progress.length;
        const selectedCount = progress.filter((p) => p.isFinalSelected).length;
        const clearedCount = progress.filter((p) => p.finalResult && !p.isFinalSelected).length;
        const pendingCount = progress.filter((p) => !p.finalResult).length;

        // Final selected company details
        const finalSelectedCompany = finalSelection && finalSelection.companyId
            ? {
                companyName: finalSelection.companyId.name,
                position: finalSelection.companyId.position,
                role: finalSelection.studentRole || "Selected",
            }
            : null;

        res.status(200).json({
            summary: {
                totalCompanies,
                selectedCount,
                clearedCount,
                pendingCount,
            },
            finalSelectedCompany,
            progress,
        });
    } catch (err) {
        console.error("Student Progress Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// GET /api/student-portal/all-companies
exports.getAllCompaniesWithPlacements = async (req, res) => {
    try {
        const { year } = req;
        const conn = await mongodbConnection(year);

        const Company = conn.models.Company || conn.model("Company", companyModel.schema);
        const ShortList = conn.models.shortList || conn.model("shortList", shortListModel.schema);
        const Student = getStudentModel(conn);

        // Get all companies
        const companies = await Company.find({}).lean();

        // For each company, find placed students (finalResult === true)
        const result = await Promise.all(
            companies.map(async (company) => {
                const placedEntries = await ShortList.find({
                    companyId: company._id,
                    finalResult: true,
                })
                    .populate({ path: "studentId", model: Student, select: "studentName studentRegisterNumber studentBranch" })
                    .lean();

                const placedStudents = placedEntries
                    .filter((e) => e.studentId)
                    .map((e) => ({
                        name: e.studentId.studentName,
                        registerNumber: e.studentId.studentRegisterNumber,
                        branch: e.studentId.studentBranch,
                        role: e.studentRole || "Selected",
                    }));

                return {
                    _id: company._id,
                    name: company.name,
                    position: company.position,
                    interviewDate: company.interviewDate,
                    description: company.description,
                    placedCount: placedStudents.length,
                    placedStudents,
                };
            })
        );

        res.status(200).json(result);
    } catch (err) {
        console.error("All Companies Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
