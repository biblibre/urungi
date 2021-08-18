const config = require('config');
const util = require('util');
const ejs = require('ejs');
const path = require('path');
const nodemailer = require('nodemailer');

module.exports.sendEmailTemplate = sendEmailTemplate;

function sendEmailTemplate (theEmailTemplate, recipients, emailField, subject) {
    const templatesDir = path.resolve(__dirname, '../', 'email_templates');
    const transport = nodemailer.createTransport(config.get('mailer.options'), config.get('mailer.defaults'));

    const promises = [];
    for (const item of recipients) {
        if (!item.firstName) { item.firstName = ' '; }
        if (!item.lastName) { item.lastName = ' '; }
        const renderFile = util.promisify(ejs.renderFile);
        const p = Promise.all([
            renderFile(path.join(templatesDir, theEmailTemplate, 'html.ejs'), item),
            renderFile(path.join(templatesDir, theEmailTemplate, 'text.ejs'), item),
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
