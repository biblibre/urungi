var mongoose = require('mongoose')
    , LocalStrategy = require('passport-local').Strategy
    , RememberMeStrategy = require('passport-remember-me').Strategy


var Users = connection.model('Users'); //require('../../models/users');

module.exports = function (passport) {



    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        Users.findOne({ _id: id }, function (err, user) {
            if (user) {
                user = user.toObject();

                if (user.companyID) {

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
            usernameField: 'userName',
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
}


exports.isAuthenticated = function (req, res, next){
    if(req.isAuthenticated()){
        next();
    }else{
        console.log('the user is not authenticated...redirecting');
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
