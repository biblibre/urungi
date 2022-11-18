const setCookieParser = require('set-cookie-parser');
const request = require('supertest');

async function login (app, username = 'administrator', password = 'urungi') {
    const res = await request(app).get('/login');
    const _csrf = res.text.match('name="_csrf" value="(.*?)"')[1];
    let setCookieHeader = res.headers['set-cookie'];
    if (setCookieHeader.length === 1) {
        setCookieHeader = setCookieParser.splitCookiesString(setCookieHeader[0]);
    }
    const cookies = setCookieParser.parse(setCookieHeader, { map: true });
    const cookie = Object.values(cookies).map(c => c.name + '=' + c.value).join('; ');
    const headers = {
        'X-XSRF-TOKEN': _csrf,
        Cookie: cookie,
    };

    await request(app).post('/login')
        .set(headers)
        .send(`username=${username}&password=${password}&_csrf=${_csrf}`);

    return headers;
}

module.exports = {
    login: login,
};
