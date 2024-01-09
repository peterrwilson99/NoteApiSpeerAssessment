import '../../../jest/context';
import request from 'supertest';
import { app } from '../../index';
import { getEditableTestNoteForUser, getTestNoteForUser, getTestNoteForUserWithoutAccess, getTestNoteSharedWithUser, getTestUser } from '../../../jest/helpers';
import { faker } from '@faker-js/faker';
import { generateToken } from '../../utils/generateToken';


describe('Test Search Endpoints', () => {
    test('GET /api/search?q=note for specific title', async () => {
        const user = getTestUser();
        const token = generateToken(user.email, user.id);
        // create a note with following data
        const note = {
            title: 'V4l1d T1tl3',
            content: 'V4l1d C0nt3nt',
            sharedWith: []
        };
        const createResponse = await request(app)
            .post('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .send(note);

        expect(createResponse.status).toBe(200);

        const res = await request(app)
            .get(`/api/search?q=${encodeURI(note.title)}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(200);
        expect(res.body.notes).toBeDefined();
        expect(res.body.notes.length).toBe(1);
        expect(res.body.notes[0].title).toEqual(note.title);
        expect(res.body.notes[0].content).toEqual(note.content);
    });
    test('GET /api/search?q=note for specific content', async () => {
        const user = getTestUser();
        const token = generateToken(user.email, user.id);
        // create a note with following data
        const note = {
            title: 'V4l1d T1tl3',
            content: 'V4l1d C0nt3nt Different 2',
            sharedWith: []
        };
        const createResponse = await request(app)
            .post('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .send(note);

        expect(createResponse.status).toBe(200);

        const res = await request(app)
            .get(`/api/search?q=${encodeURI(note.content)}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(200);
        expect(res.body.notes).toBeDefined();
        expect(res.body.notes.length).toBe(1);
        expect(res.body.notes[0].title).toEqual(note.title);
        expect(res.body.notes[0].content).toEqual(note.content);
    });
    test('GET /api/search?q=note expecting no content', async () => {
        const user = getTestUser();
        const token = generateToken(user.email, user.id);
        const searchString = faker.lorem.paragraphs(5);


        const res = await request(app)
            .get(`/api/search?q=${encodeURI(searchString)}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(200);
        expect(res.body.notes).toBeDefined();
        expect(res.body.notes.length).toBe(0);
    });
    test('GET /api/search?q=note with no query', async () => {
        const user = getTestUser();
        const token = generateToken(user.email, user.id);

        const res = await request(app)
            .get(`/api/search`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(400);
        expect(res.body.error).toEqual('Query is required');
    });
});