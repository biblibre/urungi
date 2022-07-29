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

const urungiRoot = path.join(__dirname, '..');

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(urungiRoot, 'views'));

app.use(express.static(path.join(urungiRoot, 'public'), { maxAge: '1d' }));
app.use(express.static(path.join(urungiRoot, 'shared'), { maxAge: '1d' }));

app.use('/doc', require('./routes/doc.js'));

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
