const crypto = require('crypto');

const validatePassword = (user, inputPassword) => {
    var hash = crypto.pbkdf2Sync(inputPassword, user.salt, 1000, 64, 'sha512').toString('hex'); 
    return user.hash === hash;
};

module.exports = {
    validatePassword,
};
