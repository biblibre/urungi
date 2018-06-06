/**
 * Created with JetBrains WebStorm.
 * User: hermenegildoromero
 * Date: 04/12/13
 * Time: 10:50
 * To change this template use File | Settings | File Templates.
 */

exports.generateDataResource = function (_customController) {
    var controllerName = _customController.name;

    var fs = require('fs');

    var serverControllerFileName = './server/nodedream/ServerMyController.txt';
    var serverModelFileName = './server/nodedream/ServerMyModel.txt';
    var serverRouterFileName = './server/nodedream/ServerMyRouter.txt';

    // create directories for the customController

    fs.readFile(serverControllerFileName, 'utf8', function (error, data) {
        if (error) {
            return console.error(error);
        }

        var replacedData = data.replace(new RegExp('##ND:CONTROLLER##', 'g'), controllerName);

        fs.writeFile('server/controllers/custom/' + controllerName + '.js', replacedData, function (err) {
            if (err) return console.log(err);
        });
    });

    // Server model
    fs.readFile(serverModelFileName, 'utf8', function (error, data) {
        if (error) {
            return console.error(error);
        }

        var replacedData = data.replace(new RegExp('##ND:CONTROLLER##', 'g'), controllerName);
        var replacedData2 = replacedData.replace(new RegExp('##ND:CONTROLLER_FIELDS##', 'g'), generateModelControllerFields(_customController.fields));
        fs.writeFile('server/models/custom/' + controllerName + '.js', replacedData2, function (err) {
            if (err) return console.log(err);
            console.log('Server model file created: ' + 'server/models/custom/' + controllerName + '.js');
        });
    });

    // Server router
    fs.readFile(serverRouterFileName, 'utf8', function (error, data) {
        if (error) {
            return console.error(error);
        }

        var replacedData = data.replace(new RegExp('##ND:CONTROLLER##', 'g'), controllerName);
        fs.writeFile('server/routes/custom/' + controllerName + '.js', replacedData, function (err) {
            if (err) return console.log(err);
            console.log('Server router file created: ' + 'server/routes/custom/' + controllerName + '.js');
        });
    });

    // Client Controller
    var clientControllerFileName = './server/nodedream/clientMyController.txt';
    fs.readFile(clientControllerFileName, 'utf8', function (error, data) {
        if (error) {
            return console.error(error);
        }

        var replacedData = data.replace(new RegExp('##ND:CONTROLLER##', 'g'), controllerName);
        fs.writeFile('public/js/controllers/custom/' + controllerName + 'Controller.js', replacedData, function (err) {
            if (err) return console.log(err);
            console.log('Client controller file created: ' + 'public/js/controllers/custom/' + controllerName + 'Controller.js');
        });
    });

    // Client Model
    var clientModelFileName = './server/nodedream/clientMyModel.txt';
    fs.readFile(clientModelFileName, 'utf8', function (error, data) {
        if (error) {
            return console.error(error);
        }

        var replacedData = data.replace(new RegExp('##ND:CONTROLLER##', 'g'), controllerName);
        fs.writeFile('public/js/clientModels/custom/' + controllerName + 'Model.js', replacedData, function (err) {
            if (err) return console.log(err);
            console.log('Client model file created: ' + 'public/js/clientModels/custom/' + controllerName + 'Model.js');
        });
    });
};

function generateModelControllerFields (fields) {
    var result = '';

    for (var i = 0; i < fields.length; i++) {
        let resField = fields[i].name + ': {type: ' + fields[i].type;

        if (fields[i].required) {
            resField = resField + ', required: true}';
        } else {
            resField = resField + '}';
        }

        if (i < (fields.length - 1)) { resField = resField + ','; }

        resField = resField + '\n';
        result = result + resField;
    }

    return (result);
}
