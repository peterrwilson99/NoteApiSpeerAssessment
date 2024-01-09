import '../../../jest/context';
import request from 'supertest';
import { app } from '../../index';
import { getTestUser } from '../../../jest/helpers';
import { faker } from '@faker-js/faker';


describe('Test Auth Endpoints', () => {
    test('POST /login', async () => {
        const user = getTestUser();
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: user.email, password: 'password' })
        
        expect(res.status).toBe(200);
        expect(res.body.message).toEqual("User logged in");
        expect(res.body.token).toBeDefined();
        expect(res.body.email).toEqual(user.email);
    })
    test('POST /login with invalid password', async () => {
        const user = getTestUser();
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: user.email, password: 'invalid' })
        
        expect(res.status).toBe(400);
        expect(res.body.error).toEqual("Invalid email or password");
    })
    test('POST /login with invalid email', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'invalid', password: 'password' })
        
        expect(res.status).toBe(400);
        expect(res.body.error).toEqual("Email or password are incorrect");
    })
    test('POST /login with no email', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ password: 'password' })
        
        expect(res.status).toBe(400);
        expect(res.body.error).toEqual("Email and password required");
    })
    test('POST /signup', async () => {
        const user = {
            email: faker.internet.email(),
            password: 'ValidPassword123!',
            name: faker.person.fullName(),
        }
        const res = await request(app)
            .post('/api/auth/signup')
            .send(user)
        
        expect(res.status).toBe(201);
        expect(res.body.message).toEqual("User created");
        expect(res.body.email).toEqual(user.email);
    });
    test('POST /signup with invalid email', async () => {
        const user = {
            email: 'invalid',
            password: 'ValidPassword123!',
            name: faker.person.fullName(),
        }
        const res = await request(app)
            .post('/api/auth/signup')
            .send(user)
        
        expect(res.status).toBe(400);
        expect(res.body.error).toEqual("Invalid email");
    });
    test('POST /signup with invalid password', async () => {
        const user = {
            email: faker.internet.email(),
            password: 'invalid',
            name: faker.person.fullName(),
        }
        const res = await request(app)
            .post('/api/auth/signup')
            .send(user)
        
        expect(res.status).toBe(400);
        expect(res.body.error).toEqual("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character.");
    });
    test('POST /signup with existing email', async () => {
        const user = getTestUser();
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ email: user.email, password: 'ValidPassword123!' })
        
        expect(res.status).toBe(400);
        expect(res.body.error).toEqual("User already exists");
    });
    test('POST /signup with no email', async () => {
        const user = {
            password: 'ValidPassword123!',
            name: faker.person.fullName(),
        }
        const res = await request(app)
            .post('/api/auth/signup')
            .send(user)
        
        expect(res.status).toBe(400);
        expect(res.body.error).toEqual("Email and password required");
    });
});