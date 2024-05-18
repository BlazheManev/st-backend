const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Connect to the database
const connectDB = require('./utilities/databaseConection');
connectDB();

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Include your routes
const userRoutes = require('./routes/userRoutes');
app.use('/users', userRoutes);

const staticRoutes = require('./routes/staticRoutes.js');
app.use(staticRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
