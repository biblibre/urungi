const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');
const os = require('os');
const helpers = require('../helpers.js');

const uploadPath = fs.mkdtempSync(path.join(os.tmpdir(), 'urungi-test-'));
process.env.NODE_CONFIG = JSON.stringify({ uploads: { path: uploadPath } });

let app;
let mongod;
beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    app = require('../../../server/app');
});
afterAll(async () => {
    await new Promise(resolve => { mongoose.connection.close(resolve); });
    await mongod.stop();
});

describe('Files API', function () {
    let adminHeaders;
    let File, User;

    beforeAll(async function () {
        adminHeaders = await helpers.login(app);
        File = mongoose.model('File');
        User = mongoose.model('User');
    });

    describe('GET /api/files', function () {
        const files = [];

        beforeAll(async function () {
            const admin = await User.findOne({ userName: 'administrator' });
            files.push(await File.create({ filename: 'foo.png', type: 'image/png', upload_user_id: admin.id }));
            files.push(await File.create({ filename: 'bar.jpg', type: 'image/jpeg', upload_user_id: admin.id }));
        });

        afterAll(async function () {
            files.forEach(async file => { await file.remove(); });
        });

        describe('when not authenticated', function () {
            it('should return status 403', async function () {
                const res = await request(app).get('/api/files');

                expect(res.status).toBe(403);
            });
        });

        describe('when authenticated', function () {
            it('should return all files', async function () {
                const res = await request(app).get('/api/files')
                    .set(adminHeaders);

                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('files');

                const files = res.body.files;
                expect(files).toHaveLength(2);
                expect(files[0]).toHaveProperty('filename', 'foo.png');
                expect(files[1]).toHaveProperty('filename', 'bar.jpg');
            });
        });
    });

    describe('POST /api/files', function () {
        describe('when not authenticated', function () {
            it('should return status 403', async function () {
                const res = await request(app).post('/api/files');

                expect(res.status).toBe(403);
            });
        });

        describe('when authenticated', function () {
            it('should return status 200', async function () {
                const buffer = Buffer.from('foo');
                const res = await request(app).post('/api/files')
                    .set(adminHeaders)
                    .attach('content', buffer, { filename: 'foo.png', contentType: 'image/png' });

                expect(res.status).toBe(200);

                const file = res.body;
                expect(file).toHaveProperty('upload_user_id');
                expect(file.filename).toMatch(/-foo.png$/);
                expect(file).toHaveProperty('name', 'foo.png');
                expect(file).toHaveProperty('type', 'image/png');
                expect(file).toHaveProperty('url', 'uploads/' + file.filename);
                expect(file).toHaveProperty('size', 3);
                expect(file).toHaveProperty('createdOn');
            });
        });
    });
});
