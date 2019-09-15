const request = require('supertest');
const mongoose = require('mongoose');
const rmdir = require('rmfr');
let server;

const { Quiz } = require('../../../models/quiz');
const { User } = require('../../../models/user');
const dummyText = require('../../../helpers/createDummyText');
const rootPath = require('../../../helpers/getRootPath')();

const url = '/api/quizzes'
let token;
let quiz;

describe('/api/quizzes', () => {
    beforeEach(() => {
        server = require('../../../index');
        token = new User().generateAuthToken();
        quiz = { 
            title: 'Jak dobrze znasz JS ?',
            questions: [
                {
                    title: 'Co otrzymamy w wyniku tego działania: 5 + \'5\' ?',
                    answers: {
                        a: '0',
                        b: '10',
                        c: '55',
                        d: '5'
                    },
                    rightAnswer: 'c'
                },
                {
                    title: 'Czego można użyć zamiast \'XMLHTTPRequest()\' ?',
                    answers: {
                        a: 'WebSocket',
                        b: 'fetch',
                        c: 'Server Side Events',
                        d: 'Nie można inaczej wysyłać zapytań do serwera'
                    },
                    rightAnswer: 'c'
                }
            ]
        }
    });

    afterEach(async () => {
        await Quiz.remove({});
        await User.remove({});
        await server.close();
        await rmdir(`${rootPath}\\uploads\\quizzes\\\*`);
    });

    describe('GET /', () => {
        it('should return all quizzes', async () => {
            await Quiz.collection.insertMany([
                { 
                    title: 'Quiz1',
                    author: new mongoose.Types.ObjectId(),
                    questions: [
                        {
                            title: 'Question1',
                            rightAnswer: 'b',
                            answers: {
                                a: 'answer 1',
                                b: 'answer 2',
                                c: 'answer 3',
                                d: 'answer 4'
                            }
                        }
                    ]
                },
                { 
                    title: 'Quiz2',
                    author: new mongoose.Types.ObjectId(),
                    questions: [
                        {
                            title: 'Question1',
                            rightAnswer: 'b',
                            answers: {
                                a: 'answer 1',
                                b: 'answer 2',
                                c: 'answer 3',
                                d: 'answer 4'
                            }
                        }
                    ]
                }
            ])

            const res = await request(server).get(url).query({ query: JSON.stringify({}) });

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(quiz => quiz.title === 'Quiz1'));
        });
    });

    describe('GET /:id', () => {
        it('should return a quiz if valid ID is passed', async () => {
            quiz.author = new mongoose.Types.ObjectId().toHexString();

            const newQuiz = new Quiz(quiz);
            await newQuiz.save();
            
            const res = await request(server).get(url + '/' + newQuiz._id);

            newQuiz.games++;

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject(JSON.parse(JSON.stringify(newQuiz)));
        });

        it('should return 404 status if invalid ID is passed', async () => {
            const res = await request(server).get(url + '/1');

            expect(res.status).toBe(404);
        });
    });

    describe('POST /', () => {
        it('should return 401 status if client is not logged in', async () => {
            const res = await request(server).post(url).send(quiz);

            expect(res.status).toBe(401);
        });

        it('should return 400 status if the title is less than 5 characters', async () => {
            quiz.title = 'a';
            const res = await request(server).post(url)
            .set('x-auth-token', token)
            .send(quiz);

            expect(res.status).toBe(400);
        });

        it('should return 400 status if the title is more than 100 characters', async () => {
            quiz.title = dummyText(101);
            const res = await request(server).post(url)
            .set('x-auth-token', token)
            .send(quiz);

            expect(res.status).toBe(400);
        });

        it('should return 400 status if more than 128 questions is passed', async () => {
            quiz.questions = new Array(129).fill(quiz.questions[0], 0);
            const res = await request(server).post(url)
            .set('x-auth-token', token)
            .send(quiz);
            
            expect(res.status).toBe(400);
        });

        it('should return 400 status if a question is less than 5 characters', async () => {
            quiz.questions[0].title = 'a';
            const res = await request(server).post(url)
            .set('x-auth-token', token)
            .send(quiz);
            
            expect(res.status).toBe(400);
        });

        it('should return 400 status if a question is more than 100 characters', async () => {
            quiz.questions[0].title = dummyText(101);
            const res = await request(server).post(url)
            .set('x-auth-token', token)
            .send(quiz);
            
            expect(res.status).toBe(400);
        });

        it('should return 400 status if an answer is more than 50 characters', async () => {
            quiz.questions[0].answers.a = dummyText(51);
            const res = await request(server).post(url)
            .set('x-auth-token', token)
            .send(quiz);
            
            expect(res.status).toBe(400);
        });

        it('should return 400 status if an answer is missing', async () => {
            delete quiz.questions[0].answers.a;
            const res = await request(server).post(url)
            .set('x-auth-token', token)
            .send(quiz);
            
            expect(res.status).toBe(400);
        });

        it('should return 400 status if unknown answer is recived', async () => {
            quiz.questions[0].answers.e = 'e';
            const res = await request(server).post(url)
            .set('x-auth-token', token)
            .send(quiz);
            
            expect(res.status).toBe(400);
        });

        it('should return 400 status if right answer is invalid', async () => {
            quiz.questions[0].rightAnswer = 'e';
            const res = await request(server).post(url)
            .set('x-auth-token', token)
            .send(quiz);
            
            expect(res.status).toBe(400);
        });
        
        it('should return 200 status if quiz was successfully created', async () => {
            const res = await request(server).post(url)
            .set('x-auth-token', token)
            .send(quiz);
            
            expect(res.status).toBe(200);
        });
    });

    describe('PUT /:id', () => {
        it('should return 404 status if invalid ID is passed', async () => {
            const res = await request(server).put(url + '1').send(quiz);

            expect(res.status).toBe(404);
        });

        it('should return 403 status if user is not author of the quiz', async () => {
            quiz.author = new mongoose.Types.ObjectId().toHexString();
            const newQuiz = await new Quiz(quiz).save();
            const res = await request(server).put(`${url}/${newQuiz._id}`).send(quiz).set('x-auth-token', token);

            expect(res.status).toBe(403);
        });

        it('should return 401 status if user is not logged in', async () => {
            const id = new mongoose.Types.ObjectId().toHexString();
            const res = await request(server).put(`${url}/${id}`).send(quiz);

            expect(res.status).toBe(401);
        });

        it('should update a quiz', async () => {
            const user = new User({
                name: 'John',
                surname: 'Snow',
                email: 'john.snow@gmail.com',
                password: 'winteriscoming'
            });

            const newQuiz = await new Quiz({ ...quiz, author: user._id }).save();

            await user.save();

            quiz.title = 'Title';
            quiz.questions[0].title = 'Question';
            quiz.questions[0].answers.b = 'Answer';
            
            const res = await request(server).put(url + '/' + newQuiz._id).set('x-auth-token', user.generateAuthToken()).send(quiz);

            expect(res.body).toMatchObject(quiz);
        });
    });

    describe('DELETE /:id', () => {
        it('should return 404 status if invalid ID is passed', async () => {
            const res = await request(server).delete(url + '1');

            expect(res.status).toBe(404);
        });

        it('should return 403 status if user is not author of the quiz', async () => {
            quiz.author = new mongoose.Types.ObjectId().toHexString();
            const newQuiz = await new Quiz(quiz).save();
            const res = await request(server).delete(`${url}/${newQuiz._id}`).send(quiz).set('x-auth-token', token);

            expect(res.status).toBe(403);
        });

        it('should return 401 status if user is not logged in', async () => {
            const id = new mongoose.Types.ObjectId().toHexString();
            const res = await request(server).delete(`${url}/${id}`);

            expect(res.status).toBe(401);
        });

        it('should delete a quiz', async () => {
            const user = new User({
                name: 'John',
                surname: 'Snow',
                email: 'john.snow@gmail.com',
                password: 'winteriscoming'
            });

            const newQuiz = await new Quiz({ ...quiz, author: user._id }).save();

            await user.save();
            
            const res = await request(server).delete(url + '/' + newQuiz._id).set('x-auth-token', user.generateAuthToken());

            expect(res.body).toMatchObject(JSON.parse(JSON.stringify(newQuiz)));
            expect(res.status).toBe(200);
        });
    });
});