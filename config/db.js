const mongoose = require("mongoose");

const connections = {}; // Cache: year -> mongoose connection

const mongodbConnection = async (year) => {
  const dbname = `batch-${year}`;
  const uri = `mongodb+srv://vcetplacement:placementvcet@placementproject.kmrgs5s.mongodb.net/${dbname}?retryWrites=true&w=majority&appName=Maincluster`;

  // Return cached connection if exists
  if (connections[year]) {
    return connections[year];
  }

  return new Promise((resolve, reject) => {
    const connection = mongoose.createConnection(uri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });

    connection.once("open", () => {
      console.log(`✅ Connected to MongoDB database: ${dbname}`);
      connections[year] = connection; // cache it
      resolve(connection);
    });

    connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
      reject(err);
    });
  });
};

module.exports = mongodbConnection;

