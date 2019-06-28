function sendEmail (emailSubject, emailMessage, emailTo) {
    var nodemailer = require('nodemailer');
    var transport = nodemailer.createTransport(config.get('mailer.options'), config.get('mailer.defaults'));

    var mailOptions = {
        to: emailTo, // list of receivers
        subject: emailSubject, // Subject line
        html: emailMessage // html body
    };

    transport.sendMail(mailOptions, function (error, response) {
        if (error) {
            console.log(error);
        } else {

        }

        transport.close(); // shut down the connection pool, no more messages
    });
}
global.sendEmail = sendEmail;

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

    for (const item of recipients) {
        if (!item.firstName) { item.firstName = ' '; }
        if (!item.lastName) { item.lastName = ' '; }
        template.renderAll(theEmailTemplate, item).then(function (results) {
            transport.sendMail({
                to: item[emailField],
                subject: subject,
                html: results.html,
                text: results.text
            });
        }).catch(function (err) {
            console.error(err);
        });
    }
}

global.sendEmailTemplate = sendEmailTemplate;
