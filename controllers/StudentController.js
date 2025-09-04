const XLSX = require("xlsx");
const mongodbConnection = require("../config/db");
const studentModel = require("../models/Student");

const uploadExcel = async (req, res) => {
  try {
    const year = req.body.year;
    console.log("Year:", year);

    if (!req.file || !year) {
      return res.status(400).send("❌ File or year missing");
    }
    req.app.locals.dbYear = year;

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[1]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const docs = rows.slice(1).map((r) => {
        const dobStr = r[6]?.toString().trim();
        let dob = null;

        if (dobStr && (dobStr.includes(".") || dobStr.includes("-"))) {
          const separator = dobStr.includes(".") ? "." : "-";
          const [dd, mm, yyyy] = dobStr.split(separator);
          if (dd && mm && yyyy) {
            const parsedDate = new Date(`${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`);
            if (!isNaN(parsedDate)) {
              dob = parsedDate;
            }
          }
        }

        return {
          studentRegisterNumber: r[1],
          studentName: r[2],
          studentDegree: r[3],
          studentBranch: r[4],
          studentGender: r[5],
          studentDOB: dob, 
          studentTenthPercentage: r[7],
          studentTwelthPercentage: r[8],
          studentDiploma: r[9],
          studentUGCGPA: r[10],
          studentCurrentArrear: r[11],
          studentMobileNumber: r[12],
          studentEmailID: r[13],
          studentCollegeName: r[14],
          studentGraduationYear: r[15],
          studentHistoryOfArrears:
            (typeof r[16] === 'string' && r[16].toLowerCase() === 'na') ? 0 :
            (isNaN(r[16]) || r[16] === null || r[16] === undefined) ? 0 :
            Number(r[16]),
          studentPlacementInterest: r[17],
        };
      }).filter((d) => d && d.studentRegisterNumber && d.studentName);


    const conn = await mongodbConnection(year);
    const Student = studentModel(conn);
    const start = Date.now();

    const BATCH_SIZE = 50;
    let insertedDocs = [];
    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = docs.slice(i, i + BATCH_SIZE);
      const operations = batch.map(doc => ({ insertOne: { document: doc } }));
      insertedDocs = insertedDocs.concat(batch);
      await Student.bulkWrite(operations);
    }
    console.log("⏱️ Time taken:", (Date.now() - start) / 1000, "s");

    res.json({
      inserted: insertedDocs.length,
      students: insertedDocs
    });
  } catch (e) {
    console.error("❌ Upload Error:", e.message);
    res.status(500).send("Server error");
  }
};

const getStudentInformation = async (req, res) => {
  try {
    const year = req.query.year || req.app.locals.dbYear;

    if (!year) {
      return res.status(400).json({ error: "❌ Missing graduation year" });
    }

    const conn = await mongodbConnection(year);
    const Student = studentModel(conn); 

    const students = await Student.find({}); 
    res.status(200).json(students); 
  } catch (error) {
    console.error("❌ Fetch error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  uploadExcel,
  getStudentInformation,
};

