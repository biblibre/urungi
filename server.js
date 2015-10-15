var env = process.env.NODE_ENV || 'development';
// Application Params
process.argv.forEach(function(val, index, array) {
    if (index == 2) env = val;
});
global.env = env;

// production only
if (env == 'production') {
    //require('newrelic');
};



var express = require('express'),
    path = require('path'),
    http = require('http');

var cluster = require('cluster');
var mongoose = require('mongoose');
var passport = require("passport");
var session = require('express-session');
var RedisStore = require('connect-redis')(session); //npm install connect-redis --- to store variable sessions
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));

//app.use("/public", express.static(__dirname + "/public"));
//app.use("/public", express.static(__dirname + "/bower_components"));

app.use(cookieParser());
app.use(cookieSession({key:"widestage", secret:"HEWÑÑasdfwejñlkjqwernnkkk13134134wer", httpOnly: true, secure: false, cookie: {maxAge: 60 * 60 * 1000}}));
app.use(session({secret: 'ndwidestagev0', cookie: {httpOnly: true, secure: false}, store: new RedisStore({maxAge: 60 * 60 * 1000}), resave: false, saveUninitialized: true}));


var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'})); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

var authentication = true;

global.authentication  = authentication;

global.logFailLogin = true;
global.logSuccessLogin = true;

if (authentication)
{
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(passport.authenticate('remember-me'));
}





if (cluster.isMaster) {
    var numCPUs = require('os').cpus().length;

    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        console.log ('forking ',i);
        cluster.fork();
    }

    cluster.on('exit', function(deadWorker, code, signal) {
        var worker = cluster.fork();

        // Note the process IDs
        var newPID = worker.process.pid;
        var oldPID = deadWorker.process.pid;

        // Log the event
        console.log('worker '+oldPID+' died.');
        console.log('worker '+newPID+' born.');
    });
} else {
    var config = require('./server/config/config')[env];
    global.config = config;

    require('./server/config/mongoose')(mongoose);
    require('./server/config/passport')(passport);

    require('./server/globals');
    require('./server/config/mailer');

    require('./server/config/routes')(app, passport);
    //require('./server/config/routes')(app);

    var fs = require('fs');

    //Custom routes
    var routes_dir = __dirname + '/server/custom';
    fs.readdirSync(routes_dir).forEach(function (file) {
        if(file[0] === '.') return;
        require(routes_dir+'/'+ file+'/routes.js')(app);
    });

    var ipaddr  = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
    var port    = process.env.OPENSHIFT_NODEJS_PORT || config.port;

    app.listen(port, ipaddr);

    console.log("Server running at http://" + ipaddr + ":" + port + "/ in worker "+cluster.worker.id);
}
