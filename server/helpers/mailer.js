const config = require('config');
const path = require('path');
const { Liquid } = require('liquidjs');
const nodemailer = require('nodemailer');

module.exports.sendEmailTemplate = sendEmailTemplate;

function sendEmailTemplate (theEmailTemplate, recipients, emailField, subject) {
    const templatesDir = path.resolve(__dirname, '../', 'email_templates');
    const transport = nodemailer.createTransport(config.get('mailer.options'), config.get('mailer.defaults'));
    const liquid = new Liquid({
        root: templatesDir,
    });

    const promises = [];
    for (const item of recipients) {
        if (!item.firstName) { item.firstName = ' '; }
        if (!item.lastName) { item.lastName = ' '; }
        const p = Promise.all([
            liquid.renderFile(theEmailTemplate + '/html.liquid', item),
            liquid.renderFile(theEmailTemplate + '/text.liquid', item),
        ]).then(function ([html, text]) {
            return transport.sendMail({
                to: item[emailField],
                subject: subject,
                html: html,
                text: text,
            });
        }).catch(function (err) {
            console.error(err);
        });

        promises.push(p);
    }

    return Promise.all(promises);
}
