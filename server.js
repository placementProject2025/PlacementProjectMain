require('dotenv').config();
const mongodbConnection = require('./config/db');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const shortListRoute = require('./routes/ShortListRoutes');
const companyRoute = require('./routes/companyRoute');
const studentRoute = require('./routes/studentRoute');
const adminRoutes = require("./routes/AdminloginRoute");
const authRoutes = require("./routes/loginRoute");
const { MongoClient } = require('mongodb');
const finalCompanyRoute = require('./routes/FinalCompanyRoute');


const app = express();

app.use(cors());
app.use(bodyParser.json());

const uri = process.env.URL;
const client = new MongoClient(uri);

let isConnected = false;

async function connectToMongo() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
    console.log("✅ Connected to MongoDB cluster");
  }
}

app.get("/databases", async (req, res) => {
  try {
    const dbs = await client.db().admin().listDatabases();
    const filtered = dbs.databases
      .filter((db) => !["admin", "local", "config"].includes(db.name))
      .map((db, idx) => {
        const match = db.name.match(/batch-(\d{4})/); 
        let startYear = "Unknown";
        let endYear = "Unknown";

        if (match) {
          endYear = match[1]; 
          startYear = (parseInt(endYear) - 4).toString(); 
        }

        return {
          id: idx + 1,
          name: db.name,
          startYear,
          endYear,
        };
      })
      .sort((a, b) => parseInt(b.endYear) - parseInt(a.endYear))
      .slice(0, 7)                            
      .map((db, idx) => ({
        id: idx + 1,
        name: db.name,
        startYear: db.startYear,
        endYear: db.endYear
      }));

    res.json(filtered);
  } catch (err) {
    console.error("Error listing databases:", err);
    res.status(500).send("Failed to fetch database list");
  }
});

app.get('/getdbprevious' , async (req , res) => {
    const {year} = req.query;
   if (!year) return res.status(400).json({ error: "Year is required" });

  try {
    const conn = await mongodbConnection(year);
    const collections = await conn.db.listCollections().toArray();

    const names = collections.map((col) => col.name);
    res.json({ year, collections: names });
  } catch (err) {
    console.error("❌ Error fetching collections:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.use('/api/student', studentRoute);
app.use('/api/company', companyRoute);
app.use('/api/shortlist', shortListRoute);
app.use('/api/finalcompany', finalCompanyRoute);
app.use('/api/admin', adminRoutes);
app.use("/api/auth", authRoutes);

app.listen(5000, () => {
  console.log('🚀 Server running at http://localhost:5000');
});
