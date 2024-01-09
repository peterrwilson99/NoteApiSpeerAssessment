import '../../../jest/context'
import request from 'supertest';
import { app } from '../../index';
import { getTestUser } from "../../../jest/helpers";
import { generateToken } from "../../utils/generateToken";

describe('Test Middleware', () => {
    test('checkJwt with valid token', async () => {
        const user = getTestUser();
        const token = generateToken(user.email, user.id);
        const res = await request(app)
            .get('/api/notes')
            .set('Authorization', `Bearer ${token}`)
        
        expect(res.status).toBe(200);
        expect(res.body).toBeDefined();
    });
    test('checkJwt with invalid token', async () => {
        const res = await request(app)
            .get('/api/notes')
            .set('Authorization', `Bearer invalidtoken`)

        expect(res.status).toBe(403);
        expect(res.body.error).toEqual('Forbidden - Invalid token');
    });
    test('checkJwt with no token', async () => {
        const res = await request(app)
            .get('/api/notes')

        expect(res.status).toBe(403);
        expect(res.body.error).toEqual('Forbidden - Invalid token');
    });
    test('checkJwt with expired token', async () => {
        const user = getTestUser();
        const token = generateToken(user.email, user.id, '1s');
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const res = await request(app)
            .get('/api/notes')
            .set('Authorization', `Bearer ${token}`)
        
        expect(res.status).toBe(403);
        expect(res.body.error).toEqual('Forbidden - Invalid token');
    });
});