/* GLOBAL FUNCTIONS */
var appRoot = __dirname+'/../';
global.appRoot = appRoot;

function restrict(req, res, next) {

    if (global.authentication)
    {
        if(req.isAuthenticated()){
                next();
        }else{
              req.session.error = 'Access denied!';
              return res.redirect(302,'/login');
        }
    } else {
        next();
    }
}
global.restrict = restrict;

function passthrough(req, res, next) {
    if (config.crypto.enabled) {
        var CryptoJS = require('crypto-js');

        if (req.query.data) {
            var decrypted = CryptoJS.AES.decrypt(req.query.data, config.crypto.secret);
            req.query = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
            req.query = stripInvalidChars(req.query);
            return next();
        }
        else if (req.body.data) {
            var decrypted = CryptoJS.AES.decrypt(req.body.data, config.crypto.secret);
            req.body = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
            req.body = stripInvalidChars(req.body);
            return next();
        }
        else {
            return next();
        }
    }
    else {
        return next();
    }
}
global.passthrough = passthrough;

function stripInvalidChars(obj) {
    delete(obj['$$hashKey']);

    if (typeof obj == 'object') {
        for (var i in obj) {
            if (obj[i]) stripInvalidChars(obj[i]);
        }
    }

    return obj;
}

function restrictRole(roles) {
    return function(req, res, next) {
        if(req.isAuthenticated()){
            for (var i in roles) {
                if (req.user.roles.indexOf(roles[i]) > -1){
                    next();
                    return;
                }
            }
        }
        req.session.error = 'Access denied!';
        //TODO: Log annotation security issue
        console.log("Access denied!");
        res.send(401, {result:0,msg:'You don´t have access to this function'});
    };
}
global.restrictRole = restrictRole;

function saveToLog(req, text, type, code, otherInfo,associatedID) {
    var Logs = connection.model('Logs');

    Logs.saveToLog(req, {text: text, type: type, code: code,associatedID:associatedID},otherInfo, function(){

    });
};
global.saveToLog = saveToLog;

function getNextSequence(name) {
    var Counters = connection.model('Counters');
    var ret = Counters.findAndModify(
        {
            query: { _id: name },
            update: { $inc: { seq: 1 } },
            new: true
        }
    );

    return ret.seq;
}
global.getNextSequence = getNextSequence;

function sendNotification(req, user_id, text, type, communication_id, accept_url) {

    var Notifications = connection.model('Notifications');

    var data = {user_id: user_id, sender_id: req.user.id, text: text, type: type, communication_id: communication_id, accept_url: accept_url};

    Notifications.sendNotification(data);
};
global.sendNotification = sendNotification;

function sendCommunication(data) {
    var Communications = connection.model('Communications');

    Communications.sendEmail(data, function(result){

    });
};
global.sendCommunication = sendCommunication;

function generateUserFilter(req, filters) {
    if (typeof filters == 'string') filters = [filters];

    var userFilters = {};

    if (req.user.filters) {
        for (var i in filters) {
            for (var j in req.user.filters) {
                if (String(req.user.filters[j].name).toLowerCase() == String(filters[i]).toLowerCase()) {
                    if(!userFilters.hasOwnProperty(filters[i]))
                        userFilters[filters[i]] = [];

                    userFilters[filters[i]].push(req.user.filters[j].value);
                }
            }
        }
    }

    return userFilters;
};
global.generateUserFilter = generateUserFilter;

function generateUserFilterValue(req, filter) {
    var userFilterValue = [];

    if (req.user.filters) {
        for (var i in req.user.filters) {
            if (String(req.user.filters[i].name).toLowerCase() == String(filter).toLowerCase()) {
                userFilterValue.push(req.user.filters[i].value);
            }
        }
    }

    return userFilterValue;
};
global.generateUserFilterValue = generateUserFilterValue;

function isAllowed(req, area) {
    if (!req.user)
        return false;
    if (!req.user.companyData)
        return false;
    if (!req.user.companyData[area])
        return false;

    return req.user.companyData[area];
};
global.isAllowed = isAllowed;

function debug(obj) {

}
global.debug = debug;

function serverResponse(req, res, status, obj) {
    if (config.crypto.enabled) {
        var CryptoJS = require('crypto-js');

        var encrypted = CryptoJS.AES.encrypt(JSON.stringify(obj), config.crypto.secret);
        obj = {data: String(encrypted)};

        var result = ")]}',\n"+JSON.stringify(obj);

        res.status(status).send(result);
    }
    else {
        var result = ")]}',\n"+JSON.stringify(obj);

        res.status(status).send(result);
    }
}
global.serverResponse = serverResponse;


function fileUpload(file,path,done)
{
    var fs = require('fs');

    fs.readFile(file.path, function(err, data) {
        if(err) throw err;

        fs.writeFile(path, data, function (err) {
            if(err) throw err;
            done({result: 1, msg: "File uploaded", file: file.toObject()});

        });
    });



}


