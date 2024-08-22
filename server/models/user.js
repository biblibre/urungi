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

userSchema.statics.isValidUserPassword = function (username, password, done) {
    this.findOne({ $or: [{ userName: username }, { email: username }], status: 'active' }).then(function (user) {
        if (!user) return done(null, false, { message: 'Username or password incorrect' });

        const hash = hashPassword(password, user.salt);
        if (hash.toString() === user.hash) {
            return done(null, user);
        } else {
            done(null, false, { message: 'Username or password incorrect' });
        }
    }, function (err) {
        done(err);
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

userSchema.methods.getObjects = async function () {
    const user = this;
    const roles = await user.getRoles();
    const company = await this.model('Company').findOne({ companyID: 'COMPID' });
    const folders = company.sharedSpace;

    const foldersList = [];

    folders.forEach(function setGrant (folder) {
        if (user.isAdmin()) {
            folder.grants = {
                shareReports: true,
                executeReports: true,
                executeDashboards: true,
            };
        } else {
            folder.grants = {
                shareReports: roles.some(role => role.canShareReportsInFolder(folder.id)),
                executeReports: roles.some(role => role.canExecuteReportsInFolder(folder.id)),
                executeDashboards: roles.some(role => role.canExecuteDashboardsInFolder(folder.id)),
            };
        }

        if (folder.nodes) {
            folder.nodes.forEach(setGrant);
        }

        foldersList.push(folder);
    });

    function getReportNode (report) {
        return {
            id: report._id,
            title: report.reportName,
            nodeType: 'report',
            nodes: [],
        };
    }

    function getDashboardNode (dashboard) {
        return {
            id: dashboard._id,
            title: dashboard.dashboardName,
            nodeType: 'dashboard',
            nodes: [],
        };
    }

    for (const folder of foldersList) {
        if (folder.grants.executeReports) {
            const reports = await user.model('Report').find().byFolder(folder.id);
            reports.forEach(report => folder.nodes.push(getReportNode(report)));
        }
        if (folder.grants.executeDashboards) {
            const dashboards = await user.model('Dashboard').find().byFolder(folder.id);
            dashboards.forEach(dashboard => folder.nodes.push(getDashboardNode(dashboard)));
        }
    }

    const reports = await user.model('Report').find().byFolder('root');
    reports.forEach(report => folders.push(getReportNode(report)));
    const dashboards = await user.model('Dashboard').find().byFolder('root');
    dashboards.forEach(dashboard => folders.push(getDashboardNode(dashboard)));

    return folders;
};

userSchema.post('deleteOne', { document: true, query: false }, async function (user, next) {
    const Report = user.model('Report');
    await Report.updateMany({ owner: user._id }, { $unset: { owner: '' } });
    await Report.updateMany({ createdBy: user._id }, { $unset: { createdBy: '' } });

    const Dashboard = user.model('Dashboard');
    await Dashboard.updateMany({ owner: user._id }, { $unset: { owner: '' } });
    await Dashboard.updateMany({ createdBy: user._id }, { $unset: { createdBy: '' } });

    const User = user.model('User');
    await User.updateMany({ createdBy: user._id }, { $unset: { createdBy: '' } });

    next();
});

module.exports = mongoose.model('User', userSchema);
