module.exports = function (app, passport) {
    var server = require('../index.js');
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
    app.get('/admin', restrictRole('52988ac5df1fcbc201000008'), server.admin);
    app.get('/partial/:name', server.partial);
    app.get('/partial/:controller/:name', server.controllerPartial);
    app.get('/partial/custom/:controller/:name', server.controllerCustomPartial);
    app.get('/view/admin/:controller/:name', server.adminview);

    // JSON API
    app.get('/api/init-data', api.getInitData);

    /* ROBOTS */
    app.use(function (req, res, next) {
        if ('/robots.txt' == req.url) {
            res.type('text/plain')
            res.send("User-agent: *\nDisallow: /");
        } else {
            next();
        }
    });

    /* PASSTHROUGH */
    app.get('*', passthrough);
    app.post('*', passthrough);

    /* PASSPORT */

    //app.post('/api/login', api.login);
    app.post('/api/login', function(req, res, next) {
        var Users = connection.model('Users');

        if (req.query.s && req.query.s == 'change-user') {
            var data = req.body, restrictRole = true;
            var roles = ['52988ac5df1fcbc201000008', '5327d7ef9c3b0f7801acda0d'];
            var userRoles = (typeof req.user.roles == 'string') ? [req.user.roles] : req.user.roles;

            for (var i in roles) {
                if (userRoles && userRoles.indexOf(roles[i]) > -1){
                    restrictRole = false;
                    break;
                }
            }

            if (!restrictRole) {
                Users.findOne({username: data.username, company_id: req.user.company_id}, function(err, user){
                    if (user) {
                        req.body.password = user.hash+user.salt;

                        passport.authenticate('local', function(err, user, info) {
                            console.log(info);
                            if (err) { return next(err); }

                            req.logIn(user, function(err) {
                                if (err) { return next(err); }
                                res.json({ user : user.toObject() });
                            });
                        })(req, res, next);
                    }
                    else {
                        res.send(201, {result: 0, msg: 'User not found.'});
                    }
                });
            }
            else {
                res.send(201, {result: 0, msg: 'Invalid user role.'});
            }
        }
        else {
            passport.authenticate('local', function(err, user, info) {
                console.log(info);
                if (err) { return next(err); }

                var Configurations = connection.model('Configurations');

                if (!user) {
                    Configurations.getConfiguration('log-user-fail-login', function(configuration){
                        if (configuration.value == 1) {
                            saveToLog(req, 'User fail login: '+info.message, 102);
                        }
                        res.send(401, info.message);
                        return;
                    });
                }
                else {
                    Configurations.getConfiguration('log-user-login', function(configuration){
                        if (configuration.value == 1) {
                            saveToLog(req, 'User login: '+user.username+' ('+user.email+')', 102);
                        }
                        var loginData = {
                            "last_login_date" : new Date(),
                            "last_login_ip" : req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress
                        };

                        if (req.body.remember_me) {
                            var token = ((Math.random()*Math.pow(36,10) << 0).toString(36)).substr(-8);
                            loginData['accessToken'] = token;
                            res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 }); // 7 days
                        }

                        Users.update({
                            "_id" : user._id
                        }, {
                            $set: loginData
                        }, function (err) {
                            if(err) throw err;

                            req.logIn(user, function(err) {
                                if (err) { return next(err); }
                                res.json({ user : user.toObject() });
                            });
                        });
                    });
                }
            })(req, res, next);
        }
    });

    app.get('/api/loggedin', function(req, res) {
            res.send(req.isAuthenticated() ? '1' : '0');
        });

    app.get("/auth/facebook", passport.authenticate("facebook",{ scope : "email"}));

    app.get("/auth/facebook/callback",
        passport.authenticate("facebook",{ failureRedirect: '/#/login'}),
        function(req,res){
            var Configurations = connection.model('Configurations');

            Configurations.getConfiguration('logs-auth-module', function(configuration){
                if (configuration.value == 1) {
                    saveToLog(req, 'User Facebook login: '+req.user.username, 101);
                }
                res.redirect('../../../home/');
            });
        }
    );

    app.get('/auth/twitter', passport.authenticate('twitter'));

    app.get("/auth/twitter/callback",
        passport.authenticate("twitter",{ failureRedirect: '/#/login'}),
        function(req,res){
            var Configurations = connection.model('Configurations');

            Configurations.getConfiguration('logs-auth-module', function(configuration){
                if (configuration.value == 1) {
                    saveToLog(req, 'User Twitter login: '+req.user.username, 101);
                }
                res.redirect('../../../home/');
            });
        }
    );

    app.get('/auth/google', passport.authenticate('google'));

    app.get('/auth/google/return',
        passport.authenticate("google",{ failureRedirect: '/#/login'}),
        function(req,res){
            var Configurations = connection.model('Configurations');

            Configurations.getConfiguration('logs-auth-module', function(configuration){
                if (configuration.value == 1) {
                    saveToLog(req, 'User Google login: '+req.user.username, 101);
                }
                res.redirect('../../../home/');
            });
        }
    );
}
