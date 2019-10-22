const config = require('config');
global.config = config;

const hash = require('../server/util/hash');

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

    function hashPassword (password) {
        return new Promise(function (resolve, reject) {
            hash(password, function (err, salt, hash) {
                if (err) {
                    return reject(err);
                }

                resolve({ salt: salt, hash: hash });
            });
        });
    }

    const password = process.argv[2];
    const result = await hashPassword(password);

    const adminUser = {
        userName: 'administrator',
        salt: result.salt,
        hash: result.hash,
        companyID: company.companyID,
        roles: ['ADMIN'],
        status: 'active',
        nd_trash_deleted: false,
    };

    await User.create(adminUser);

    connection.close();
})();
