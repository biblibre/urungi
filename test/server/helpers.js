const setCookieParser = require('set-cookie-parser');
const request = require('supertest');

async function login (app, username = 'administrator', password = 'urungi') {
    let res = await request(app).get('/login');

    // Retrieve session id and CSRF token that are necessary for login
    let responseCookies = getCookiesFromResponse(res);
    let sid = responseCookies['connect.sid'].value;
    const headers = { Cookie: `connect.sid=${sid}` };
    const _csrf = res.text.match('name="_csrf" value="(.*?)"')[1];

    // Log in
    res = await request(app).post('/login')
        .set(headers)
        .send(`username=${username}&password=${password}&_csrf=${_csrf}`);

    // Retrieve the new session id
    responseCookies = getCookiesFromResponse(res);
    sid = responseCookies['connect.sid'].value;
    headers.Cookie = `connect.sid=${sid}`;

    // Retrieve a valid CSRF token
    res = await request(app).get('/').set(headers);
    responseCookies = getCookiesFromResponse(res);
    headers['X-XSRF-TOKEN'] = responseCookies['XSRF-TOKEN'].value;

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
