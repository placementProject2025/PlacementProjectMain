const credentials = require("../Adminpass/credentials.json");

const adminLogin = async (req, res) => {
  try {
    const { adminId, password } = req.body;

    if (!adminId || !password) {
      return res.status(400).json({ ok: false, error: "Missing credentials" });
    }

    const admins = Array.isArray(credentials.admins)
      ? credentials.admins
      : [];

    const match = admins.find(
      (u) =>
        u.id &&
        typeof u.id === "string" &&
        u.password === password &&
        u.id.toLowerCase() === String(adminId).toLowerCase()
    );

    if (match) {
      return res.status(200).json({ ok: true });
    } else {
      return res.status(401).json({ ok: false, error: "Invalid credentials" });
    }
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

module.exports = adminLogin;
