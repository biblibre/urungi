var mongoose = require('mongoose');
var hash = require('../../util/hash');

var usersSchema = new mongoose.Schema({
    name: String,
    username: String,
    password: String,
    company_id: String,
    companyName: String,
    status: Number,
    email: String,
    language: String,
    salt: String,
    hash: String,
    hash_verify_account: String,
    hash_change_password: String,
    change_password: Boolean,
    roles: [],
    filters: [],
    accessToken: String,
    startDate: {type: Date, default: Date.now },
    endDate: {type: Date},
    history: String,
    facebook: {
        id: String,
        email: String,
        name: String
    },
    twitter: {
        id: String,
        name: String
    },
    google: {
        email: String,
        name: String
    },
    last_login_date: {type: Date},
    last_login_ip: {type: String}
}, { collection: config.app.collectionsPrefix+'users' })

if (!usersSchema.options.toObject) usersSchema.options.toObject = {};
usersSchema.options.toObject.transform = function (doc, user, options) {
    delete user.salt;
    delete user.hash;
    delete user.hash_verify_account;
    delete user.hash_change_password;
}

// other virtual / static methods added to schema

usersSchema.statics.signup = function(req, done){
    var User = this, email = req.body.email, password = req.body.password;

    var Configurations = connection.model('Configurations');

    Configurations.getConfiguration(['users-registration', 'verification-method', 'logs-auth-module'], function(configurations){
        if (configurations['users-registration'] == 0) {
            done(null, "Registration not allowed");
        }
        else {
            hash(password, function(err, salt, hash){
                var crypto = require('crypto');
                var hash_verify_account = crypto.createHash('md5').update(email).digest('hex');

                if(err) throw err;
                // if (err) return done(err);
                User.create({
                    status : 0,
                    email : email,
                    salt : salt,
                    hash : hash,
                    hash_verify_account : hash_verify_account
                }, function(err, user){
                    if(err) throw err;

                    /*if (configurations['logs-auth-module'] == 1) {
                        saveToLog(req, 'New user: '+email, 104);
                    }*/
                    if (configurations['verification-method'] == 0) {
                        User.update({
                            "_id" : user._id
                        }, {
                            $set: {
                                "status" : 1
                            }
                        }, function (err) {
                            if(err) throw err;

                            done(null, "Registration complete");
                        });
                    }
                    else if (configurations['verification-method'] == 1) {
                        var postData = {
                            id: "52d66e87c6b91ae01f000009",
                            email: email,
                            tags: '{"VERIFYURL": "'+config.url+'login/#/verify/'+hash_verify_account+'/'+email+'"}'
                        };
                        sendCommunication(postData);

                        done(null, "Check your email for verification");
                    }
                });
            });
        }
    });
}

usersSchema.statics.verify = function(req, done){
    var email = req.body.email, hash = req.body.hash;
    this.findOne({email : email, hash_verify_account: hash}, function(err, user){
        if(err) return done(err);
        if(!user) return done(null, false, { message : 'Incorrect url.' });
        //update status 1
        user.status = 1;
        user.save(function (err) {
            if(err) return done(err);

            //var Configurations = connection.model('Configurations');

            //Configurations.getConfiguration('logs-auth-module', function(configuration){
                /*if (configuration.value == 1) {
                    saveToLog(req, 'User verified: '+user.email, 105);
                }*/
                return done(null, user);
            //});
        });
    });
}

usersSchema.statics.rememberPassword = function(email, url, done){
    var crypto = require('crypto');
    var hash_change_password = crypto.createHash('md5').update(email).digest('hex');

    var postData = {
        id: "52d66ea2c6b91ae01f00000a",
        email: email,
        tags: '{"CHANGEPWDURL": "'+url+'login/#/change-password/'+hash_change_password+'"}'
    };

    this.update({
        "email" : email
    }, {
        $set: {
            "hash_change_password" : hash_change_password
        }
    }, function (err) {
        if(err) throw err;

        sendCommunication(postData);

        done({result: 1, msg: "Check your email for instructions"});
    });
}

usersSchema.statics.changePassword = function(req, done){
    var User = this, data = req.body;
    if (!data.hash || !data.password) {
        done({result: 0, msg: "'hash' and 'password' is required."});
        return;
    }
    this.findOne({"hash_change_password" : data.hash},{},function(err, user){
        if(err) throw err;
        if (user) {
            hash(data.password, function(err, salt, hash){
                if(err) throw err;

                User.update({
                    "_id" : user._id
                }, {
                    $set: {
                        "salt" : salt,
                        "hash" : hash,
                        "hash_change_password" : null
                    }
                }, function (err) {
                    if(err) throw err;

                    var Configurations = connection.model('Configurations');

                    Configurations.getConfiguration('log-user-pwd-change', function(configuration){
                        if (configuration.value == 1) {
                            saveToLog(req, 'User password changed: '+user.email, 103);
                        }
                        done({result: 1, msg: "Password updated"});
                    });
                });
            });
        }
        else {
            done({result: 0, msg: "Invalid hash."});
        }
    });
}

usersSchema.statics.getUser = function(req, done){
    var lookFor = (req.query.id) ? req.query.id : req.query.username;

    if (!lookFor) {
        done({result: 0, msg: "'id' or 'username' is required."});
        return;
    }
    this.findOne({$or: [{"_id" : lookFor}, {"username" : lookFor}]},{},function(err, user){
        //if(err) throw err; Si no encuentra el id salta el error?
        if (!user) {
            done({result: 0, msg: "User not found."});
        }
        else {
            var Configurations = connection.model('Configurations');

            Configurations.findOne({"name": 'user-filters'},{},function(err, userFilters){
                if(err) throw err;
                if (!userFilters) userFilters = [];
                else userFilters = String(userFilters.value).split(',');

                done({result: 1, user: user.toObject(), filters: userFilters});
            });
        }
    });
}

usersSchema.statics.createUser = function(req, done){
    var User = this, data = req.body;

    if (!data.username) {
        done({result: 0, msg: "'username' is required."});
        return;
    }

    var Companies = connection.model('Companies');
    var Employees = connection.model('Employees');

    Companies.findOne({companyCode: req.user.company_id}, {}, function(err, company) {
        if (err) throw err;

        var userData = {"status": 1, "username": data.username};

        if (data.email) userData['email'] = data.email;
        if (company && company.defaultLanguage) userData['language'] = company.defaultLanguage;
        if (!data.email && data.addCompanyURL && company.companyURL) userData['username'] += '@'+company.companyURL;

        userData['company_id'] = req.user.company_id;
        userData['roles'] = ['52988ad4df1fcbc201000009'];

        User.findOne({"username" : userData.username },{},function(err, user){
            if(err) throw err;
            if (user) {
                done({result: 0, msg: "Username already in use."});
            }
            else {
                User.create(userData, function(err, user){
                    if(err) throw err;

                    if (data.employeeID) {
                        Employees.update({
                            "_id" : data.employeeID,
                            "companyID" : req.user.company_id
                        }, {
                            $set: {
                                "userID" : user._id
                            }
                        }, function (err, numAffected) {
                            if(err) throw err;

                            done({result: 1, msg: "User created.", user: user});
                        });
                    }
                    else {
                        done({result: 1, msg: "User created.", user: user});
                    }
                });
            }
        });
    });
}

usersSchema.statics.editUser = function(id, data, done){
    var User = this;
    if (!id || !data.username) {
        done({result: 0, msg: "'id' and 'username' is required."});
        return;
    }
    this.findOne({"username" : data.username, "_id": { $ne: id } },{},function(err, user){
        if(err) throw err;
        if (user) {
            done({result: 0, msg: "Username already in use."});
        }
        else {
            var userData = {"username" : data.username};

            if (data.filters) {
                userData['filters'] = data.filters;

                var Configurations = connection.model('Configurations');
                Configurations.adminAddFilters(data.filters);
            }
            if (data.email) userData['email'] = data.email;

            if (data.password) {
                hash(data.password, function(err, salt, hash){
                    if(err) throw err;

                    userData['salt'] = salt;
                    userData['hash'] = hash;

                    User.update({
                        "_id" : id
                    }, {
                        $set: userData
                    }, function (err) {
                        if(err) throw err;

                        done({result: 1, msg: "User updated."});
                    });
                });
            }
            else {
                User.update({
                    "_id" : id
                }, {
                    $set: userData
                }, function (err) {
                    if(err) throw err;

                    done({result: 1, msg: "User updated."});
                });
            }
        }
    });
}

usersSchema.statics.getProfile = function(id, done){
    if (!id) {
        done({result: 0, msg: "'id' is required."});
        return;
    }

    this.findOne({"_id" : id},{},function(err, user){
        //if(err) throw err; Si no encuentra el id salta el error?
        if (!user) {
            done({result: 0, msg: "User not found."});
        }
        else {
            if (user.roles) {
                var Roles = connection.model('Roles'); //require('../models/roles');

                Roles.find({"_id": {$in: user.roles}},{}, function(err, roles){
                    if(err) throw err;

                    user.roles = roles;

                    done({result: 1, profile: user.toObject()});
                });
            }
            else {
                done({result: 1, profile: user.toObject()});
            }
        }
    });
}

usersSchema.statics.editProfile = function(id, data, done){
    var User = this;

    if (!id || !data.language) {
        done({result: 0, msg: "'id' and 'language' is required."});
        return;
    }

    if (data.password) {
        hash(data.password, function(err, salt, hash){
            if(err) throw err;

            User.update({
                "_id" : id
            }, {
                $set: {
                    "language" : data.language,
                    "salt" : salt,
                    "hash" : hash,
                    "change_password" : false
                }
            }, function (err) {
                if(err) throw err;

                done({result: 1, msg: "Profile updated."});
            });
        });
    }
    else {
        User.update({
            "_id" : id
        }, {
            $set: {
                "language" : data.language
            }
        }, function (err) {
            if(err) throw err;

            done({result: 1, msg: "Profile updated."});
        });
    }
}

usersSchema.statics.isValidUserPassword = function(username, password, done) {
    this.findOne({$or:[ {'username': username}, {'email': username} ]}, function(err, user){
        // if(err) throw err;
        if(err) return done(err);
        if(!user) return done(null, false, { message : 'Incorrect user '+username });
        if(user.status == 0) return done(null, false, { message : 'User not verified '+username });
        hash(password, user.salt, function(err, hash){
            if(err) return done(err);
            if(hash == user.hash || password == user.hash+user.salt) {
                return done(null, user);
            }
            else {
                done(null, false, { message : 'Incorrect password ' });
            }
        });
    });
};

usersSchema.statics.getUserEmail = function(user_id, done) {
    this.findOne({"_id" : user_id}, function(err, user){
        if(err) throw err;
        if(!user) return false;
        done(user.email);
    });
};

usersSchema.statics.findOrCreateFaceBookUser = function(profile, done){
    var User = this;
    this.findOne({ 'facebook.id' : profile.id }, function(err, user){
        if(err) throw err;
        // if (err) return done(err);
        if(user){
            done(null, user);
        }else{
            User.create({
                status : 1,
                username : profile.emails[0].value,
                email : profile.emails[0].value,
                facebook : {
                    id:    profile.id,
                    email: profile.emails[0].value,
                    name:  profile.displayName
                }
            }, function(err, user){
                if(err) throw err;
                // if (err) return done(err);
                done(null, user);
            });
        }
    });
}

usersSchema.statics.findOrCreateTwitterUser = function(profile, done){
    var User = this;
    this.findOne({ 'twitter.id' : profile.id }, function(err, user){
        if(err) throw err;
        // if (err) return done(err);
        if(user){
            done(null, user);
        }else{
            User.create({
                status : 1,
                username : profile.id,
                //email : profile.emails[0].value, la API de twitter no devuelve el email https://dev.twitter.com/discussions/4019
                twitter : {
                    id:    profile.id,
                    name:  profile.displayName
                }
            }, function(err, user){
                if(err) throw err;
                // if (err) return done(err);
                done(null, user);
            });
        }
    });
}

usersSchema.statics.findOrCreateGoogleUser = function(profile, done){
    var User = this;
    this.findOne({ 'google.email' : profile.emails[0].value }, function(err, user){
        if(err) throw err;
        // if (err) return done(err);
        if(user){
            done(null, user);
        }else{
            User.create({
                status : 1,
                username : profile.emails[0].value,
                email : profile.emails[0].value,
                google : {
                    email: profile.emails[0].value,
                    name:  profile.displayName
                }
            }, function(err, user){
                if(err) throw err;
                // if (err) return done(err);
                done(null, user);
            });
        }
    });
}

// admin methods

usersSchema.statics.adminFindAll = function(req, done){
    var User = this, perPage = config.pagination.itemsPerPage, page = (req.query.page) ? req.query.page : 1;
    var find = {}, searchText = (req.query.search) ? req.query.search : false;

    if (searchText)
        find = {$or: [{username: {$regex : searchText}}, {email: {$regex : searchText}} ]};

    this.find(find,{salt: 0, hash: 0, hash_verify_account: 0}, {skip: (page-1)*perPage, limit: perPage}, function(err, users){
        if(err) throw err;

        User.count(find, function (err, count) {
            done({result: 1, page: page, pages: Math.ceil(count/perPage), users: users});
        });
    });
}

usersSchema.statics.adminFindOne = function(req, done){
    if (!req.query.id) {
        done({result: 0, msg: "'id' is required."});
        return;
    }
    this.findOne({"_id" : req.query.id},{},function(err, user){
        //if(err) throw err; Si no encuentra el id salta el error?
        if (!user) {
            done({result: 0, msg: "User not found."});
        }
        else {
            done({result: 1, user: user.toObject()});
        }
    });
}

usersSchema.statics.adminCreate = function(req, done){
    var User = this, data = req.body, filters = [];
    if (!data.username || !data.email || typeof data.status == 'undefined' || !data.language || !data.password) {
        done({result: 0, msg: "'status', 'username', 'email', 'language' and 'password' is required."});
        return;
    }
    this.findOne({"username" : data.username},{},function(err, user){
        if(err) throw err;
        if (user) {
            done({result: 0, msg: "Username already in use."});
        }
        else {
            User.findOne({"email" : data.email},{},function(err, user){
                if(err) throw err;
                if (user) {
                    done({result: 0, msg: "Email already in use."});
                }
                else {
                    filters = data.filters;

                    var Configurations = connection.model('Configurations');
                    Configurations.adminAddFilters(filters);

                    hash(data.password, function(err, salt, hash){
                        if(err) throw err;

                        User.create({
                            status : 1,
                            username: data.username,
                            company_id : data.company_id,
                            email : data.email,
                            language : data.language,
                            salt : salt,
                            hash : hash,
                            roles: data.roles,
                            filters : filters
                        }, function(err, user){
                            if(err) throw err;

                            done({result: 1, msg: "User created", user: user.toObject()});
                        });
                    });
                }
            });
        }
    });
}

usersSchema.statics.adminEdit = function(req, done){
    var User = this, data = req.body, filters = [];
    if (!data.id || !data.username || typeof data.status == 'undefined' || !data.email || !data.language) {
        done({result: 0, msg: "'id', 'username', 'status', 'email' and 'language' is required."});
        return;
    }
    this.findOne({"username" : data.username, "_id": { $ne: data.id } },{},function(err, user){
        if(err) throw err;
        if (user) {
            done({result: 0, msg: "Username already in use."});
        }
        else {
            User.findOne({"email" : data.email, "_id": { $ne: data.id } },{},function(err, user){
                if(err) throw err;
                if (user) {
                    done({result: 0, msg: "Email already in use."});
                }
                else {
                    if (typeof data.filters === 'string') {
                        filters.push(JSON.parse(data.filters));
                    }
                    else {
                        for (var i in data.filters)
                            filters.push(JSON.parse(data.filters[i]));
                    }

                    var Configurations = connection.model('Configurations');
                    Configurations.adminAddFilters(filters);

                    if (data.password) {
                        hash(data.password, function(err, salt, hash){
                            if(err) throw err;

                            User.update({
                                "_id" : data.id
                            }, {
                                $set: {
                                    "username" : data.username,
                                    "company_id" : data.company_id,
                                    "status" : data.status,
                                    "email" : data.email,
                                    "language" : data.language,
                                    "salt" : salt,
                                    "hash" : hash,
                                    "roles" : data.roles,
                                    "filters" : filters
                                }
                            }, function (err, numAffected) {
                                if(err) throw err;

                                done({result: 1, msg: numAffected+" users updated."});
                            });
                        });
                    }
                    else {
                        User.update({
                            "_id" : data.id
                        }, {
                            $set: {
                                "username" : data.username,
                                "company_id" : data.company_id,
                                "status" : data.status,
                                "email" : data.email,
                                "language" : data.language,
                                "roles" : data.roles,
                                "filters" : filters
                            }
                        }, function (err, numAffected) {
                            if(err) throw err;

                            done({result: 1, msg: numAffected+" users updated."});
                        });
                    }
                }
            });
        }
    });
}

usersSchema.statics.adminDelete = function(req, done){
    if (!req.params.id) {
        done({result: 0, msg: "'id' is required."});
        return;
    }
    this.remove({
        "_id" : req.params.id
    }, function (err, numAffected) {
        if(err) throw err;

        done({result: 1, msg: numAffected+" users deleted."});
    });
}

usersSchema.statics.adminSetStatus = function(req, done){
    var data = req.body;
    if (!data.id || typeof data.status == 'undefined') {
        done({result: 0, msg: "'id' and 'status' is required."});
        return;
    }
    this.update({
        "_id" : data.id
    }, {
        $set: {
            "status" : data.status
        }
    }, function (err, numAffected) {
        if(err) throw err;

        done({result: 1, msg: "Status updated.", id: data.id, status: data.status});
    });
}

var Users = connection.model('Users', usersSchema);
module.exports = Users;