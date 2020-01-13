const config = require('config');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const LocalStrategy = require('passport-local').Strategy;

const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, done);
    });

    passport.use(new LocalStrategy({
        usernameField: 'userName',
        passwordField: 'password'
    },
    function (username, password, done) {
        User.isValidUserPassword(username, password, done);
    }));

    if (config.has('google')) {
        passport.use(new GoogleStrategy({
            clientID: config.get('google.clientID'),
            clientSecret: config.get('google.clientSecret'),
            scope: ['profile', 'email'],
            callbackURL: config.get('google.callbackURL')
        },
        function (req, accessToken, refreshToken, profile, done) {
            User.findOrCreateGoogleUser(profile, done);
        }
        ));
    }
};
