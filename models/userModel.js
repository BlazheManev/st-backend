const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = mongoose.Schema({
    ime: String,
    priimek: String,
    email: String,
    dan: [{
        datum: Date,
        vhodi: [String],
        izhodi: [String]
    }],
    hash : String, 
    salt : String 
});

module.exports = mongoose.model('User', userSchema);
