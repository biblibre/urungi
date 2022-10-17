const config = require('config');

function url (path) {
    return config.get('base') + path;
}

module.exports = url;
