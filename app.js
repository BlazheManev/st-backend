const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');
app.use(express.json());
const path = require('path');

const userRoutes = require('./routes/UserRoutes'); 
const connectDB = require('./utilities/databaseConection'); 
const staticRoutes = require('./routes/staticRoutes.js'); //

connectDB()
app.use('/users', userRoutes);
app.use(staticRoutes);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});