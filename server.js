const config = require('config');
const cluster = require('cluster');

if (cluster.isMaster) {
    const workers = config.get('workers');

    // Fork workers.
    for (let i = 0; i < workers; i++) {
        cluster.fork();
    }

    process.on('SIGTERM', terminate);
    process.on('SIGINT', terminate);

    cluster.on('exit', function () {
        cluster.fork();
    });
} else {
    require('./bin/www');
}

function terminate () {
    for (const id in cluster.workers) {
        cluster.workers[id].kill();
    }
    process.exit(0);
}
