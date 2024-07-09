module.exports = {
    url: 'http://localhost:8080/',
    ip: '127.0.0.1',
    port: 8080,
    db: 'mongodb://127.0.0.1:27017/urungi_test',
    mailer: {
        options: {
            sendmail: false,
            jsonTransport: true,
        },
    },
};
