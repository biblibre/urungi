const debug = require('debug')('urungi:server');
const cluster = require('cluster');
const migrate = require('migrate-mongo');

if (cluster.isMaster) {
    migrate.database.connect().then(db => {
        return migrate.status(db).then(statuses => {
            db.close();
            if (statuses.some(s => s.appliedAt === 'PENDING')) {
                throw new Error('Some migrations are pending. Run `npx migrate-mongo up` before starting the server');
            }
        });
    }).then(function () {
        var numCPUs = require('os').cpus().length;

        // Fork workers.
        for (var i = 0; i < numCPUs; i++) {
            cluster.fork();
        }

        cluster.on('exit', function (deadWorker, code, signal) {
            cluster.fork();
        });
    }, function (error) {
        console.error('Error: ' + error.message);
        process.exitCode = 1;
    });
} else {
    const config = require('config');
    const app = require('./server/app');

    var ipaddr = process.env.IP || config.get('ip');
    var port = process.env.PORT || config.get('port');

    app.listen(port, ipaddr);
    debug('Server running at http://' + ipaddr + ':' + port + '/');
}
