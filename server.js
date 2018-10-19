const debug = require('debug')('urungi:server');
const cluster = require('cluster');

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
    const app = require('./app');

    var ipaddr = process.env.IP || config.get('ip');
    var port = process.env.PORT || config.get('port');

    app.listen(port, ipaddr);
    debug('Server running at http://' + ipaddr + ':' + port + '/');
}
