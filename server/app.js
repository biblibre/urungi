const config = require('config');

const express = require('express');
const path = require('path');

const passport = require('passport');
const session = require('express-session');

const MongoStore = require('connect-mongo');

const cookieParser = require('cookie-parser');
const csurf = require('csurf');

const restrict = require('./middlewares/restrict.js');

const app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.static(path.join(__dirname, '..', 'shared')));
app.use(express.static(path.join(__dirname, '..', 'dist')));

const staticRouter = express.Router({
    caseSensitive: true,
    strict: true,
});

const staticPaths = [
    { p: '/jquery', root: 'jquery/dist' },
    { p: '/jquery-validation', root: 'jquery-validation/dist' },
    { p: '/jquery-ui', root: 'components-jqueryui' },
    { p: '/bootstrap', root: 'bootstrap/dist' },
    { p: '/angular', root: 'angular' },
    { p: '/angular-sanitize', root: 'angular-sanitize' },
    { p: '/angular-route', root: 'angular-route' },
    { p: '/pnotify-core', root: '@pnotify/core/dist' },
    { p: '/pnotify-bootstrap3', root: '@pnotify/bootstrap3/dist' },
    { p: '/pnotify-fontawesome4', root: '@pnotify/font-awesome4/dist' },
    { p: '/moment', root: 'moment/min' },
    { p: '/angularjs-bootstrap-datetimepicker', root: 'angularjs-bootstrap-datetimepicker/src' },
    { p: '/angular-ui-tree', root: 'angular-ui-tree/dist' },
    { p: '/angular-file-saver', root: 'angular-file-saver/dist' },
    { p: '/angular-ui-bootstrap', root: 'angular-ui-bootstrap/dist' },
    { p: '/angular-ui-sortable', root: 'angular-ui-sortable/dist' },
    { p: '/ui-select', root: 'ui-select/dist' },
    { p: '/d3', root: 'd3/dist' },
    { p: '/c3', root: 'c3' },
    { p: '/ng-file-upload', root: 'ng-file-upload/dist' },
    { p: '/clipboard', root: 'clipboard/dist' },
    { p: '/ngclipboard', root: 'ngclipboard/dist' },
    { p: '/angular-bootstrap-colorpicker', root: 'angular-bootstrap-colorpicker' },
    { p: '/malihu-custom-scrollbar-plugin', root: 'malihu-custom-scrollbar-plugin' },
    { p: '/angular-gettext', root: 'angular-gettext/dist' },
    { p: '/intro.js', root: 'intro.js/minified' },
    { p: '/angular-intro.js', root: 'angular-intro.js/build' },
    { p: '/numeral', root: 'numeral/min' },
    { p: '/pivottable', root: 'pivottable/dist' },
    { p: '/subtotal', root: 'subtotal/dist' },
    { p: '/js-xlsx', root: 'js-xlsx/dist' },
    { p: '/jsplumb', root: 'jsplumb' },
    { p: '/font-awesome', root: 'font-awesome' },
    { p: '/leaflet', root: 'leaflet/dist' },
];
for (const { p, root } of staticPaths) {
    staticRouter.use(p, express.static(path.join(__dirname, '..', 'node_modules', root)));
}

staticRouter.all('*', function (req, res) {
    res.sendStatus(404);
});

app.use('/s', staticRouter);

const connection = require('./config/mongoose')();

const mongoStore = MongoStore.create({
    client: connection.getClient(),
    collectionName: 'sessions',
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

const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb' })); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

global.logFailLogin = true;
global.logSuccessLogin = true;

app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

require('./config/routes')(app, passport);

app.use('/uploads', restrict, express.static(path.join(__dirname, '..', 'uploads')));

const api = require('./routes/api.js');
app.use('/api', api);

// Custom routes
const routesModules = [
    './custom/dashboards/routes',
    './custom/reports/routes',
];

for (const routesModule of routesModules) {
    require(routesModule)(app);
}

// Catch-all route, it should always be defined last
app.get('*', function (req, res) {
    res.cookie('XSRF-TOKEN', req.csrfToken(), { sameSite: true });
    res.render('index', { base: config.get('base') });
});

module.exports = app;
