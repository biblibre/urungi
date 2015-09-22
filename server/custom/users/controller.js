var Users = connection.model('Users');
require('../../core/controller.js');
function UsersController(model) {
    this.model = model;
    this.searchFields = ['userName'];
}
UsersController.inherits(Controller);
var controller = new UsersController(Users);

exports.UsersCreate = function(req,res){
    req.query.trash = true;
    req.query.companyid = true;
    req.body.companyID = 'COMPID';

    //Do we have to generate a password?
    if (req.body.sendPassword == true)
    {
        var generatePassword = require('password-generator');
        var thePassword = generatePassword();
    }

    req.body.password = thePassword;
    req.body.userPassword = thePassword;
    req.body.status = 'active';
    req.body.nd_trash_deleted = false;

    var Users = connection.model('Users');
    Users.createTheUser(req.body,function(result){

        if (req.body.sendPassword == true && thePassword != undefined)
        {
            var recipients = [];
            //recipients.push({userEmail:'hromero@db-team.com',userFirstName:'mene',userNick:'meneNick',userPassword:thePassword});
            recipients.push(req.body);
            sendEmailTemplate('newUserAndPassword',recipients,'email','welcome to widestage');
        }

        serverResponse(req, res, 200, result);
    });

   /*
    controller.create(req, function(result){
        //generate and send password if need
        console.log('before sending password',JSON.stringify(req.body));
        console.log('the password',thePassword);
        if (req.body.sendPassword == true && thePassword != undefined)
        {
            console.log('sending pass',JSON.stringify(result));
            //{"result":1,"msg":"Item created","item":{"__v":0,"status":"active","username":"mene5","name":"mene5","email":"qwerqerqer","companyID":"COMPID","nd_trash_deleted":false,"_id":"55e6ab3a5248aeaa20251091","startDate":"2015-09-02T07:54:34.973Z","filters":[],"roles":[]}}

            var recipients = [];
            recipients.push({userEmail:'hromero@db-team.com',userFirstName:'mene',userNick:'meneNick',userPassword:thePassword});

            sendEmailTemplate('newUserAndPassword',recipients,'userEmail','welcome to widestage');
        }

        serverResponse(req, res, 200, result);
    }); */
};


exports.UsersUpdate = function(req,res){
    req.query.trash = true;
    req.query.companyid = true;

    if (req.body.pwd1 && req.body.pwd2)
    {
        if (req.body.pwd1 == req.body.pwd2)
        {
            var hash = require('../../util/hash');
            hash(req.body.pwd1, function(err, salt, hash){
                if(err) throw err;
                req.body.password = '';
                req.body.salt = salt;
                req.body.hash = hash;
                controller.update(req, function(result){
                    serverResponse(req, res, 200, result);
                });

            });
        } else {
            var result = {result: 0, msg: "Passwords do not match"};
            serverResponse(req, res, 200, result);
        }
    } else {
        controller.update(req, function(result){
            serverResponse(req, res, 200, result);
        });
    }


};

exports.UsersDelete = function(req,res){
    req.query.trash = true;

    controller.delete(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.UsersFindAll = function(req,res)
{
    req.query.trash = true;
    req.query.companyid = true;

    //console.log('El usuario',JSON.stringify(req.user));

            controller.findAll(req, function(result){
                serverResponse(req, res, 200, result);
                console.log('getting all users');
            });
}

exports.UsersFindOne = function(req,res){

    req.query.companyid = true;

    controller.findOne(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.UsersSetStatus = function(req,res){
    Users.setStatus(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.logout = function(req,res){
 console.log('logout');
    //cache.close();
    //req.session.destroy();
    req.logOut();
    res.clearCookie('remember_me');
    req.session.loggedIn = false;
    req.session= null;
    res.end();
};


exports.rememberPassword = function(req,res){
    var body = req.body;
    var url = 'http://'+req.headers.host+'/';

    Users.findOne({ email: body.email }, function (err, findUser) {
        if(findUser){
            Users.rememberPassword(body.email, url, function(result){
                serverResponse(req, res, 200, result);
            });
        }else{
            res.send(200, {result: 0, msg: 'Email not registered'});
        }
    });
};

exports.changePassword = function(req,res){
    var body = req.body;

    Users.findOne({ hash_change_password: body.hash }, function (err, findUser) {
        if(findUser){
            Users.changePassword(req, function(result){
                serverResponse(req, res, 200, result);
            });
        }else{
            res.send(200, {result: 0, msg: 'Invalid hash'});
        }
    });
};

exports.getCounts = function(req,res){
    var body = req.body;
    var userID = req.user.id;
    var companyID = req.user.companyID;
    var theCounts = {};

    //Get all reports for the user

    //Get all dashboards for the user


    //Only for WSTADMIN - these counts are only for the WSTADMIN role
    var isWSTADMIN = false;

    if(req.isAuthenticated()){
        for (var i in req.user.roles) {
            if (req.user.roles[i] == 'WSTADMIN'){
                isWSTADMIN = true;
            }
        }
    }

    if (isWSTADMIN)
    {
        //get all reports
        var Reports = connection.model('Reports');
        Reports.count({companyID: companyID}, function (err, reportCount) {
            theCounts.reports = reportCount;
            //get all dashboards
            var Dashboards = connection.model('Dashboards');
            Dashboards.count({companyID: companyID}, function (err, dashCount) {
                theCounts.dashBoards = dashCount;
                //get all datasources
                var DataSources = connection.model('DataSources');
                DataSources.count({companyID: companyID}, function (err, dtsCount) {
                    theCounts.dataSources = dtsCount;
                    //get all layers
                    var Layers = connection.model('Layers');
                    Layers.count({companyID: companyID}, function (err, layersCount) {
                        theCounts.layers = layersCount;
                        //get all users
                        var Users = connection.model('Users');
                        Users.count({companyID: companyID}, function (err, usersCount) {
                            theCounts.users = usersCount;
                            //get all roles
                            var Roles = connection.model('Roles');
                            Roles.count({companyID: companyID}, function (err, rolesCount) {
                                theCounts.roles = rolesCount;
                                //send the response
                                serverResponse(req, res, 200, theCounts);
                            });

                        });
                    });
                });

            });
        });

    }

};

exports.getUserData = function(req,res){
    var Companies = connection.model('Companies');
    Companies.findOne({companyID:req.user.companyID,nd_trash_deleted: false},{},function(err, company){


        req.user.companyData = company;
        req.session.companyData = company;
        console.log('this is the company Data',JSON.stringify(req.user.companyData));

        if (req.user.roles.length > 0)
        {
            var Roles = connection.model('Roles');
            Roles.find({ _id : { $in : req.user.roles} },{},function(err, roles){
                req.session.rolesData = roles;
                serverResponse(req, res, 200, {result: 1, page: 1, pages: 1, items: {companyData:company, rolesData:roles}});
            });

        } else {
          serverResponse(req, res, 200, {result: 1, page: 1, pages: 1, items: {companyData:company}});
        }

    });
};


exports.getUserObjects = function(req, res){
    var Companies = connection.model('Companies');
    Companies.findOne({companyID:req.user.companyID,nd_trash_deleted: false},{},function(err, company){

        var folders = company.publicSpace;

        if (req.user.roles.length > 0)
        {
            var Roles = connection.model('Roles');
            Roles.find({ _id : { $in : req.user.roles} },{},function(err, roles){

                navigateRoles(folders,roles,function(){
                    console.log('the folders',JSON.stringify(folders))

                    getNoFolderReports(function(reports){

                       getNoFolderDashboards(function(dashboards){
                           for (var d in dashboards)
                               folders.push(dashboards[d]);
                           for (var r in reports)
                               folders.push(reports[r]);
                           serverResponse(req, res, 200, {result: 1, page: 1, pages: 1, items: folders});
                       })
                    });



                });


            }).lean();

        } else {
            //Has no access to any folder
            serverResponse(req, res, 200, {result: 1, page: 1, pages: 1, items: []});
        }

    });
}


function navigateRoles(folders,rolesData,done)
{
    for (var r in rolesData)
    {
        if (!rolesData[r].grants)
        {
            rolesData.splice(r, 1);
        } else {
            if (rolesData[r].grants.length == 0)
            {
                rolesData.splice(r, 1);
            }
        }
    }

    for (var r in rolesData)
    {
        for (var g in rolesData[r].grants)
        {
            setGrantsToFolder_old(folders,rolesData[r].grants[g],r,g, function(roleIndex,grantIndex){
                console.log('he recogido el ',grantIndex,'del role',roleIndex)

            if (roleIndex == rolesData.length -1 && grantIndex == rolesData[roleIndex].grants.length -1)
                done();
            });
        }
    }
}

function setGrantsToFolder_old(folders, grant,roleIndex,grantIndex, done)
{
    for (var i in folders)
    {
        if (folders[i].id == grant.folderID)
        {
            folders[i].grants = grant;

            if (grant.executeReports == true)
            {
                getReportsForFolder(grant.folderID,folders[i],function(reports,folder){
                    //folder.reports = reports;
                    for (var n in reports)
                            folder.nodes.push(reports[n]);
                    console.log('therpeors',JSON.stringify(reports));
                    if (grant.executeDashboards == true)
                    {
                        getDashboardsForFolder(grant.folderID,folder,function(dashboards,folder){
                            //folder.dashboards = dashboards;
                            for (var n in dashboards)
                                folder.nodes.push(dashboards[n]);
                            done(roleIndex,grantIndex);
                        });
                    } else {
                       done(roleIndex,grantIndex);
                    }

                });
            } else {
                if (grant.executeDashboards == true)
                {
                    getDashboardsForFolder(grant.folderID,folders[i],function(dashboards,folder){
                        //folder.dashboards = dashboards;
                        for (var n in dashboards)
                            folder.nodes.push(dashboards[n]);
                        done(roleIndex,grantIndex);
                    });
                }
            }

            if (grant.executeDashboards == false && grant.executeReports == false)
            {
                done(roleIndex,grantIndex);
                return;
            }
        } else {
            if (folders[i].nodes)
                if (folders[i].nodes.length > 0)
                    setGrantsToFolder_old(folders[i].nodes,grant,roleIndex,grantIndex,done);
        }
    }

}




function getReportsForFolder(idfolder,folder,done)
{

        var Reports = connection.model('Reports');

        var find = {"$and":[{"nd_trash_deleted":false},{"companyID":"COMPID"},{parentFolder:idfolder},{"$or": [{owner: undefined},{owner: { $exists: false }}]}]}
        var fields = {reportName:1,reportType:1,reportDescription:1};

        Reports.find(find,fields,{},function(err, reports){

            var nodes = [];
             for (var r in reports)
             {
                nodes.push({id:reports[r]._id,title:reports[r].reportName,nodeType:'report',description:reports[r].reportDescription,nodeSubtype:reports[r].reportType,nodes:[]});
             }
            done(nodes,folder);
        });

}

function getDashboardsForFolder(idfolder,folder,done)
{
    var Dashboards = connection.model('Dashboards');

        var find = {"$and":[{"nd_trash_deleted":false},{"companyID":"COMPID"},{parentFolder:idfolder},{"$or": [{owner: undefined},{owner: { $exists: false }}]}]}
        var fields = {dashboardName:1,dashboardDescription:1};

    Dashboards.find(find,fields,{},function(err, dashboards){

            var nodes = [];
            for (var r in dashboards)
            {
                nodes.push({id:dashboards[r]._id,title:dashboards[r].dashboardName,nodeType:'dashboard',description:dashboards[r].dashboardDescription,nodes:[]});
            }

            done(nodes,folder)
        });
}


function getNoFolderReports(done)
{

    var Reports = connection.model('Reports');

    var find = {"$and":[{"nd_trash_deleted":false},{"companyID":"COMPID"},{"$or": [{owner: undefined},{owner: { $exists: false }}]},{"$or": [{parentFolder: undefined},{parentFolder: { $exists: false }}]}]}
    var fields = {reportName:1,reportType:1,reportDescription:1};

    Reports.find(find,fields,{},function(err, reports){

        var nodes = [];
        for (var r in reports)
        {
            nodes.push({id:reports[r]._id,title:reports[r].reportName,nodeType:'report',description:reports[r].reportDescription,nodeSubtype:reports[r].reportType,nodes:[]});
        }
        done(nodes);
    });

}

function getNoFolderDashboards(done)
{
    var Dashboards = connection.model('Dashboards');

    var find = {"$and":[{"nd_trash_deleted":false},{"companyID":"COMPID"},{"$or": [{owner: undefined},{owner: { $exists: false }}]},{"$or": [{parentFolder: undefined},{parentFolder: { $exists: false }}]}]}
    var fields = {dashboardName:1,dashboardDescription:1};

    Dashboards.find(find,fields,{},function(err, dashboards){

        var nodes = [];
        for (var r in dashboards)
        {
            nodes.push({id:dashboards[r]._id,title:dashboards[r].dashboardName,nodeType:'dashboard',description:dashboards[r].dashboardDescription,nodes:[]});
        }

        done(nodes)
    });
}



