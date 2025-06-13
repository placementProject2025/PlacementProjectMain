// const XLSX = require("xlsx");
// const mongodbConnection = require("../config/db");
// const studentModel = require("../models/Student");

// const uploadExcel = async (req, res) => {
//   try {
//     const year = req.body.year;
//     console.log(year)
//     if (!req.file || !year) return res.status(400).send("File or year missing");

//     const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
//     const sheet = workbook.Sheets[workbook.SheetNames[1]];
//     const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

//     const docs = rows.slice(1).map((r, i)  => {
//       try {
//         const dobStr = r[6]?.toString().trim(); 
//         let dob = null;
//         let password = "";

//         if (dobStr && dobStr.includes(".")) {
//           const [dd, mm, yyyy] = dobStr.split(".");
//           dob = new Date(`${yyyy}-${mm}-${dd}`);
//           if (!isNaN(dob.getTime())) {
//             password = `${yyyy}${mm}${dd}`;
//           } else {
//             console.warn(`⚠️ Row ${i + 2}: Invalid date format "${dobStr}"`);
//             return null; // skip this row
//           }
//         } else {
//           console.warn(`⚠️ Row ${i + 2}: Missing or bad DOB format`);
//           return null;
//         }


//   return {
//     studentRegisterNumber: r[1],
//     studentName: r[2],
//     studentDegree: r[3],
//     studentBranch: r[4],
//     studentGender: r[5],
//     studentDOB: dob,
//     studentPassword: password,
//     studentTenthPercentage: r[7],
//     studentTwelthPercentage: r[8],
//     studentDiploma: r[9],
//     studentUGCGPA: r[10],
//     studentMobileNumber: r[12],
//     studentEmailID: r[13],
//     studentCollegeName: r[14],
//     studentGraduationYear: r[15],
//     studentHistoryOfArrears: r[16],
//     studentPlacementInterest: r[17],
//   };
// }).filter(d => d && d.studentRegisterNumber && d.studentName);


//     const conn = mongodbConnection(year);
//     const Student = studentModel(conn);
//     await Student.insertMany(docs);

//     res.json({ inserted: docs.length });
//   } catch (e) {
//     console.error(e);
//     res.status(500).send("Server error");
//   }
// };

// module.exports = uploadExcel;

// const XLSX = require("xlsx");
// const mongodbConnection = require("../config/db");
// const studentModel = require("../models/Student");

// const uploadExcel = async (req, res) => {
//   try {
//     const year = req.body.year;
//     console.log("Year:", year);

//     if (!req.file || !year) {
//       return res.status(400).send("❌ File or year missing");
//     }

//     const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
//     const sheet = workbook.Sheets[workbook.SheetNames[1]];
//     const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

//     const docs = rows.slice(1).map((r, i) => {
//       try {
//         const dobStrRaw = r[6];
//         const dobStr = dobStrRaw?.toString().trim();
//         let dob = null;
//         let password = "";

//         if (dobStr && (dobStr.includes(".") || dobStr.includes("-"))) {
//           const separator = dobStr.includes(".") ? "." : "-";
//           const [dd, mm, yyyy] = dobStr.split(separator);
//           if (dd && mm && yyyy) {
//             dob = new Date(`${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`);
//             if (!isNaN(dob.getTime())) {
//               password = `${yyyy}${mm.padStart(2, "0")}${dd.padStart(2, "0")}`;
//             } else {
//               console.warn(`⚠️ Row ${i + 2}: Invalid date "${dobStr}"`);
//               return null;
//             }
//           } else {
//             console.warn(`⚠️ Row ${i + 2}: Incomplete date "${dobStr}"`);
//             return null;
//           }
//         } else {
//           console.warn(`⚠️ Row ${i + 2}: Missing or invalid DOB format`);
//           return null;
//         }

//         return {
//           studentRegisterNumber: r[1],
//           studentName: r[2],
//           studentDegree: r[3],
//           studentBranch: r[4],
//           studentGender: r[5],
//           studentDOB: dob,
//           studentPassword: password,
//           studentTenthPercentage: r[7],
//           studentTwelthPercentage: r[8],
//           studentDiploma: r[9],
//           studentUGCGPA: r[10],
//           studentMobileNumber: r[12],
//           studentEmailID: r[13],
//           studentCollegeName: r[14],
//           studentGraduationYear: r[15],
//           studentHistoryOfArrears: r[16],
//           studentPlacementInterest: r[17],
//         };
//       } catch (err) {
//         console.error(`❌ Error parsing row ${i + 2}:`, err.message);
//         return null;
//       }
//     }).filter(
//       (d) => d && d.studentRegisterNumber && d.studentName
//     );

//     const conn = await mongodbConnection(year);
//     const Student = studentModel(conn);
//     await Student.insertMany(docs);

//     res.json({ inserted: docs.length });
//   } catch (e) {
//     console.error("❌ Upload Error:", e.message);
//     res.status(500).send("Server error");
//   }
// };

// module.exports = uploadExcel;

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
            dob = new Date(`${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`);
          }
        }

        return {
          studentRegisterNumber: r[1],
          studentName: r[2],
          studentDegree: r[3],
          studentBranch: r[4],
          studentGender: r[5],
          studentDOB: dob, // 👈 now correctly parsed as Date object
          studentTenthPercentage: r[7],
          studentTwelthPercentage: r[8],
          studentDiploma: r[9],
          studentUGCGPA: r[10],
          studentMobileNumber: r[12],
          studentEmailID: r[13],
          studentCollegeName: r[14],
          studentGraduationYear: r[15],
          studentHistoryOfArrears: r[16],
          studentPlacementInterest: r[17],
        };
      }).filter((d) => d && d.studentRegisterNumber && d.studentName);



    const conn = await mongodbConnection(year);
    const Student = studentModel(conn);
    const start = Date.now();

    const BATCH_SIZE = 50;
    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = docs.slice(i, i + BATCH_SIZE);
      const operations = batch.map(doc => ({ insertOne: { document: doc } }));
      await Student.bulkWrite(operations);
    }
    console.log("⏱️ Time taken:", (Date.now() - start) / 1000, "s");

    res.json({ inserted: docs.length });
  } catch (e) {
    console.error("❌ Upload Error:", e.message);
    res.status(500).send("Server error");
  }
};

module.exports = uploadExcel;

