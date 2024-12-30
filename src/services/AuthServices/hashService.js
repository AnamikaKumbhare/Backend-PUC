// hashService.js

const bcrypt = require('bcryptjs'); // or bcrypt, depending on which library you're using

// Hash password
const hashPassword = (password) => {
    const saltRounds = 10;
    return bcrypt.hashSync(password, saltRounds); // Synchronously hash password
};

// Check password hash
const checkPasswordHash = (storedPassword, enteredPassword) => {
    return bcrypt.compareSync(enteredPassword, storedPassword); // Compare hashed passwords
};

module.exports = {
    hashPassword,
    checkPasswordHash,
};
