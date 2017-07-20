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
        req.body.pwd1 = thePassword;
        req.body.userPassword = thePassword;
    }


    req.body.status = 'active';
    req.body.nd_trash_deleted = false;

    var Users = connection.model('Users');
    Users.createTheUser(req,res,req.body,function(result){

        if (req.body.sendPassword == true && thePassword != undefined)
        {
            var recipients = [];
            recipients.push(req.body);
            sendEmailTemplate('newUserAndPassword',recipients,'email','welcome to widestage');
        }

        serverResponse(req, res, 200, result);
    });


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

            controller.findAll(req, function(result){
                serverResponse(req, res, 200, result);
            });
}

exports.UsersFindOne = function(req,res){

    req.query.companyid = true;

    controller.findOne(req, function(result){
        serverResponse(req, res, 200, result);
    });
};


exports.logout = function(req,res){

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

exports.changeMyPassword = function(req,res){


    if (req.body.pwd1 && req.body.pwd2)
    {
        if (req.body.pwd1 == req.body.pwd2)
        {
            var hash = require('../../util/hash');
            hash(req.body.pwd1, function(err, salt, hash){
                if(err) throw err;
                Users.update({_id:req.user._id},{salt:salt,hash:hash}, function(result){
                    var result = {result: 1, msg: "Password changed"};
                    serverResponse(req, res, 200, result);
                });

            });
        } else {
            var result = {result: 0, msg: "Passwords do not match"};
            serverResponse(req, res, 200, result);
        }
    }
};

exports.changeUserStatus = function(req,res){

    Users.setStatus(req,function(result){
        serverResponse(req, res, 200, result);
    });

}

exports.setViewedContextHelp = function(req,res)
{
    Users.setViewedContextHelp(req,function(result){
        serverResponse(req, res, 200, result);
    });
}

exports.getCounts = function(req,res){
    var body = req.body;
    var userID = req.user.id;
    var companyID = req.user.companyID;
    var theCounts = {};

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
        Reports.count({companyID: companyID,owner:req.user._id,nd_trash_deleted:false}, function (err, reportCount) {
            theCounts.reports = reportCount;
            //get all dashboards
            var Dashboardsv2 = connection.model('Dashboardsv2');
            Dashboardsv2.count({companyID: companyID,owner:req.user._id,nd_trash_deleted:false}, function (err, dashCount) {
                theCounts.dashBoards = dashCount;
                //get all pages
                var Pages = connection.model('Pages');
                Pages.count({companyID: companyID,owner:req.user._id,nd_trash_deleted:false}, function (err, pageCount) {
                    theCounts.pages = pageCount;
                    //get all datasources
                    var DataSources = connection.model('DataSources');
                    DataSources.count({companyID: companyID,nd_trash_deleted:false}, function (err, dtsCount) {
                        theCounts.dataSources = dtsCount;
                        //get all layers
                        var Layers = connection.model('Layers');
                        Layers.count({companyID: companyID,nd_trash_deleted:false}, function (err, layersCount) {
                            theCounts.layers = layersCount;
                            //get all users
                            var Users = connection.model('Users');
                            Users.count({companyID: companyID,nd_trash_deleted:false}, function (err, usersCount) {
                                theCounts.users = usersCount;
                                //get all roles
                                var Roles = connection.model('Roles');
                                Roles.count({companyID: companyID,nd_trash_deleted:false}, function (err, rolesCount) {
                                    theCounts.roles = rolesCount;
                                    //send the response
                                    serverResponse(req, res, 200, theCounts);
                                });

                            });
                        });
                    });

                });

            });
        });

    } else {
        //get all reports
        var Reports = connection.model('Reports');
        Reports.count({companyID: companyID,owner:req.user._id,nd_trash_deleted:false}, function (err, reportCount) {
            theCounts.reports = reportCount;
            //get all dashboards
            var Dashboards = connection.model('Dashboards');
            Dashboards.count({companyID: companyID,owner:req.user._id,nd_trash_deleted:false}, function (err, dashCount) {
                theCounts.dashBoards = dashCount;
                //get all pages
                var Pages = connection.model('Pages');
                Pages.count({companyID: companyID,owner:req.user._id,nd_trash_deleted:false}, function (err, pageCount) {
                    theCounts.pages = pageCount;
                    serverResponse(req, res, 200, theCounts);
                });
            });
        });
    }

};

exports.getCountsForUser = function(req,res){
    var userID = req.query.userID;
    var companyID = req.user.companyID;
    var theCounts = {};

        //get all reports
        var Reports = connection.model('Reports');
        Reports.count({companyID: companyID,owner:userID,isPublic:true,nd_trash_deleted:false}, function (err, reportCount) {
            theCounts.publishedReports = reportCount;
            //get all dashboards
            var Dashboards = connection.model('Dashboards');
            Dashboards.count({companyID: companyID,owner:userID,isPublic:true,nd_trash_deleted:false}, function (err, dashCount) {
                theCounts.publishedDashBoards = dashCount;

                Reports.count({companyID: companyID,owner:userID,isPublic:false,nd_trash_deleted:false}, function (err, privateReportCount) {
                    theCounts.privateReports = privateReportCount;

                    var Dashboards = connection.model('Dashboards');
                    Dashboards.count({companyID: companyID,owner:userID,isPublic:false,nd_trash_deleted:false}, function (err, privateDashCount) {
                        theCounts.privateDashBoards = privateDashCount;
                        serverResponse(req, res, 200, theCounts);
                    });
                });

            });
        });


};

exports.getUserReports = function(req,res){
    var perPage = config.pagination.itemsPerPage, page = (req.query.page) ? req.query.page : 1;
    var userID = req.query.userID;
    var companyID = req.user.companyID;
    var Reports = connection.model('Reports');
    Reports.find({companyID: companyID,owner:userID,nd_trash_deleted:false},{reportName:1,parentFolder:1,isPublic:1,reportType:1,reportDescription:1,status:1}, function (err, reports) {
        serverResponse(req, res, 200, {result: 1, page: page, pages: ((req.query.page) ? Math.ceil(count/perPage) : 1), items: reports});
    });
}

exports.getUserDashboards = function(req,res){
    var perPage = config.pagination.itemsPerPage, page = (req.query.page) ? req.query.page : 1;
    var userID = req.query.userID;
    var companyID = req.user.companyID;
    var Dashboards = connection.model('Dashboards');
    Dashboards.find({companyID: companyID,owner:userID,nd_trash_deleted:false},{dashboardName:1,parentFolder:1,isPublic:1,dashboardDescription:1,status:1}, function (err, privateDashCount) {
        serverResponse(req, res, 200, {result: 1, page: page, pages: ((req.query.page) ? Math.ceil(count/perPage) : 1), items: privateDashCount});
    });
}

exports.getUserPages = function(req,res){
    var perPage = config.pagination.itemsPerPage, page = (req.query.page) ? req.query.page : 1;
    var userID = req.query.userID;
    var companyID = req.user.companyID;
    var companyID = req.user.companyID;
    var Pages = connection.model('Pages');
    Pages.find({companyID: companyID,owner:userID,nd_trash_deleted:false},{pageName:1,parentFolder:1,isPublic:1,dashboardDescription:1,status:1}, function (err, pages) {
        serverResponse(req, res, 200, {result: 1, page: page, pages: ((req.query.page) ? Math.ceil(count/perPage) : 1), items: pages});
    });
}


exports.getUserData = function(req,res){
    var Companies = connection.model('Companies');
    Companies.findOne({companyID:req.user.companyID,nd_trash_deleted: false},{},function(err, company){


        var theUserData = {};
        theUserData.companyData = req.user.companyData;
        theUserData.companyID = req.user.companyID;
        theUserData.contextHelp = req.user.contextHelp;
        theUserData.dialogs = req.user.dialogs;
        theUserData.filters = req.user.filters;
        theUserData.privateSpace = req.user.privateSpace;
        theUserData.roles = req.user.roles;
        theUserData.rolesData = req.user.rolesData;
        theUserData.staus = req.user.status;
        theUserData.userName = req.user.userName;


        var createReports = false;
        var createDashboards = false;
        var createPages = false;
        var isWSTADMIN = false;
        var exploreData = false;
        var viewSQL = false;
        var publishReports = false;
        var publishDashboards = false;
        var canPublish = false;

        if(req.isAuthenticated()){

            for (var i in req.user.roles) {
                if (req.user.roles[i] == 'WSTADMIN'){
                    isWSTADMIN = true;
                    createReports = true;
                    createDashboards = true;
                    createPages = true;
                    exploreData = true;
                    viewSQL = true;
                    canPublish = true;
                    publishReports = true;
                    publishDashboards = true;

                    req.session.reportsCreate = createReports;
                    req.session.dashboardsCreate = createDashboards;
                    req.session.exploreData = exploreData;
                    req.session.viewSQL = viewSQL;
                    req.session.isWSTADMIN = isWSTADMIN;
                    req.session.canPublish = canPublish;
                    req.session.publishReports = publishReports;
                    req.session.publishDashboards = publishDashboards;

                    theUserData.reportsCreate = createReports;
                    theUserData.dashboardsCreate = createDashboards;
                    theUserData.exploreData = exploreData;
                    theUserData.viewSQL = viewSQL;
                    theUserData.isWSTADMIN = isWSTADMIN;
                    theUserData.canPublish = canPublish;
                    theUserData.publishReports = publishReports;
                    theUserData.publishDashboards = publishDashboards;
                }
            }
        }


        if (req.user.roles.length > 0 && !isWSTADMIN)
        {

            var Roles = connection.model('Roles');
            Roles.find({ _id : { $in : req.user.roles} },{},function(err, roles){
                req.session.rolesData = roles;

                for (var i in roles)
                {
                    if (roles[i].reportsCreate == true)
                        createReports = true;
                    if (roles[i].dashboardsCreate == true)
                        createDashboards = true;
                    if (roles[i].pagesCreate == true)
                        createPages = true;
                    if (roles[i].exploreData == true)
                        exploreData = true;
                    if (roles[i].viewSQL == true)
                        viewSQL = true;
                    if (roles[i].reportsPublish == true)
                        publishReports = true;
                    if (roles[i].dashboardsPublish == true)
                        publishDashboards = true;
                }

                req.session.reportsCreate = createReports;
                req.session.dashboardsCreate = createDashboards;
                req.session.pagesCreate = createPages;
                req.session.exploreData = exploreData;
                req.session.viewSQL = viewSQL;
                req.session.isWSTADMIN = isWSTADMIN;
                req.session.canPublish = canPublish;
                req.session.publishReports = publishReports;
                req.session.publishDashboards = publishDashboards;

                theUserData.reportsCreate = createReports;
                theUserData.dashboardsCreate = createDashboards;
                theUserData.exploreData = exploreData;
                theUserData.viewSQL = viewSQL;
                theUserData.isWSTADMIN = isWSTADMIN;
                theUserData.canPublish = canPublish;
                theUserData.publishReports = publishReports;
                theUserData.publishDashboards = publishDashboards;

                var userData = {}

                serverResponse(req, res, 200, {result: 1, page: 1, pages: 1, items: {user: theUserData, companyData:company, rolesData:roles, reportsCreate: createReports, dashboardsCreate: createDashboards, pagesCreate: createPages, exploreData: exploreData, viewSQL: viewSQL}});
            });


        } else {
         //var user = (req.user) ? req.user : false;
          serverResponse(req, res, 200, {result: 1, page: 1, pages: 1, items: {user: theUserData, companyData:company, rolesData:[], reportsCreate: createReports, dashboardsCreate: createDashboards, pagesCreate: createPages,exploreData: exploreData, viewSQL: viewSQL, isWSTADMIN: isWSTADMIN}});
        }

    });
};
exports.getUserOtherData = function(req, res)
{
    var Users = connection.model('Users');
    Users.findOne({_id:req.user._id},{},function(err, user){
            serverResponse(req, res, 200, {result: 1, page: 1, pages: 1, items: user});
    });
}


exports.getUserObjects = function(req, res){
    var Companies = connection.model('Companies');
    Companies.findOne({companyID:req.user.companyID,nd_trash_deleted: false},{},function(err, company){

        var folders = company.publicSpace;


        if (req.session.isWSTADMIN)
        {

            getFolderStructureForWSTADMIN(folders,0,true,function(){

                getNoFolderReports(function(reports){

                    getNoFolderDashboards(function(dashboards){

                        getNoFolderPages(function(pages){

                            for (var d in dashboards)
                                folders.push(dashboards[d]);
                            for (var r in reports)
                                folders.push(reports[r]);
                            for (var p in pages)
                                folders.push(pages[p]);
                            serverResponse(req, res, 200, {result: 1, page: 1, pages: 1, items: folders});

                        });

                    });
                });



            });

        } else {

        if (req.user.roles.length > 0)
            {
                var Roles = connection.model('Roles');
                var find = { _id : { $in : req.user.roles},companyID:req.user.companyID };
                if (req.session.isWSTADMIN)
                    find = {companyID:req.user.companyID };
                Roles.find(find,{},function(err, roles){

                    navigateRoles(req,folders,roles,function(canPublish){

                        getNoFolderReports(function(reports){

                           getNoFolderDashboards(function(dashboards){

                               getNoFolderPages(function(pages){
                                   for (var d in dashboards)
                                       folders.push(dashboards[d]);
                                   for (var r in reports)
                                       folders.push(reports[r]);
                                   for (var p in pages)
                                       folders.push(pages[p]);
                                   serverResponse(req, res, 200, {result: 1, page: 1, pages: 1, items: folders, userCanPublish: canPublish});

                               });
                           });
                        });
                    });
                }).lean();

            } else {
                //Has no access to any folder
                getNoFolderReports(function(reports){

                    getNoFolderDashboards(function(dashboards){

                        getNoFolderPages(function(pages){
                            for (var d in dashboards)
                                folders.push(dashboards[d]);
                            for (var r in reports)
                                folders.push(reports[r]);
                            for (var p in pages)
                                folders.push(pages[p]);

                            serverResponse(req, res, 200, {result: 1, page: 1, pages: 1, items: folders, userCanPublish: false});
                        });
                    });
                });

            }
        }

    });
}


function navigateRoles(req,folders,rolesData,done)
{
    var canPublish = false;

    var roleFound = false;

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
            roleFound = true;

            var theGrant = rolesData[r].grants[g];

            setGrantsToFolder_v2(req,folders,theGrant,r,g, function(roleIndex,grantIndex,publish){
            //setGrantsToFolder_old(req,folders,theGrant,r,g, function(roleIndex,grantIndex,publish){
            if (publish == true) canPublish = true;
            if (roleIndex == rolesData.length -1 && grantIndex == rolesData[roleIndex].grants.length -1)
                done(canPublish);
            });
        }
    }
    if (roleFound === false)
        done(false);
}


function setGrantsToFolder_v2(req,folders, grant,roleIndex,grantIndex, done)
{

    var publish = false;

    for (var i in folders)
    {
        if ((folders[i].id == grant.folderID))
        {
            folders[i].grants = grant;

            if (grant.publishReports == true)
            {
                publish = true;
            }

            getReportsForFolder(grant,grant.folderID,folders[i],function(reports,folder){
                    for (var n in reports)
                            folder.nodes.push(reports[n]);

                    getDashboardsForFolder(grant,grant.folderID,folder,function(dashboards,folder){
                            for (var n in dashboards)
                                folder.nodes.push(dashboards[n]);

                                getPagesForFolder(grant,grant.folderID,folder,function(pages,folder){
                                        for (var p in pages)
                                            folder.nodes.push(pages[p]);

                                        done(roleIndex,grantIndex,publish);

                                });

                    });

            });


        } else {
            if (folders[i].nodes)
                if (folders[i].nodes.length > 0)
                    setGrantsToFolder_v2(req,folders[i].nodes,grant,roleIndex,grantIndex,done);
        }
    }

}




function getFolderStructureForWSTADMIN(folders,index,firstRound, done) {

    var sec = 0;
    var i = index;

    if (folders[i] == undefined)
    {
       if (firstRound)
       {
            done();
       }
      return;

    } else {

            if (folders[i].nodes)
                if (folders[i].nodes.length > 0)
                    getFolderStructureForWSTADMIN(folders[i].nodes,0,false,done);


            var theFolder = folders[i];
            theFolder.grants = {folderID:theFolder.id, executeDashboards: true,executeReports:true ,executePages:true ,publishReports:true};

            getReportsForFolder(theFolder.grants,theFolder.id,theFolder,function(reports,folder){

                    folder = Object(folder);

                    for (var n in reports)
                    {
                        if (folder.nodes)
                            folder.nodes.push(reports[n]);
                    }

                    getDashboardsForFolder(theFolder.grants,folder.id,folder,function(dashboards,folder){
                            for (var n in dashboards)
                            {
                                if (folder.nodes)
                                folder.nodes.push(dashboards[n]);
                            }

                                getPagesForFolder(theFolder.grants,folder.id,folder,function(pages,folder){
                                        for (var p in pages)
                                            {
                                                if (folder.nodes)
                                                    folder.nodes.push(pages[p]);
                                            }

                                        getFolderStructureForWSTADMIN(folders,i+1,firstRound,done);
                                    });

                    });
                });
    }
}




function getReportsForFolder(grant,idfolder,folder,done)
{
    if (grant.executeReports == true)
    {
        var Reports = connection.model('Reports');

        var find = {"$and":[{"nd_trash_deleted":false},{"companyID":"COMPID"},{parentFolder:idfolder},{isPublic:true}]}
        var fields = {reportName:1,reportType:1,reportDescription:1};

        Reports.find(find,fields,{},function(err, reports){

            var nodes = [];
             for (var r in reports)
             {
                nodes.push({id:reports[r]._id,title:reports[r].reportName,nodeType:'report',description:reports[r].reportDescription,nodeSubtype:reports[r].reportType,nodes:[]});
             }
            done(nodes,folder);
        });
    } else {
        done([],folder);
    }
}

function getDashboardsForFolder(grant,idfolder,folder,done)
{
    if (grant.executeDashboards == true)
    {
        var Dashboards = connection.model('Dashboards');

            var find = {"$and":[{"nd_trash_deleted":false},{"companyID":"COMPID"},{parentFolder:idfolder},{isPublic:true}]}
            var fields = {dashboardName:1,dashboardDescription:1};

        Dashboards.find(find,fields,{},function(err, dashboards){

                var nodes = [];
                for (var r in dashboards)
                {
                    nodes.push({id:dashboards[r]._id,title:dashboards[r].dashboardName,nodeType:'dashboard',description:dashboards[r].dashboardDescription,nodes:[]});
                }

                done(nodes,folder)
            });

    } else {
        done([],folder);
    }
}


function getPagesForFolder(grant,idfolder,folder,done)
{
    if (grant.executePages == true)
    {
        var Pages = connection.model('Pages');

            var find = {"$and":[{"nd_trash_deleted":false},{"companyID":"COMPID"},{parentFolder:idfolder},{isPublic:true}]}
            var fields = {pageName:1,pageDescription:1};

        Pages.find(find,fields,{},function(err, pages){

                var nodes = [];
                for (var r in pages)
                {
                    nodes.push({id:pages[r]._id,title:pages[r].pageName,nodeType:'page',description:pages[r].pageDescription,nodes:[]});
                }

                done(nodes,folder)
            });
    } else {
        done([],folder);
    }
}


function getNoFolderReports(done)
{

    var Reports = connection.model('Reports');

    var find = {"$and":[{"nd_trash_deleted":false},{"companyID":"COMPID"},{isPublic:true},{parentFolder: 'root'}]}
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

    var find = {"$and":[{"nd_trash_deleted":false},{"companyID":"COMPID"},{isPublic:true},{parentFolder: 'root'}]}
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


function getNoFolderPages(done)
{
    var Pages = connection.model('Pages');

    var find = {"$and":[{"nd_trash_deleted":false},{"companyID":"COMPID"},{isPublic:true},{parentFolder: 'root'}]}
    var fields = {pageName:1,pageDescription:1};

    Pages.find(find,fields,{},function(err, pages){

        var nodes = [];
        for (var r in pages)
        {
            nodes.push({id:pages[r]._id,title:pages[r].pageName,nodeType:'page',description:pages[r].pageDescription,nodes:[]});
        }

        done(nodes)
    });
}

exports.getUserLastExecutions = function(req, res){
    var statistics = connection.model('statistics');


    if (req.session.isWSTADMIN)
    {
        var find = {action:"execute"};
    } else {
        var find = {"$and":[{userID:''+req.user._id+''},{action:"execute"}]}
    }

    //Last executions

    statistics.aggregate([
        { $match: find},
        { $group: {
            _id: {relationedID:"$relationedID",
                type: "$type",
                relationedName: "$relationedName",
                action: "$action"},
            lastDate: { $max: "$createdOn"}
        }},
        { $sort : { lastDate : -1 } }
    ], function (err, lastExecutions) {
        if (err) {
            console.log(err);
            return;
        }


        statistics.aggregate([
            { $match: find},
            { $group: {
                _id: {relationedID:"$relationedID",
                    type: "$type",
                    relationedName: "$relationedName",
                    action: "$action"},
                count: { $sum: 1 }
            }},
            { $sort : { count : -1 } }
        ], function (err, mostExecuted) {
            if (err) {
                console.log(err);
                return;
            }
            var mergeResults = {theLastExecutions : lastExecutions, theMostExecuted: mostExecuted };
            serverResponse(req, res, 200, {result: 1, page: 1, pages: 1, items: mergeResults});
        });

    });


}



