const config = require('config');
const fetch = require('node-fetch');

module.exports = {
    isConfigured,
    toPDF,
    toPNG,
};

function isConfigured () {
    return config.has('pikitia.url') && config.has('pikitia.client_id') && config.has('pikitia.client_secret');
}

/**
 * Ask Pikitia to generate a PNG of given URL
 *
 * @param {string} url - URL to take a screenshot of
 * @param {object} options - Options
 * @param {object} options.cookies - Cookies object where key is cookie name
 *  and value is cookie value
 * @returns Promise<Buffer>
 */
function toPDF (url, options) {
    return render(url, '/pdf', options);
}

/**
 * Ask Pikitia to generate a PNG of given URL
 *
 * @param {string} url - URL to take a screenshot of
 * @param {object} options - Options
 * @param {object} options.cookies - Cookies object where key is cookie name
 *  and value is cookie value
 * @returns Promise<Buffer>
 */
function toPNG (url, options) {
    return render(url, '/screenshot', options);
}

async function render (url, endpoint, options) {
    const pikitiaUrl = config.get('pikitia.url');
    const clientId = config.get('pikitia.client_id');
    const clientSecret = config.get('pikitia.client_secret');

    const tokenUrl = pikitiaUrl + '/oauth/token';
    const tokenRequestOptions = {
        method: 'POST',
        headers: {
            Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    };

    const tokenResponse = await fetch(tokenUrl, tokenRequestOptions);
    const token = await tokenResponse.json();

    const requestBody = {
        url,
    };
    for (const key of Object.keys(options)) {
        requestBody[key] = options[key];
    }

    const requestUrl = pikitiaUrl + endpoint;
    const requestOptions = {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + token.access_token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    };

    const response = await fetch(requestUrl, requestOptions);
    if (!(response.ok)) {
        throw new Error('Export failed');
    }
    return response.buffer();
}
