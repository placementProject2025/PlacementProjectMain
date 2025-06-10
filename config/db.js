const mongoose = require("mongoose");

const mongodbConnection = async (year) => {
  const dbname = `batch-${year}`;
  const uri = `mongodb+srv://vcetplacement:placementvcet@placementproject.kmrgs5s.mongodb.net/${dbname}?retryWrites=true&w=majority&appName=Maincluster`;

  return new Promise((resolve, reject) => {
    const connection = mongoose.createConnection(uri, {
      serverSelectionTimeoutMS: 30000, // 20s to connect
      socketTimeoutMS: 45000,          // 45s for inactivity
      maxPoolSize: 10,// wait up to 30 seconds
    });

    connection.once("open", () => {
      console.log(`✅ Connected to MongoDB database: ${dbname}`);
      resolve(connection);
    });

    connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
      reject(err);
    });
  });
};

module.exports = mongodbConnection;
