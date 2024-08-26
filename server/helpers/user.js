const mongoose = require('mongoose');
const User = mongoose.model('User');
const { sendEmailTemplate } = require('./mailer.js');

module.exports = {
    createUser,
};

async function createUser (data, options) {
    const user = new User(data);
    user.companyID = 'COMPID';

    let userPassword;
    if (options.sendPassword) {
        const generatePassword = require('password-generator');
        userPassword = generatePassword();
        user.password = userPassword;
    }

    await user.save();

    if (options.sendPassword) {
        const recipient = {
            userName: user.userName,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            userPassword,
        };

        await sendEmailTemplate('newUserAndPassword', [recipient], 'email', 'Welcome to Urungi');
    }

    return user;
}
