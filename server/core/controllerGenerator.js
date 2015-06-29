/**
 * Created with JetBrains WebStorm.
 * User: hermenegildoromero
 * Date: 04/12/13
 * Time: 10:50
 * To change this template use File | Settings | File Templates.
 */



exports.generateDataResource = function(_customController){

    console.log('Entering generate data resource');

    var controllerName = _customController.name;

    var fs = require("fs");

    var serverControllerFileName =  "./server/nodedream/ServerMyController.txt";
    var serverModelFileName =  "./server/nodedream/ServerMyModel.txt";
    var serverRouterFileName =  "./server/nodedream/ServerMyRouter.txt";

    //create directories for the customController

    /*fs.mkdir('server/controllers/custom/'+controllerName,function(e){
        if(!e || (e && e.code === 'EEXIST')){
            //do something with contents
        } else {
            //debug
            console.log(e);
        }
    });

    fs.mkdir('models/controllers/custom/'+controllerName,function(e){
        if(!e || (e && e.code === 'EEXIST')){
            //do something with contents
        } else {
            //debug
            console.log(e);
        }
    });*/

    /*fs.mkdir('views/partials/custom/'+controllerName,function(e){
        if(!e || (e && e.code === 'EEXIST')){
            //do something with contents
        } else {
            //debug
            console.log(e);
        }
    }); */


    fs.exists(serverControllerFileName, function(exists) {
        if (exists) {
            console.log('AQUI');
            fs.readFile(serverControllerFileName, "utf8", function(error, data) {
                var replacedData =  data.replace(new RegExp('##ND:CONTROLLER##', 'g'), controllerName);

                fs.writeFile('server/controllers/custom/'+controllerName+'.js', replacedData, function (err) {
                    if (err) return console.log(err);
                    console.log('Server controller file created: '+'server/controllers/custom/'+controllerName+'.js' );
                });
            });

        } else {
            console.log('File '+serverControllerFileName+' does not exists');
        }
    });

    //Server model
    fs.exists(serverModelFileName, function(exists) {
        if (exists) {

            fs.readFile(serverModelFileName, "utf8", function(error, data) {
                var replacedData =  data.replace(new RegExp('##ND:CONTROLLER##', 'g'), controllerName);
                var replacedData2 =  replacedData.replace(new RegExp('##ND:CONTROLLER_FIELDS##', 'g'), generateModelControllerFields(_customController.fields));
                fs.writeFile('server/models/custom/'+controllerName+'.js', replacedData2, function (err) {
                    if (err) return console.log(err);
                    console.log('Server model file created: '+'server/models/custom/'+controllerName+'.js' );
                });
            });

        } else {
            console.log('File '+serverModelFileName+' does not exists');
        }
    });

    //Server router
    fs.exists(serverRouterFileName, function(exists) {
        if (exists) {

            fs.readFile(serverRouterFileName, "utf8", function(error, data) {
                var replacedData =  data.replace(new RegExp('##ND:CONTROLLER##', 'g'), controllerName);
                fs.writeFile('server/routes/custom/'+controllerName+'.js', replacedData, function (err) {
                    if (err) return console.log(err);
                    console.log('Server router file created: '+'server/routes/custom/'+controllerName+'.js' );
                });
            });

        } else {
            console.log('File '+serverRouterFileName+' does not exists');
        }
    });

    //Client Partials

    /*var partialMainFileName = "./server/nodedream/PartialMain.txt";
    fs.exists(partialMainFileName, function(exists) {
        if (exists) {

            fs.readFile(partialMainFileName, "utf8", function(error, data) {
                var replacedData =  data.replace(new RegExp('##ND:CONTROLLER##', 'g'), controllerName);

                fs.writeFile('views/partials/custom/'+controllerName+'/'+controllerName+'Main.html', replacedData, function (err) {
                    if (err) return console.log(err);
                    console.log('Client Partial file created: '+'views/partials/custom/'+controllerName+'/'+controllerName+'Main.html' );
                });
            });

        } else {
            console.log('File '+partialMainFileName+' does not exists');
        }
    });*/

    /*var partialListFileName = "./server/nodedream/PartialList.txt";
    fs.exists(partialListFileName, function(exists) {
        if (exists) {

            fs.readFile(partialListFileName, "utf8", function(error, data) {
                var replacedData =  data.replace(new RegExp('##ND:CONTROLLER##', 'g'), controllerName);
                var replacedData2 =  replacedData.replace(new RegExp('##ND:CONTROLLER_LIST_TABLE_HEADER##', 'g'), generateControllerListTableHeaderFields(_customController.fields));
                var replacedData3 =  replacedData2.replace(new RegExp('##ND:CONTROLLER_LIST_TABLE_BODY##', 'g'), generateControllerListTableBodyFields(_customController.fields));

                fs.writeFile('views/partials/custom/'+controllerName+'/'+controllerName+'List.html', replacedData3, function (err) {
                    if (err) return console.log(err);
                    console.log('Client Partial file created: '+'views/partials/custom/'+controllerName+'/'+controllerName+'List.html' );
                });
            });

        } else {
            console.log('File '+partialListFileName+' does not exists');
        }
    });*/

    /*var partialFormFileName = "./server/nodedream/PartialForm.txt";
    fs.exists(partialFormFileName, function(exists) {
        if (exists) {

            fs.readFile(partialFormFileName, "utf8", function(error, data) {
                var replacedData =  data.replace(new RegExp('##ND:CONTROLLER##', 'g'), controllerName);
                var replacedData2 =  replacedData.replace(new RegExp('##ND:CONTROLLER_FORM_FIELDS##', 'g'), generateControllerFormFields(_customController.fields));


                fs.writeFile('views/partials/custom/'+controllerName+'/'+controllerName+'Form.html', replacedData2, function (err) {
                    if (err) return console.log(err);
                    console.log('Client Partial file created: '+'views/partials/custom/'+controllerName+'/'+controllerName+'Form.html' );
                });
            });

        } else {
            console.log('File '+partialFormFileName+' does not exists');
        }
    });*/

    /*var partialSubmenuFileName = "./server/nodedream/PartialSubmenu.txt";
    fs.exists(partialSubmenuFileName, function(exists) {
        if (exists) {

            fs.readFile(partialSubmenuFileName, "utf8", function(error, data) {
                var replacedData =  data.replace(new RegExp('##ND:CONTROLLER##', 'g'), controllerName);
                var replacedData2 =  replacedData.replace(new RegExp('##ND:CONTROLLER_SUBMENU##', 'g'), generateControllerSubmenu());


                fs.writeFile('views/partials/custom/'+controllerName+'/'+controllerName+'Submenu.html', replacedData2, function (err) {
                    if (err) return console.log(err);
                    console.log('Client Partial file created: '+'views/partials/custom/'+controllerName+'/'+controllerName+'Submenu.html' );
                });
            });

        } else {
            console.log('File '+partialSubmenuFileName+' does not exists');
        }
    }); */

    //Client Controller
    var clientControllerFileName = "./server/nodedream/clientMyController.txt";
    fs.exists(clientControllerFileName, function(exists) {
        if (exists) {

            fs.readFile(clientControllerFileName, "utf8", function(error, data) {
                var replacedData =  data.replace(new RegExp('##ND:CONTROLLER##', 'g'), controllerName);
                fs.writeFile('public/js/controllers/custom/'+controllerName+'Controller.js', replacedData, function (err) {
                    if (err) return console.log(err);
                    console.log('Client controller file created: '+'public/js/controllers/custom/'+controllerName+'Controller.js' );
                });
            });

        } else {
            console.log('File '+clientControllerFileName+' does not exists');
        }
    });

    //Client Model
    var clientModelFileName = "./server/nodedream/clientMyModel.txt";
    fs.exists(clientModelFileName, function(exists) {
        if (exists) {

            fs.readFile(clientModelFileName, "utf8", function(error, data) {
                var replacedData =  data.replace(new RegExp('##ND:CONTROLLER##', 'g'), controllerName);
                fs.writeFile('public/js/clientModels/custom/'+controllerName+'Model.js', replacedData, function (err) {
                    if (err) return console.log(err);
                    console.log('Client model file created: '+'public/js/clientModels/custom/'+controllerName+'Model.js' );
                });
            });

        } else {
            console.log('File '+clientModelFileName+' does not exists');
        }
    });


    //Client app.js modifications

    //Add the controller route

    /*NODE_DREAM_CUSTOM_CONTROLLERS*/
    /*var clientAppFileName = "./public/js/app.js";
    fs.exists(clientAppFileName, function(exists) {
        if (exists) {

            fs.readFile(clientAppFileName, "utf8", function(error, data) {

                var clientAppControllerLoad  = "/* ##NODE_DREAM_CUSTOM_CONTROLLERS## */  /*\n"+
                    ".state('"+controllerName+"',{ "+
                    "url:'/"+controllerName+"', "+
                    "templateUrl : 'partial/custom/"+controllerName+"Main', "+
                    "controller : '"+controllerName+"Ctrl' "+
                    "})";

                var replacedData =  data.replace('/* ##NODE_DREAM_CUSTOM_CONTROLLERS## *//*', clientAppControllerLoad);

                fs.writeFile(clientAppFileName, replacedData, function (err) {
                    if (err) return console.log(err);
                    console.log('Client App File updated' +clientAppFileName);
                });
            });

        } else {
            console.log('File '+clientAppFileName+' does not exists');
        }
    });*/


    //LO MISMO PERO PARA LOS PUBLICOS  Implementar la diferenciación público / privado
    /* do not remove or edit this line */ /* ##NODE_DREAM_CUSTOM_PUBLIC_CONTROLLERS## */

    //Client webapp.js modifications

    //Add the controller main menu link

    /*##NODE_DREAM_CUSTOM_CONTROLLERS_MENU##*/
    /*var clientAppIndexFileName = "./views/webapp.html";
    fs.exists(clientAppIndexFileName, function(exists) {
        if (exists) {

            fs.readFile(clientAppIndexFileName, "utf8", function(error, data) {
                var theControllerName = "'"+controllerName+"'";
                var clientAppIndexControllerLink  = "<!-- ##NODE_DREAM_CUSTOM_CONTROLLERS_MENU## -->  \n"+
                    '<ul class="nav navbar-nav"> '+
                    '<li><a href="/home/#/'+controllerName+'">{{getTranslation('+theControllerName+')}}</a></li>' +
                    '</ul>';

                console.log(clientAppIndexControllerLink);

                var replacedData =  data.replace('<!-- ##NODE_DREAM_CUSTOM_CONTROLLERS_MENU## -->', clientAppIndexControllerLink);

                fs.writeFile(clientAppIndexFileName, replacedData, function (err) {
                    if (err) return console.log(err);
                    console.log('Client webapp Index File updated for controller main menu link');
                });
            });

        } else {
            console.log('File '+clientAppIndexFileName+' does not exists');
        }
    });*/

    //Add the reference to the js files generated by nodedream

    /*##NODE_DREAM_CUSTOM_CONTROLLERS_JS##*/
    /*var clientAppIndexFileName = "./views/webapp.html";
    fs.exists(clientAppIndexFileName, function(exists) {
        if (exists) {

            fs.readFile(clientAppIndexFileName, "utf8", function(error, data) {
                var theControllerName = "'"+controllerName+"'";
                var clientAppClientJSFiles  = "<!-- ##NODE_DREAM_CUSTOM_CONTROLLERS_JS## -->  \n"+
                    '<script src="js/controllers/custom/'+controllerName+'Controller.js"></script> \n'+
                    '<script src="js/clientModels/custom/'+controllerName+'Model.js"></script> \n';

                var replacedData =  data.replace('<!-- ##NODE_DREAM_CUSTOM_CONTROLLERS_JS## -->', clientAppClientJSFiles);

                fs.writeFile(clientAppIndexFileName, replacedData, function (err) {
                    if (err) return console.log(err);
                    console.log('Client webapp Index File updated for controller JS files' +clientAppIndexFileName);
                });
            });

        } else {
            console.log('File '+clientAppIndexFileName+' does not exists');
        }
    }); */


    //Server Main server.js modifications

    //Add the server controller routes

    /* ##NODE_DREAM_CUSTOM_CONTROLLERS_ROUTES## */
    /*var serverAppFileName = "server.js";
    fs.exists(serverAppFileName, function(exists) {
        if (exists) {

            fs.readFile(serverAppFileName, "utf8", function(error, data) {

                var serverAppControllerRoutes  = "/* ##NODE_DREAM_CUSTOM_CONTROLLERS_ROUTES## */  /*\n"+
                    "var     "+controllerName+" = require('./server/custom/"+controllerName+".js');   \n"+
                    "app.get('/api/custom/"+controllerName+"', restrict, "+controllerName+".get_"+controllerName+");   \n"+
                    "app.post('/api/custom/"+controllerName+"/create',restrict,  "+controllerName+".create_"+controllerName+");  \n"+
                    "app.put('/api/custom/"+controllerName+"/update/:"+controllerName+"ID',restrict,  "+controllerName+".edit_"+controllerName+");  \n"+
                    "app.delete('/api/custom/"+controllerName+"/delete/:"+controllerName+"ID',restrict,  "+controllerName+".delete_"+controllerName+");  \n";

                var replacedData =  data.replace('/* ##NODE_DREAM_CUSTOM_CONTROLLERS_ROUTES## *//*', serverAppControllerRoutes);

                fs.writeFile(serverAppFileName, replacedData, function (err) {
                    if (err) return console.log(err);
                    console.log('Server App File updated: ' +serverAppFileName);
                });
            });

        } else {
            console.log('File '+serverAppFileName+' does not exists');
        }
    });*/


};


function generateModelControllerFields(fields){

    //var result =  'userID: {type: String, required: true}, '+
    //    'name:  {type: String, required: true}';

    var result = '';



    console.log(fields);

    //for(var i = fields.length - 1; i >= 0; i--) {
    for(var i = 0; i < fields.length; i++) {

        resField =  fields[i].name + ': {type: '+fields[i].type;

        if (fields[i].required == true)
            resField = resField + ', required: true}'
        else
            resField = resField + '}';

        if (i < (fields.length -1))
            resField = resField +',';


        resField = resField +'\n';
        result = result + resField;
    }

    console.log(result);

    return(result);

}

function generateControllerListTableHeaderFields(fields){
    return (' 9999 TH headerFields');
}

function generateControllerListTableBodyFields(fields) {
    return (' 99999 TD body Fields');
}

function generateControllerFormFields(fields) {
    return (' 999999 FORM Fields');
}

function generateControllerSubmenu() {
    return (' 9999999 Controller Submenú');
}
