var mongoose = require('mongoose')
    , LocalStrategy = require('passport-local').Strategy
    , FacebookStrategy = require('passport-facebook').Strategy
    , TwitterStrategy = require('passport-twitter').Strategy
    , GoogleStrategy = require('passport-google').Strategy
    , RememberMeStrategy = require('passport-remember-me').Strategy
    //, User = mongoose.model('User');

var Users = connection.model('Users'); //require('../../models/users');
var Configurations = connection.model('Configurations'); //require('../../models/configurations');

module.exports = function (passport) {



    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        Users.findOne({ _id: id }, function (err, user) {
            if (user) {
                user = user.toObject();

                if (user.company_id) {
                    user['companyID'] = user.company_id;

                    var Companies = connection.model('Companies');

                    Companies.findOne({companyCode: user.companyID}, function(err, company){
                        if (company) {
                            user['companyData'] = company;
                        }

                        done(err, user);
                    });
                }
                else {
                    done(err, user);
                }
            }
            else {
                done(err, user);
            }
        });
    });

    passport.use(new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password'
        },
        function(username, password, done) {
            Users.isValidUserPassword(username, password, done);
        }));

    passport.use(new RememberMeStrategy(
        function(token, done) {
            Users.findOne({accessToken: token},{}, function (err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false); }
                return done(null, user);
            });
        },
        function(user, done) {
            var token = ((Math.random()*Math.pow(36,10) << 0).toString(36)).substr(-8);
            Users.update({
                "_id" : user.id
            }, {
                $set: {
                    "accessToken" : token
                }
            }, function (err) {
                if (err) { return done(err); }
                return done(null, token);
            });
        }
    ));
    /*passport.use(new FacebookStrategy({
            clientID: config.facebook.clientID,
            clientSecret: config.facebook.clientSecret,
            callbackURL: config.facebook.callbackURL
        },
        function(accessToken, refreshToken, profile, done) {
            Users.findOrCreateFaceBookUser(profile, done);
        }));*/
    Configurations.getConfiguration('facebook-client-id', function(configuration){
        var facebookClientId = configuration.value;

        if (facebookClientId)
        Configurations.getConfiguration('facebook-client-secret', function(configuration){
            var facebookClientSecret = configuration.value;

            passport.use(new FacebookStrategy({
                    clientID: facebookClientId,
                    clientSecret: facebookClientSecret,
                    callbackURL: config.facebook.callbackURL
                },
                function(accessToken, refreshToken, profile, done) {
                    Users.findOrCreateFaceBookUser(profile, done);
                }));
        });
    });

    /*passport.use(new TwitterStrategy({
            consumerKey: config.twitter.consumerKey,
            consumerSecret: config.twitter.consumerSecret,
            callbackURL: config.twitter.callbackURL
        },
        function(token, tokenSecret, profile, done) {
            Users.findOrCreateTwitterUser(profile, done);
        }
    ));*/
    Configurations.getConfiguration('twitter-consumer-key', function(configuration){
        var twitterConsumerKey = configuration.value;

        if (twitterConsumerKey)
        Configurations.getConfiguration('twitter-consumer-secret', function(configuration){
            var twitterConsumerSecret = configuration.value;

            passport.use(new TwitterStrategy({
                    consumerKey: twitterConsumerKey,
                    consumerSecret: twitterConsumerSecret,
                    callbackURL: config.twitter.callbackURL
                },
                function(token, tokenSecret, profile, done) {
                    Users.findOrCreateTwitterUser(profile, done);
                }));
        });
    });

    passport.use(new GoogleStrategy({
            returnURL: config.google.returnURL,
            realm: config.google.realm
        },
        function(identifier, profile, done) {
            Users.findOrCreateGoogleUser(profile, done);
        }
    ));
}


exports.isAuthenticated = function (req, res, next){
    if(req.isAuthenticated()){
        next();
    }else{
        res.redirect("/login");
    }
}

exports.userExist = function(req, res, next) {
    Users.count({
        email: req.body.email
    }, function (err, count) {
        if (count === 0) {
            next();
        } else {
            res.redirect("/signup");
        }
    });
}