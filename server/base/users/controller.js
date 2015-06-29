//var Users = require('../models/users');
var Users = connection.model('Users');

/* USERS */

exports.adminUsersFindAll = function(req,res){
    Users.adminFindAll(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.adminUsersFindOne = function(req,res){
    Users.adminFindOne(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.adminUsersCreate = function(req,res){
    Users.adminCreate(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.adminUsersUpdate = function(req,res){
    Users.adminEdit(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.adminUsersDelete = function(req,res){
    Users.adminDelete(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.adminUsersSetStatus = function(req,res){
    Users.adminSetStatus(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.register = function(req,res){
    Users.findOne({ email: body.email}, function (err, findUser) {
        if(findUser==null){
            Users.signup(req, function(err, msg){
                if(err) throw err;
                res.send(200, msg);
            });
        }else{
            res.send(200, 'Username already in use');
        }
    });
};

exports.verify = function(req,res){
    var Recaptcha = require('recaptcha').Recaptcha;

    var body = req.body
    body.remoteip = req.connection.remoteAddress;

    var PUBLIC_KEY  = '6LfCTtcSAAAAAHKk6pJCx7xClJSmJul6mLv1nKBZ',
        PRIVATE_KEY = '6LfCTtcSAAAAANNM2bM4WNXE6MzVkhRszfF2gz0J';

    var recaptcha = new Recaptcha(PUBLIC_KEY, PRIVATE_KEY, body);

    recaptcha.verify(function(success, error_code) {
        if (success) {
            Users.verify(req, function(err, user){
                if(err) throw err;
                if(!user) res.send(200, {result: 0, msg: 'Invalid URL'});

                req.logIn(user, function(err) {
                    if (err) { return next(err); }
                });

                res.send(200, {result: 1, msg: 'Verification complete'});
            });
        }
        else {
            res.send(200, {result: 0, msg: 'Invalid Captcha'});
        }
    });
};

exports.rememberPassword = function(req,res){
    var body = req.body;
    var url = 'http://'+req.headers.host+'/';

    Users.findOne({ email: body.email }, function (err, findUser) {
        if(findUser){
            Users.rememberPassword(body.email, url, function(result){
                serverResponse(req, res, 200, result);
            });
        }else{
            res.send(200, {result: 0, msg: 'Email not registered'});
        }
    });
};

exports.changePassword = function(req,res){
    var body = req.body;

    Users.findOne({ hash_change_password: body.hash }, function (err, findUser) {
        if(findUser){
            Users.changePassword(req, function(result){
                serverResponse(req, res, 200, result);
            });
        }else{
            res.send(200, {result: 0, msg: 'Invalid hash'});
        }
    });
};

exports.usersGetUser = function(req,res){
    Users.getUser(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.usersCreateUser = function(req,res){
    Users.createUser(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.usersUpdateUser = function(req,res){
    Users.editUser(req.body.id, req.body, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.usersGetProfile = function(req,res){
    Users.getProfile(req.user._id, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.usersUpdateProfile = function(req,res){
    Users.editProfile(req.user._id, req.body, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.logout = function(req,res){
    req.session.loggedIn = false;
    req.session= null;
    res.end()
};