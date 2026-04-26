const mongoose = require("mongoose");

let adminConnection = null; 

const connectAdminDB = async () => {
  const dbname = "adminpass";
  const uri = process.env.MONGO_URL.replace("{DBname}", dbname);

  if (adminConnection) {
    return adminConnection;
  }

  return new Promise((resolve, reject) => {
    const connection = mongoose.createConnection(uri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });

    connection.once("open", () => {
      console.log(`✅ Connected to MongoDB database: ${dbname}`);
      adminConnection = connection; // cache it
      resolve(connection);
    });

    connection.on("error", (err) => {
      console.error("❌ Admin DB connection error:", err);
      reject(err);
    });
  });
};

module.exports = connectAdminDB;
