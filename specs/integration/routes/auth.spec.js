const request = require('supertest');
const jwt = require('jsonwebtoken');
const config = require('config');

const { User } = require('../../../models/user');
const dummyText = require('../../../helpers/createDummyText');

const url = '/api/auth';
let user;
let payload;

describe('/api/auth', () => {
    beforeEach(async () => {
        server = require('../../../index');
        payload = {
            email: 'john.smith@gmail.com',
            password: '123456789'
        };
        user = await request(server).post('/api/users').send({
            name: 'John',
            surname: 'Smith',
            ...payload
        });
    });

    afterEach(async () => {
        await User.remove({});
        await server.close();
    });
    
    describe('POST /', () => {
        it('should return auth token', async () => {
            const res = await request(server).post(url).send(payload);
            const decoded = jwt.verify(res.header['x-auth-token'], config.get('jwtPrivateKey'));
        
            expect(res.status).toBe(200);
            expect(decoded._id).toMatch(user.body._id);
        });

        it('should return 401 status if email is more than 128 characters', async () => {
            payload.name = `${dummyText(128)}@gmail.com`;

            const res = await request(server).post(url).send(payload);

            expect(res.status).toBe(401);
        });

        it('should return 401 status if invalid email is passed', async () => {
            payload.email = '123';
            const res = await request(server).post(url).send(payload);

            expect(res.status).toBe(401);
        });

        it('should return 401 status if password is more than 255 characters', async () => {
            payload.password = dummyText(256);
            const res = await request(server).post(url).send(payload);

            expect(res.status).toBe(401);
        });

        it('should return 401 status if password is less than 5 characters', async () => {
            payload.password = '1';
            const res = await request(server).post(url).send(payload);

            expect(res.status).toBe(401);
        });

        it('should return 400 status if email does not exist', async () => {
            payload.email = '1@domain.com';
            const res = await request(server).post(url).send(payload);

            expect(res.status).toBe(400);
        });

        it('should return 400 status if password isn\'t correct', async () => {
            payload.password = 'aaaaaa';
            const res = await request(server).post(url).send(payload);

            expect(res.status).toBe(400);
        });
    })
});