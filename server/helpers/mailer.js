const config = require('config');

module.exports.sendEmailTemplate = sendEmailTemplate;

function sendEmailTemplate (theEmailTemplate, recipients, emailField, subject) {
    var path = require('path');
    const Email = require('email-templates');
    var nodemailer = require('nodemailer');

    var templatesDir = path.resolve(__dirname, '../../', 'email_templates');
    var template = new Email({
        views: {
            root: templatesDir,
            options: {
                extension: 'ejs',
            },
        },
    });
    var transport = nodemailer.createTransport(config.get('mailer.options'), config.get('mailer.defaults'));

    const promises = [];
    for (const item of recipients) {
        if (!item.firstName) { item.firstName = ' '; }
        if (!item.lastName) { item.lastName = ' '; }
        const p = template.renderAll(theEmailTemplate, item).then(function (results) {
            return transport.sendMail({
                to: item[emailField],
                subject: subject,
                html: results.html,
                text: results.text
            });
        }).catch(function (err) {
            console.error(err);
        });

        promises.push(p);
    }

    return Promise.all(promises);
}
