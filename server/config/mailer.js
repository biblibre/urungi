function sendEmail (emailSubject, emailMessage, emailTo) {
    var nodemailer = require('nodemailer');
    var transportSMTP = nodemailer.createTransport('SMTP', {
        host: config.get('mailer.host'), // hostname
        secureConnection: config.get('mailer.secureConnection'), // use SSL
        port: config.get('mailer.port'), // port for secure SMTP
        auth: {
            user: config.get('mailer.auth.user'),
            pass: config.get('mailer.auth.pass')
        }
    });

    var mailOptions = {
        from: config.get('mailer.from'), // sender address
        to: emailTo, // list of receivers
        subject: emailSubject, // Subject line
        html: emailMessage // html body
    };

    transportSMTP.sendMail(mailOptions, function (error, response) {
        if (error) {
            console.log(error);
        } else {

        }

        transportSMTP.close(); // shut down the connection pool, no more messages
    });
}
global.sendEmail = sendEmail;

function sendEmailTemplate (theEmailTemplate, recipients, emailField, subject) {
    var path = require('path');
    var EmailTemplate = require('email-templates').EmailTemplate;
    var nodemailer = require('nodemailer');
    var async = require('async');

    var templatesDir = path.resolve(__dirname, '../../', 'email_templates/' + theEmailTemplate);
    var template = new EmailTemplate(templatesDir);
    var transport;
    if (config.get('mailer.service') !== 'SMTP') {
        transport = nodemailer.createTransport({
            service: config.get('mailer.service'),
            auth: {
                user: config.get('mailer.auth.user'),
                pass: config.get('mailer.auth.pass')
            }
        });
    } else {
        transport = nodemailer.createTransport({
            host: config.get('mailer.host'), // hostname
            secureConnection: config.get('mailer.secureConnection'), // use SSL
            port: config.get('mailer.port'), // port for secure SMTP
            auth: {
                user: config.get('mailer.auth.user'),
                pass: config.get('mailer.auth.pass')
            }
        });
    }

    // Send 10 mails at once
    async.mapLimit(recipients, 10, function (item, next) {
        if (!item.firstName) { item.firstName = ' '; }
        if (!item.lastName) { item.lastName = ' '; }
        template.render(item, function (err, results) {
            if (err) return next(err);
            transport.sendMail({
                from: config.get('mailer.from'),
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
        });
    }, function (err) {
        if (err) {
            console.error(err);
        }
    });
}

global.sendEmailTemplate = sendEmailTemplate;
