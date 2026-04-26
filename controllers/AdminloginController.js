// controllers/AdminloginController.js
const mongoose = require("mongoose");
const connectAdminDB = require('../config/admindb.js');
const AdminModel = require('../models/Admin.js');

const adminLogin = async (req, res) => {
  try {
    const { adminId, password } = req.body;

    if (!adminId || !password) {
      return res.status(400).json({ ok: false, error: "Missing credentials" });
    }

    const adminConnection = await connectAdminDB();
    const Admin = adminConnection.model('Admin', AdminModel.schema);

    const admin = await Admin.findOne({
      id: { $regex: `^${adminId}$`, $options: "i" },
      password: password
    });


    if (admin) {
      return res.status(200).json({ ok: true });
    } else {
      return res.status(401).json({ ok: false, error: "Invalid credentials" });
    }

  } catch (err) {
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

module.exports = adminLogin;
