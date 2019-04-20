var mongoose = require('mongoose');
var hash = require('../../util/hash');

var usersSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    userName: String,
    password: String,
    companyID: String,
    status: String,
    email: String,
    language: String,
    salt: String,
    hash: String,
    hash_verify_account: String,
    hash_change_password: String,
    change_password: Boolean,
    roles: [],
    filters: [],
    contextHelp: [],
    dialogs: [],
    accessToken: String,
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    history: String,
    title: String,
    companyName: String,
    department: String,
    businessUnit: String,
    brand: String,
    unit: String,
    customFilter1: String,
    customFilter2: String,
    customFilter3: String,
    customFilter4: String,
    customFilter5: String,
    customFilter6: String,
    customFilter7: String,
    customFilter8: String,
    customFilter9: String,
    customFilter10: String,
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
    last_login_date: { type: Date },
    last_login_ip: { type: String },
    privateSpace: [],
    defaultDocument: { type: String },
    defaultDocumentType: { type: String },
    nd_trash_deleted: { type: Boolean },
    nd_trash_deleted_date: { type: Date },
    createdBy: { type: String },
    createdOn: { type: Date },
    companyData: {}
}, { collection: 'wst_Users' });

if (!usersSchema.options.toObject) usersSchema.options.toObject = {};
usersSchema.options.toObject.transform = function (doc, user, options) {
    delete user.salt;
    delete user.hash;
    delete user.hash_verify_account;
    delete user.hash_change_password;
};

usersSchema.statics.createTheUser = function (req, res, userData, done) {
    var User = this;
    if (!userData.userName) {
        done({ result: 0, msg: "'Username' is required." });
        return;
    }

    User.findOne({ 'userName': userData.userName, companyID: req.user.companyID }, {}, function (err, user) {
        if (err) throw err;
        if (user) {
            done({ result: 0, msg: 'userName already in use.' });
        } else {
            if (userData.pwd1) {
                hash(userData.pwd1, function (err, salt, hash) {
                    if (err) throw err;
                    userData.password = undefined;
                    userData.salt = salt;
                    userData.hash = hash;
                    userData.companyID = req.user.companyID;

                    User.create(userData, function (err, user) {
                        if (err) throw err;
                        done({ result: 1, msg: 'User created.', user: user });
                    });
                });
            } else {
                done({ result: 0, msg: "'No Password set for the new user." });
            }
        }
    });
};

usersSchema.statics.setViewedContextHelp = function (req, done) {
    var userID = req.user._id;

    this.findOne({ '_id': userID }, function (err, findUser) {
        if (err) { console.error(err); }

        if (findUser) {
            if (!findUser.contextHelp) { findUser.contextHelp = []; }
            var found = false;
            for (const i in findUser.contextHelp) {
                if (findUser.contextHelp[i] === req.query.contextHelpName) {
                    found = true;
                }
            }

            if (!found) {
                findUser.contextHelp.push(req.query.contextHelpName);
            }

            Users.updateOne({
                '_id': userID
            }, {
                $set: {
                    'contextHelp': findUser.contextHelp
                }
            }, function (err, numAffected) {
                if (err) throw err;

                done({ result: 1, msg: 'context Help dialogs updated.', items: findUser.contextHelp });
            });
        } else {
            done({ result: 0, msg: 'No user found, can´t update the user context help' });
        }
    });
};

usersSchema.statics.setStatus = function (req, done) {
    if (req.session.isWSTADMIN) {
        var userID = req.body.userID;
        var userStatus = req.body.status;

        if (!userID || typeof userID === 'undefined') {
            done({ result: 0, msg: "'id' and 'status' are required." });
            return;
        }
        this.findOne({ '_id': userID, 'companyID': req.user.companyID }, function (err, findUser) {
            if (err) { console.error(err); }

            if (findUser) {
                Users.updateOne({
                    '_id': userID
                }, {
                    $set: {
                        'status': userStatus
                    }
                }, function (err, numAffected) {
                    if (err) throw err;

                    done({ result: 1, msg: 'Status updated.' });
                });
            } else {
                done({ result: 0, msg: 'No user found for this company, can´t update the user status' });
            }
        });
    }
};

usersSchema.statics.isValidUserPassword = function (username, password, done) {
    this.findOne({ $or: [ { 'userName': username }, { 'email': username } ], status: 'active' }, function (err, user) {
        if (err) return done(err);
        if (!user) return done(null, false, { message: 'User' + ' ' + username + ' ' + 'does not exists or is inactive' });
        if (user.status === 0) return done(null, false, { message: 'User not verified ' + username });

        hash(password, user.salt, function (err, hash) {
            if (err) return done(err);
            if (hash.toString() === user.hash || password === user.hash + user.salt) {
                return done(null, user);
            } else {
                done(null, false, { message: 'Password do not match' });
            }
        });
    });
};

usersSchema.statics.findOrCreateGoogleUser = function (profile, done) {
    var User = this;
    this.findOne({ 'google.email': profile.emails[0].value }, function (err, user) {
        if (err) throw err;
        // if (err) return done(err);
        if (user) {
            done(null, user);
        } else {
            User.create({
                status: 1,
                username: profile.emails[0].value,
                companyID: 'COMPID',
                email: profile.emails[0].value,
                google: {
                    email: profile.emails[0].value,
                    name: profile.displayName
                }
            }, function (err, user) {
                if (err) throw err;
                // if (err) return done(err);
                done(null, user);
            });
        }
    });
};

var Users = connection.model('Users', usersSchema);
module.exports = Users;
