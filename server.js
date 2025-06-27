require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const shortListRoute = require('./routes/ShortListRoutes');
const companyRoute = require('./routes/companyRoute');
const studentRoute = require('./routes/studentRoute');
const authRoutes = require("./routes/loginRoute");


const app = express();

app.use(cors());
app.use(bodyParser.json());


app.use('/api/student', studentRoute);
app.use('/api/company', companyRoute);
app.use('/api/shortlist', shortListRoute);
app.use("/api/auth", authRoutes);

app.listen(5000, () => {
  console.log('🚀 Server running at http://localhost:5000');
});
