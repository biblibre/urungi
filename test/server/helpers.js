const setCookieParser = require('set-cookie-parser');
const request = require('supertest');

async function login (app, username = 'administrator', password = 'urungi') {
    const res = await request(app).get('/login');
    let setCookieHeader = res.headers['set-cookie'];
    if (setCookieHeader.length === 1) {
        setCookieHeader = setCookieParser.splitCookiesString(setCookieHeader[0]);
    }
    const cookies = setCookieParser.parse(setCookieHeader, { map: true });
    const cookie = Object.values(cookies).map(c => c.name + '=' + c.value).join('; ');
    const xsrfToken = cookies['XSRF-TOKEN'].value;
    const headers = {
        'X-XSRF-TOKEN': xsrfToken,
        'Cookie': cookie,
    };

    await request(app).post('/api/login')
        .set(headers)
        .send({ userName: username, password: password });

    return headers;
}

module.exports = {
    login: login,
};
