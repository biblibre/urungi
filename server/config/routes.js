module.exports = function (app) {
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
