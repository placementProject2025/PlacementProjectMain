const mongoose = require("mongoose");

const ShortListSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    rounds: {
        round1: { type: Boolean, default: false },
        round2: { type: Boolean, default: false },
        round3: { type: Boolean, default: false },
        finalResult: { type: Boolean, default: false }
    }
}, { timestamps: true });

module.exports = mongoose.model("shortList" , ShortListSchema);