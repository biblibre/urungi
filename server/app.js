const config = require('config');

const express = require('express');
const path = require('path');

const passport = require('passport');
const session = require('express-session');
const Negotiator = require('negotiator');

const MongoStore = require('connect-mongo');

const cookieParser = require('cookie-parser');
const csurf = require('csurf');

const restrict = require('./middlewares/restrict.js');

const gettext = require('./config/gettext.js');
const liquid = require('./config/liquid.js');

const app = express();

const urungiRoot = path.join(__dirname, '..');

// set the view engine to liquid
app.engine('liquid', liquid.express());
app.set('view engine', 'liquid');
app.set('views', path.join(urungiRoot, 'views'));
app.locals.base = config.get('base');
app.locals.availableLanguages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
];

for (const dir of ['css', 'images', 'js', 'partials', 'resources', 's', 'themes', 'translations']) {
    const router = express.Router();
    router.use(express.static(path.join(urungiRoot, 'public', dir), { maxAge: '1d' }));
    router.all('*', function (req, res) {
        res.sendStatus(404);
    });
    app.use(`/${dir}`, router);
}
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

app.use(function (req, res, next) {
    const availableLanguages = req.app.locals.availableLanguages.map(l => l.code);
    let language;

    if (req.cookies.language && availableLanguages.includes(req.cookies.language)) {
        language = req.cookies.language;
    } else {
        const negotiator = new Negotiator(req);
        language = negotiator.language(availableLanguages);
    }

    language = language || 'en';
    gettext.setLocale(language);
    require('moment').locale(language);
    res.locals.locale = language;
    res.cookie('language', language, { sameSite: 'Strict', path: app.locals.base || '/' });

    next();
});

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

const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb' })); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.use(csurf());

global.logFailLogin = true;
global.logSuccessLogin = true;

app.use(passport.session());

app.use(require('./middlewares/flash.js'));

app.use(function (req, res, next) {
    res.locals.session = {};

    res.locals.session.flash = () => req.flash();

    if (req.user) {
        const user = req.user.toObject({ getters: true });
        user.isAdmin = req.user.isAdmin();
        res.locals.session.user = user;
    }
    next();
});

require('./config/passport')(passport);

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

app.use('/', require('./routes.js'));

module.exports = app;
