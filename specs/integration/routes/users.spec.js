const { User } = require('../../../models/user');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const config = require('config');

const dummyText = require('../../../helpers/createDummyText');

const url = '/api/users'
let server;
let user;
let token;

describe('/api/users', () => {
    beforeEach(() => {
        server = require('../../../index');
        user = {
            name: 'John',
            surname: 'Smith',
            email: 'john@gmail.com',
            password: '1234567'
        }
        token = new User().generateAuthToken();
    });

    afterEach(async () => {
        await User.remove({});
        await server.close();
    });

    describe('POST /', () => {
        it('should create an user', async () => {
            const res = await request(server)
            .post(url)
            .send(user);

            const decoded = jwt.decode(res.header['x-auth-token'], config.get('jwtPrivateKey'));

            delete user.password;

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject(user);
            expect(decoded._id).toEqual(res.body._id);
        });

        it('should return 400 status if the name is less than 3 characters', async () => {
            user.name = '1';
            const res = await request(server).post(url).send(user);

            expect(res.status).toBe(400);
        });

        it('should return 400 status if the name is more than 128 characters', async () => {
            user.name = dummyText(129);
            const res = await request(server).post(url).send(user);

            expect(res.status).toBe(400);
        });

        it('should return 400 status if the surname is less than 3 characters', async () => {
            user.surname = '1';
            const res = await request(server).post(url).send(user);

            expect(res.status).toBe(400);
        });

        it('should return 400 status if the surname is more than 128 characters', async () => {
            user.surname = dummyText(129);
            const res = await request(server).post(url).send(user);

            expect(res.status).toBe(400);
        });

        it('should return 400 status if the password is less than 3 characters', async () => {
            user.password = '1';
            const res = await request(server).post(url).send(user);

            expect(res.status).toBe(400);
        });

        it('should return 400 status if the password is more than 128 characters', async () => {
            user.password = dummyText(256);
            const res = await request(server).post(url).send(user);

            expect(res.status).toBe(400);
        });

        it('should return 400 status if the email is more than 128 characters', async () => {
            user.email = `${dummyText(128)}@d.d`;
            const res = await request(server).post(url).send(user);

            expect(res.status).toBe(400);
        });

        it('should return 400 status if invalid email is passed', async () => {
            user.email = `1`;
            const res = await request(server).post(url).send(user);

            expect(res.status).toBe(400);
        });

        it('should return 400 status if user already exists', async () => {
            await User.collection.insertOne(user);

            const res = await request(server).post(url).send(user);

            expect(res.status).toBe(400);
        });

    });

    describe('GET /me', () => {
        it('should return logged user\'s data', async () => {
            user = await new User(user).save();

            const res = await request(server).get(url + '/me').set('x-auth-token', user.generateAuthToken());

            user = JSON.parse(JSON.stringify(user));
            delete user.password;

            expect(res.body).toMatchObject(user);
        });

        it('should return 401 status if user is not logged in', async () => {
            token = '';
            const res = await request(server).get(url + '/me').set('x-auth-token', token);

            expect(res.status).toBe(401);
        });
    });
});