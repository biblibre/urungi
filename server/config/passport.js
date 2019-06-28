const GoogleStrategy = require('passport-google-oauth20').Strategy;

const LocalStrategy = require('passport-local').Strategy;
const RememberMeStrategy = require('passport-remember-me').Strategy;

var Users = connection.model('Users'); // require('../../models/users');

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        if (user.companyID) {
            var Companies = connection.model('Companies');

            Companies.findOne({ companyCode: user.companyID }, function (err, company) {
                if (company) {
                    user['companyData'] = company;
                }
                done(err, user);
            });
        } else {
            done(null, user);
        }
    });

    passport.deserializeUser(function (user, done) {
        done(false, user);
    });

    passport.use(new LocalStrategy({
        usernameField: 'userName',
        passwordField: 'password'
    },
    function (username, password, done) {
        Users.isValidUserPassword(username, password, done);
    }));

    passport.use(new RememberMeStrategy(
        function (token, done) {
            Users.findOne({ accessToken: token }, {}, function (err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false); }
                return done(null, user);
            });
        },
        function (user, done) {
            var token = ((Math.random() * Math.pow(36, 10) << 0).toString(36)).substr(-8);
            Users.updateOne({
                '_id': user.id
            }, {
                $set: {
                    'accessToken': token
                }
            }, function (err) {
                if (err) { return done(err); }
                return done(null, token);
            });
        }
    ));

    if (config.has('google')) {
        passport.use(new GoogleStrategy({
            clientID: config.get('google.clientID'),
            clientSecret: config.get('google.clientSecret'),
            scope: ['profile', 'email'],
            callbackURL: config.get('google.callbackURL')
        },
        function (req, accessToken, refreshToken, profile, done) {
            Users.findOrCreateGoogleUser(profile, done);
        }
        ));
    }
};
