const bcrypt = require('bcryptjs'); 

const hashPassword = (password) => {
    const saltRounds = 10;
    return bcrypt.hashSync(password, saltRounds);
};

const checkPasswordHash = (storedPassword, enteredPassword) => {
    return bcrypt.compareSync(enteredPassword, storedPassword); 
};

module.exports = {
    hashPassword,
    checkPasswordHash,
};
