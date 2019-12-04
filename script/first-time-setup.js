const config = require('config');
global.config = config;

const connection = require('../server/config/mongoose')();
const User = connection.model('User');
const Company = connection.model('Company');

if (process.argv.length !== 3) {
    console.error('Usage: node first-time-setup.js PASSWORD');
    process.exit(1);
}

(async function () {
    let company = await Company.findOne({ companyID: 'COMPID' });
    if (company) {
        console.error('Company COMPID already exists. 1st time setup has already been done');
        process.exit(1);
    }

    const user = await User.findOne({ userName: 'administrator' });
    if (user) {
        console.error('User administrator already exists. 1st time setup has already been done');
        process.exit(1);
    }

    const theCompany = {
        companyID: 'COMPID',
        createdBy: 'urungi setup',
        nd_trash_deleted: false,
    };
    company = await Company.create(theCompany);

    const password = process.argv[2];

    const adminUser = new User({
        userName: 'administrator',
        companyID: company.companyID,
        roles: ['ADMIN'],
        status: 'active',
        nd_trash_deleted: false,
    });
    adminUser.password = password;

    await adminUser.save();

    connection.close();
})();
