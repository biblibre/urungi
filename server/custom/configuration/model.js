var mongoose = require('mongoose');

var ConfigurationSchema = new mongoose.Schema({
    companyID: {type: String, required: true},
    logUserFailLogin: {type: Boolean},
    logUserLogin: {type: Boolean},
    history: [],
    nd_trash_deleted:{type: Boolean},
    nd_trash_deleted_date: {type: Date},
    createdBy: {type: String},
    createdOn: {type: Date}
}, { collection: 'wst_Configuration' });

var Configuration = connection.model('Configuration', ConfigurationSchema);
module.exports = Configuration;

/*
var Configuration = connection.model('Configuration');

Configuration.count({}, function(err, c)
{
    if (c == 0)
    {
        console.log('no records in the configuration model');
        var config = {};
        config.companyID = 'COMPID';
        config.logUserFailLogin = true;
        config.logUserLogin = true;
        Configuration.create(config,function(result){
            authenticate(passport,Users,req, res, next);
        });
    } else {
        authenticate(passport,Users,req, res, next);
    }
});
*/