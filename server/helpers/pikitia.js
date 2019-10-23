const config = require('config');
const request = require('request');

module.exports = {
    toPDF,
    toPNG,
};

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

    const tokenRequestOptions = {
        baseUrl: pikitiaUrl,
        url: '/oauth/token',
        method: 'POST',
        form: {
            grant_type: 'client_credentials',
        },
        auth: {
            user: config.get('pikitia.client_id'),
            pass: config.get('pikitia.client_secret'),
        },
    };

    const tokenBody = await requestPromise(tokenRequestOptions);
    const token = JSON.parse(tokenBody);

    const requestBody = {
        url: url,
    };
    for (const key of Object.keys(options)) {
        requestBody[key] = options[key];
    }

    const requestOptions = {
        baseUrl: pikitiaUrl,
        url: endpoint,
        method: 'POST',
        auth: {
            bearer: token.access_token,
        },
        body: requestBody,
        json: true,
        encoding: null,
    };

    return requestPromise(requestOptions);
}

function requestPromise (options) {
    return new Promise(function (resolve, reject) {
        request(options, function (err, res, body) {
            if (err) {
                return reject(err);
            }

            if (res.statusCode !== 200) {
                return reject(new Error(res.statusMessage));
            }

            resolve(body);
        });
    });
}
