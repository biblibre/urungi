const config = require('config');

const express = require('express');
const path = require('path');

var passport = require('passport');
var session = require('express-session');

const MongoStore = require('connect-mongo')(session);

var cookieParser = require('cookie-parser');
const csurf = require('csurf');

const restrict = require('./middlewares/restrict.js');

var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.static(path.join(__dirname, '..', 'shared')));
app.use(express.static(path.join(__dirname, '..', 'dist')));

const connection = require('./config/mongoose')();

const mongoStore = new MongoStore({
    mongooseConnection: connection,
    collection: 'sessions',
    ttl: 60 * 60 * 24, // 24 hours
});
app.use(cookieParser());

app.use(session({
    secret: config.get('session.secret'),
    cookie: {
        httpOnly: true,
        secure: false,
    },
    store: mongoStore,
    resave: false,
    saveUninitialized: true,
    unset: 'destroy',
}));

app.use(function (req, res, next) {
    if (!req.session) {
        return next(new Error('Session initialization failed, check the server logs'));
    }
    next();
});

app.use(csurf());

var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb' })); // get information from html forms
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

require('./config/passport')(passport);

require('./config/routes')(app, passport);

app.use('/uploads', restrict, express.static(path.join(__dirname, 'uploads')));

// Custom routes
const routesModules = [
    './custom/companies/routes',
    './custom/dashboards/routes',
    './custom/dashboardsv2/routes',
    './custom/data-sources/routes',
    './custom/files/routes',
    './custom/layers/routes',
    './custom/reports/routes',
    './custom/roles/routes',
    './custom/statistics/routes',
    './custom/themes/routes',
    './custom/users/routes',
    './custom/version/routes',
];

for (const routesModule of routesModules) {
    require(routesModule)(app);
}

// Catch-all route, it should always be defined last
app.get('*', function (req, res) {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    res.render('index', { base: config.get('base') });
});

module.exports = app;
