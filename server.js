const config = require('config');
const debug = require('debug')('urungi:server');

const express = require('express');
const path = require('path');

var cluster = require('cluster');
var passport = require('passport');
// var mongoose = require('mongoose');
var session = require('express-session');

const MongoStore = require('connect-mongo')(session);

var cookieParser = require('cookie-parser');

// var bb = require('express-busboy');
var app = express();
// bb.extend(app);

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));

const mongooseConnection = require('mongoose').createConnection(config.get('db'));
const mongoStore = new MongoStore({
    mongooseConnection: mongooseConnection,
    collection: 'wst_Sessions',
    ttl: 60 * 60 * 24, // 24 hours
});
app.locals.mongooseConnection = mongooseConnection;
app.use(cookieParser());

app.use(session({
    secret: 'ndurungiv0',
    cookie: {
        httpOnly: true,
        secure: false,
    },
    store: mongoStore,
    resave: false,
    saveUninitialized: true
}));

app.use(function (req, res, next) {
    if (!req.session) {
        return next(new Error('Session initialization failed, check the server logs'));
    }
    next();
});

var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'})); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

var authentication = true;

global.authentication = authentication;
global.logFailLogin = true;
global.logSuccessLogin = true;

if (authentication) {
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(passport.authenticate('remember-me'));
}

if (cluster.isMaster && process.env.NODE_ENV !== 'test') {
    var numCPUs = require('os').cpus().length;

    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', function (deadWorker, code, signal) {
        cluster.fork();
    });
} else {
    global.config = config;

    require('./server/config/mongoose')();
    require('./server/config/passport')(passport);

    require('./server/globals');
    require('./server/config/mailer');

    require('./server/config/routes')(app, passport);

    var fs = require('fs');

    app.use('/uploads', restrict, express.static(path.join(__dirname, 'uploads')));

    // Custom routes
    var routes_dir = path.join(__dirname, 'server', 'custom');
    fs.readdirSync(routes_dir).forEach(function (file) {
        if (file[0] === '.') return;
        require(routes_dir + '/' + file + '/routes.js')(app);
    });

    var ipaddr = process.env.IP || config.get('ip');
    var port = process.env.PORT || config.get('port');

    if (process.env.NODE_ENV !== 'test') {
        app.listen(port, ipaddr);

        debug('Server running at http://' + ipaddr + ':' + port + '/');
    }
}

module.exports = app;
