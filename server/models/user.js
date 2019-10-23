const mongoose = require('mongoose');
const hash = require('../util/hash');

const userSchema = new mongoose.Schema({
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
});

if (!userSchema.options.toObject) userSchema.options.toObject = {};
userSchema.options.toObject.transform = function (doc, user, options) {
    delete user.salt;
    delete user.hash;
    delete user.hash_verify_account;
    delete user.hash_change_password;
};

userSchema.statics.createTheUser = function (req, res, userData, done) {
    var User = this;
    if (!userData.userName) {
        done({ result: 0, msg: "'Username' is required." });
        return;
    }

    User.findOne({ userName: userData.userName, companyID: req.user.companyID }, {}, function (err, user) {
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

userSchema.statics.isValidUserPassword = function (username, password, done) {
    this.findOne({ $or: [{ userName: username }, { email: username }], status: 'active' }, function (err, user) {
        if (err) return done(err);
        if (!user) return done(null, false, { message: 'Username or password incorrect' });

        hash(password, user.salt, function (err, hash) {
            if (err) return done(err);
            if (hash.toString() === user.hash || password === user.hash + user.salt) {
                return done(null, user);
            } else {
                done(null, false, { message: 'Username or password incorrect' });
            }
        });
    });
};

userSchema.statics.findOrCreateGoogleUser = function (profile, done) {
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

userSchema.methods.isAdmin = function () {
    return this.roles.includes('ADMIN');
};

module.exports = mongoose.model('User', userSchema);
