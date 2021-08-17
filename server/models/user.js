const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    userName: String,
    companyID: String,
    status: { type: String, default: 'active' },
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
    createdBy: { type: mongoose.Schema.Types.ObjectId },
    createdOn: { type: Date, default: Date.now },
    companyData: {}
});

if (!userSchema.options.toObject) userSchema.options.toObject = {};
userSchema.options.toObject.transform = function (doc, user, options) {
    delete user.salt;
    delete user.hash;
    delete user.hash_verify_account;
    delete user.hash_change_password;
};

function generateSalt () {
    return crypto.randomBytes(128).toString('base64');
}

function hashPassword (password, salt) {
    return crypto.pbkdf2Sync(password, salt, 12000, 128, 'sha1');
}

userSchema.virtual('password').set(function (password) {
    const salt = generateSalt();
    const hash = hashPassword(password, salt);
    this.salt = salt;
    this.hash = hash;
});

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
                const user = new User(userData);
                user.password = userData.pwd1;
                userData.companyID = req.user.companyID;

                user.save().then(user => {
                    done({ result: 1, msg: 'User created.', user: user });
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

        const hash = hashPassword(password, user.salt);
        if (hash.toString() === user.hash) {
            return done(null, user);
        } else {
            done(null, false, { message: 'Username or password incorrect' });
        }
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

userSchema.methods.isActive = function () {
    return this.status === 'active';
};

userSchema.methods.getReports = function () {
    return this.model('Report').find({ owner: this._id });
};

userSchema.methods.getDashboards = function () {
    return this.model('Dashboard').find({ owner: this._id });
};

userSchema.methods.getRoles = function () {
    const roles = this.roles.filter(role => role !== 'ADMIN');

    return this.model('Role').find({ _id: { $in: roles } });
};

userSchema.methods.getPermissions = function () {
    const keys = ['reportsCreate', 'dashboardsCreate', 'exploreData', 'viewSQL'];
    if (this.isAdmin()) {
        const permissions = {};
        for (const key of keys) {
            permissions[key] = true;
        }

        return Promise.resolve(permissions);
    }

    return this.getRoles().then(roles => {
        const permissions = {};
        for (const role of roles) {
            for (const key of keys) {
                if (role[key]) {
                    permissions[key] = true;
                }
            }
        }

        return permissions;
    });
};

module.exports = mongoose.model('User', userSchema);
