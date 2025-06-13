require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const companyRoute = require('./routes/companyRoute');
const studentRoute = require('./routes/studentRoute');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/student', studentRoute);
app.use('/api/company', companyRoute);

app.listen(5000, () => {
  console.log('🚀 Server running at http://localhost:5000');
});
