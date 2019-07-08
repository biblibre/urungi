const restrict = require('../../middlewares/restrict');
const restrictAdmin = require('../../middlewares/restrict-admin');

module.exports = function (app) {
    var Companies = require('./controller.js');

    app.get('/api/company/get-company-data', restrict, Companies.getCompanyData);
    app.post('/api/company/save-public-space', restrictAdmin, Companies.saveSharedSpace);
    app.post('/api/company/save-custom-css', restrictAdmin, Companies.saveCustomCSS);
    app.post('/api/company/save-custom-logo', restrictAdmin, Companies.saveCustomLogo);
};
