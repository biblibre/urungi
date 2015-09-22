module.exports = function (app, passport) {
    var api = require('../api.js');


    app.get('/',restrict, function(req, res) {
        res.render('index');
    });

    app.get('/login', function(req, res, next) {
        res.render('login');
    });

    app.get('/partial/:name', api.partial);
    app.get('/partial/:controller/:name', api.controllerPartial);
    app.get('/partial/custom/:controller/:name', api.controllerCustomPartial);


    /* PASSTHROUGH */
    app.get('*', passthrough);
    app.post('*', passthrough);

    app.post('/api/login', function(req, res, next) {
        var Users = connection.model('Users');
        //var Companies = connection.model('Companies');

        Users.count({}, function(err, c)
        {
            if (c == 0)
            {
                console.log('no records in the users model, this is the initial setup!');

                var theCompany = {};
                //theCompany._id = 'COMPID';
                theCompany.companyID = 'COMPID';
                theCompany.createdBy = 'widestage setup';
                theCompany.nd_trash_deleted = false;
                Companies.create(theCompany,function(result){

                });

                var adminUser = {};
                adminUser.userName = 'administrator';
                adminUser.companyID = 'COMPID';
                adminUser.password = 'widestage';
                adminUser.roles = [];
                adminUser.roles.push('WSTADMIN');
                adminUser.status = 'active';
                adminUser.nd_trash_deleted = false;
                Users.createTheUser(adminUser,function(result){
                    authenticate(passport,Users,req, res, next);
                });

                //TODO: create the company record...
            } else {
                authenticate(passport,Users,req, res, next);
            }
        });

    });

}


function authenticate(passport, Users, req, res, next)
{
    passport.authenticate('local', function(err, user, info) {
        console.log(info);
        if (err) { return next(err); }

        if (!user) {
                if (global.logFailLogin == true)
                    saveToLog(req, 'User fail login: '+info.message, 102);
                res.send(401, info.message);
                return;
        } else {

                var loginData = {
                    "last_login_date" : new Date(),
                    "last_login_ip" : req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress
                };

                if (req.body.remember_me) {
                    var token = ((Math.random()*Math.pow(36,10) << 0).toString(36)).substr(-8);
                    loginData['accessToken'] = token;
                    res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 }); // 7 days
                }

            //console.log('This is the user info',JSON.stringify(user));

            //insert the company's Data into the user to avoid a 2nd server query'
            var Companies = connection.model('Companies');

            Companies.findOne({companyID:user.companyID},{},function(err, company){

                if (!company)
                {
                    saveToLog(req, 'User fail login: '+user.userName+' ('+user.email+') user company not found!', 102);
                    res.send(401, "User's company not found!");

                } else {
                    user.companyData = company;

                    Users.update({
                        "_id" : user._id
                    }, {
                        $set: loginData
                    }, function (err) {
                        if(err) throw err;

                        req.logIn(user, function(err) {
                            if (err) { return next(err); }
                            res.json({ user : user.toObject() });

                            if (global.logSuccessLogin == true) {
                                saveToLog(req, 'User login: '+user.userName+' ('+user.email+')', 102);
                            }
                        });
                    });
                }

            });



        }
    })(req, res, next);
}


/*
module.exports = function (app, passport) {
    //var server = require('../index.js');
    var api = require('../api.js');

    // Routes
    app.get('/', server.login);
    app.get('/login', function(req, res, next) {
        res.writeHead(301,
            {Location: '/'}
        );
        res.end();
    });
    app.get('/public', server.index);
    app.get('/register', server.register);
    app.get('/home', restrict, server.webapp);


// use res.render to load up an ejs view file
// index page
    app.get('/', function(req, res) {
        res.render('index');
    });

// about page
    app.get('/about', function(req, res) {
        res.render('pages/about');
    });

    app.get('/api/get-cubes', function(req, res){
        var cubes = [];
        var cube = {cubeID:'123456789',cubeName:'cube1',cubeLabel:'cuabe 1',cubeDescription:'Descripción del cubo 1'};
        cubes.push(cube);
        var cube = {cubeID:'000006789',cubeName:'cube2',cubeLabel:'cuabe 2',cubeDescription:'Descripción del cubo 2'};
        cubes.push(cube);

        res.send(cubes);
    });

}  */
