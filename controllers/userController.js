var UserModel = require('../models/userModel.js');
var crypto = require('crypto'); 
const { validatePassword } = require('../utilities/passwordUtility'); // Import the validatePassword function

/**
 * userController.js
 *
 * @description :: Server-side logic for managing users.
 */
module.exports = {

    /**
     * userController.list()
     */
    list: async function (req, res) {
        try {
            const Users = await UserModel.find();
            return res.json(Users);
        } catch (err) {
            return res.status(500).json({
                message: 'Error when getting User.',
                error: err
            });
        }
    }, 

    /**
     * userController.show()
     */
    show: async function (req, res) {
        var id = req.params.id;
    
        try {
            const user = await UserModel.findOne({_id: id});
    
            if (!user) {
                return res.status(404).json({
                    message: 'No such User'
                });
            }
    
            return res.json(user);
        } catch (err) {
            return res.status(500).json({
                message: 'Error when getting User.',
                error: err
            });
        }
    },    

    /**
     * userController.create()
     */
    create: async function (req, res) {
        try {
            // Generating a unique salt for a new user
            var salt = crypto.randomBytes(16).toString('hex'); 
            console.log(req.body)
            console.log(req.body.password)
            // Hashing user's password with the salt
            var hash = crypto.pbkdf2Sync(req.body.password, salt, 1000, 64, 'sha512').toString('hex'); 
      
            var User = new UserModel({
                ime: req.body.ime,
                priimek: req.body.priimek,
                email: req.body.email,
                dan: req.body.dan, // Expecting an array of objects with datum, vhodi, izhodi
                hash: hash,  
                salt: salt   
            });
    
            // Saving the new user to the database
            const savedUser = await User.save();
            return res.status(201).json(savedUser);
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: 'Error when creating User',
                error: err
            });
        }
    },

    /**
     * userController.update()
     */
    update: async function (req, res) {
        var id = req.params.id;
    
        try {
            const user = await UserModel.findOne({_id: id});  // Use 'user' consistently
            if (!user) {
                return res.status(404).json({
                    message: 'No such User'
                });
            }
    
            user.ime = req.body.ime ? req.body.ime : user.ime;
            user.priimek = req.body.priimek ? req.body.priimek : user.priimek;
            user.dan = req.body.dan ? req.body.dan : user.dan;
            user.email = req.body.email ? req.body.email : user.email;
    
            const updatedUser = await user.save();  
            return res.json(updatedUser);
    
        } catch (err) {
            console.error(err); 
            return res.status(500).json({
                message: 'Error when updating User.',
                error: err.message  
            });
        }
    },
    
    /**
     * userController.login()
     */
    login: async function (req, res) {
        try {
            const user = await UserModel.findOne({ 
                $or: [{ username: req.body.username }, { email: req.body.email }]
            });

            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }

            if (validatePassword(user, req.body.password)) {
                // Password is correct
                return res.status(200).json({
                    message: "Login successful",
                    user: { username: user.username, email: user.email }
                    //TODO :@BLAZHE  Here you can also generate a token or session for the authenticated user
                });
            } else {
                // Password is incorrect
                return res.status(401).json({ message: "Login failed" });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: 'Error when trying to login',
                error: err
            });
        }
    },  

    /**
     * userController.remove()
     */
    remove: async function (req, res) {
        var id = req.params.id;
    
        try {
            await UserModel.findByIdAndDelete(id);
            return res.status(204).json();
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: 'Error when deleting the User.',
                error: err
            });
        }
    },
 
    /**
     * userController.recordEntryOrExit()
     */
    recordEntryOrExit: async function (req, res) {
        try {
            const userId = req.params.id; // assuming you're passing the user's ID as a parameter
            const type = req.body.type; // expecting "vhod" or "izhod"
            const currentTime = new Date();
            const currentDate = currentTime.toISOString().split('T')[0]; // format as YYYY-MM-DD
            const currentTimeString = currentTime.toTimeString().split(' ')[0]; // format as HH:MM:SS
    
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
    
            // Check if entry for current date exists
            let dateEntry = user.dan.find(entry => entry.datum.toISOString().split('T')[0] === currentDate);
    
            if (dateEntry) {
                // Date exists, update vhodi or izhodi
                if (type === 'vhod') {
                    dateEntry.vhodi.push(currentTimeString);
                } else if (type === 'izhod') {
                    dateEntry.izhodi.push(currentTimeString);
                }
            } else {
                // Date doesn't exist, create new date entry
                const newEntry = {
                    datum: currentDate,
                    vhodi: type === 'vhod' ? [currentTimeString] : [],
                    izhodi: type === 'izhod' ? [currentTimeString] : []
                };
                user.dan.push(newEntry);
            }
    
            await user.save();
            return res.status(200).json(user);
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                message: 'Error when updating entry/exit',
                error: err
            });
        }
    }    
};
