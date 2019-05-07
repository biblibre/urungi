module.exports = function (app) {
    var Companies = require('./controller.js');

    app.get('/api/company/get-company-data', restrict, Companies.getCompanyData);
    app.post('/api/company/save-public-space', restrictRole(['WSTADMIN']), Companies.saveSharedSpace);
    app.post('/api/company/save-custom-css', restrictRole(['WSTADMIN']), Companies.saveCustomCSS);
    app.post('/api/company/save-custom-logo', restrictRole(['WSTADMIN']), Companies.saveCustomLogo);
};
