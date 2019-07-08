const mailer = require('../../../server/helpers/mailer');

describe('mailer', function () {
    describe('sendEmailTemplate', function () {
        it('should send newUserAndPassword mail', async function () {
            const recipients = [
                {
                    firstName: 'Obi-Wan',
                    lastName: 'Kenobi',
                    userName: 'obiwan',
                    userPassword: 'JediMaster123',
                    email: 'obi-wan.kenobi@coruscant.planet',
                }
            ];
            const emails = await mailer.sendEmailTemplate('newUserAndPassword', recipients, 'email', 'Test subject');

            expect(emails).toHaveLength(1);
            expect(emails[0]).toHaveProperty('message');

            const message = JSON.parse(emails[0].message);
            expect(message.to).toHaveLength(1);
            expect(message.to[0].address).toBe('obi-wan.kenobi@coruscant.planet');

            expect(message.subject).toBe('Test subject');

            expect(message).toHaveProperty('text');
            expect(message.text).toMatchSnapshot();

            expect(message).toHaveProperty('html');
            expect(message.html).toMatchSnapshot();
        });
    });
});
