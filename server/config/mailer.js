function sendEmail(emailSubject, emailMessage, emailTo) {

    var nodemailer = require("nodemailer");
    var transportSMTP = nodemailer.createTransport("SMTP", {
        host: config.mailer.host, // hostname
        secureConnection: config.mailer.secureConnection, // use SSL
        port: config.mailer.port, // port for secure SMTP
        auth: {
            user: config.mailer.auth.user,
            pass: config.mailer.auth.pass
        }
    });

    var mailOptions = {
        from: config.mailer.from, // sender address
        to: emailTo, // list of receivers
        subject: emailSubject, // Subject line
        html: emailMessage // html body
    };

    transportSMTP.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log(response);
        }

    transportSMTP.close(); // shut down the connection pool, no more messages

    });
}
global.sendEmail = sendEmail;



function sendEmailTemplate(theEmailTemplate,recipients,emailField,subject)
{
    var path = require('path')
    var EmailTemplate = require('email-templates').EmailTemplate;
    var nodemailer = require('nodemailer')
    var wellknown = require('nodemailer-wellknown')
    var async = require('async')


var templatesDir = path.resolve(__dirname, '../../', 'email_templates/'+theEmailTemplate)
<<<<<<< HEAD
    console.log('the template dir',templatesDir);
    //console.log('the template dir',path.join(templatesDir, theEmailTemplate));
var template = new EmailTemplate(templatesDir);
    //var template = new EmailTemplate(templatesDir);
//console.log('the template',JSON.stringify(template));
=======
    var template = new EmailTemplate(templatesDir);
>>>>>>> 455740930a702e05dfb736b5cae857304584f614


    if (config.mailer.service != 'SMTP')
    {
        var transport = nodemailer.createTransport({
            service: config.mailer.service,
            auth: {
                user: config.mailer.auth.user,
                pass: config.mailer.auth.pass
            }
        });
    } else {
        var transport = nodemailer.createTransport({
            host: config.mailer.host, // hostname
            secureConnection: config.mailer.secureConnection, // use SSL
            port: config.mailer.port, // port for secure SMTP
            auth: {
                user: config.mailer.auth.user,
                pass: config.mailer.auth.pass
            }
        });
    }

// Send 10 mails at once
async.mapLimit(recipients, 10, function (item, next) {
    template.render(item, function (err, results) {
        if (err) return next(err)
        transport.sendMail({
            from: config.mailer.from,
            to: item[emailField],
            subject: subject,
            html: results.html,
            text: results.text
        }, function (err, responseStatus) {
            if (err) {
                return next(err)
            }
            next(null, responseStatus.message)
        })
    })
}, function (err) {
    if (err) {
        console.error(err)
    }
    console.log('Succesfully sent %d messages', recipients.length)
})

}

global.sendEmailTemplate = sendEmailTemplate;