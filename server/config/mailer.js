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
    var async = require('async');

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

    // Send 10 mails at once
    async.mapLimit(recipients, 10, function (item, next) {
        if (!item.firstName) { item.firstName = ' '; }
        if (!item.lastName) { item.lastName = ' '; }
        template.renderAll(theEmailTemplate, item).then(function (results) {
            transport.sendMail({
                to: item[emailField],
                subject: subject,
                html: results.html,
                text: results.text
            }, function (err, responseStatus) {
                if (err) {
                    return next(err);
                }
                next(null, responseStatus.message);
            });
        }).catch(function (err) {
            next(err);
        });
    }, function (err) {
        if (err) {
            console.error(err);
        }
    });
}

global.sendEmailTemplate = sendEmailTemplate;
