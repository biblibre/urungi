const setCookieParser = require('set-cookie-parser');
const request = require('supertest');

async function login (app, username = 'administrator', password = 'urungi') {
    let res = await request(app).get('/login');

    let cookies = getCookiesFromResponse(res);
    const xsrfToken = cookies['XSRF-TOKEN'].value;
    const headers = {
        'X-XSRF-TOKEN': xsrfToken,
        Cookie: Object.values(cookies).map(c => c.name + '=' + c.value).join('; '),
    };

    res = await request(app).post('/api/login')
        .set(headers)
        .send({ userName: username, password: password });

    cookies = getCookiesFromResponse(res);
    headers.Cookie = Object.values(cookies).map(c => c.name + '=' + c.value).join('; ');

    return headers;
}

function getCookiesFromResponse (res) {
    let setCookieHeader = res.headers['set-cookie'];
    if (setCookieHeader.length === 1) {
        setCookieHeader = setCookieParser.splitCookiesString(setCookieHeader[0]);
    }
    const cookies = setCookieParser.parse(setCookieHeader, { map: true });

    return cookies;
}

module.exports = {
    login: login,
};
