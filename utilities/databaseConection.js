// db.js
const mongoose = require('mongoose');

const dbURI = 'mongodb+srv://blazhe:Feri123feri@cluster0.j4co85k.mongodb.net/ST';
const options = { useNewUrlParser: true, useUnifiedTopology: true };

const connectDB = async () => {
  try {
    await mongoose.connect(dbURI, options);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

module.exports = connectDB;
