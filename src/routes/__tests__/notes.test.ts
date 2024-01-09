import '../../../jest/context';
import request from 'supertest';
import { app } from '../../index';
import { getEditableTestNoteForUser, getTestNoteForUser, getTestNoteForUserWithoutAccess, getTestNoteSharedWithUser, getTestUser } from '../../../jest/helpers';
import { faker } from '@faker-js/faker';
import { generateToken } from '../../utils/generateToken';


describe('Test Notes Endpoints', () => {
    test('GET /api/notes', async () => {
        const user = getTestUser();
        const token = generateToken(user.email, user.id);
        const res = await request(app)
            .get('/api/notes')
            .set('Authorization', `Bearer ${token}`)
        
        expect(res.status).toBe(200);
        expect(res.body.notes).toBeDefined();
        for(const note of res.body.notes){
            if(note.authorId === user.id) continue;
            expect(note.sharedWith).toContain(user.id);
        }
    });
    test('GET /api/notes/:id', async () => {
        const user = getTestUser();
        const token = generateToken(user.email, user.id);
        const note = getTestNoteForUser(user);
        const res = await request(app)
            .get(`/api/notes/${note.id}`)
            .set('Authorization', `Bearer ${token}`)
        
        expect(res.status).toBe(200);
        expect(res.body.note).toBeDefined();
        expect(res.body.note.id).toEqual(note.id);
        if(res.body.note.authorId !== user.id){
            expect(res.body.note.sharedWith).toContain(user.id);
        }
    });
    test('GET /api/notes/:id with invalid id', async () => {
        const user = getTestUser();
        const token = generateToken(user.email, user.id);
        const res = await request(app)
            .get(`/api/notes/invalid`)
            .set('Authorization', `Bearer ${token}`)
        
        expect(res.status).toBe(404);
        expect(res.body.error).toEqual('Note not found');
    });
    test('GET /api/notes/:id to note without access', async () => {
        const user = getTestUser();
        const token = generateToken(user.email, user.id);
        const note = getTestNoteForUserWithoutAccess(user);
        const res = await request(app)
            .get(`/api/notes/${note.id}`)
            .set('Authorization', `Bearer ${token}`)
        
        expect(res.status).toBe(404);
        expect(res.body.error).toEqual('Note not found');
    });
    test('POST /api/notes', async () => {
        const user = getTestUser();
        let differentUser = getTestUser();
        while(differentUser.id === user.id){
            differentUser = getTestUser();
        }
        const token = generateToken(user.email, user.id);
        const note = {
            title: faker.lorem.words(3),
            content: faker.lorem.paragraphs(2),
            sharedWith: [differentUser.email]
        }
        const res = await request(app)
            .post(`/api/notes`)
            .set('Authorization', `Bearer ${token}`)
            .send(note)
        
        expect(res.status).toBe(200);
        expect(res.body.note).toBeDefined();
        expect(res.body.note.title).toEqual(note.title);
        expect(res.body.note.content).toEqual(note.content);
        expect(res.body.note.sharedWith).toContain(differentUser.email);
    });
    test('POST /api/notes with invalid data', async () => {
        const user = getTestUser();
        const token = generateToken(user.email, user.id);
        const res = await request(app)
            .post(`/api/notes`)
            .set('Authorization', `Bearer ${token}`)
            .send({title: 'test'})
        
        expect(res.status).toBe(400);
        expect(res.body.error).toEqual('Content is required');
    });
    test('PUT /api/notes/:id', async () => {
        const user = getTestUser();
        const token = generateToken(user.email, user.id);
        const note = getEditableTestNoteForUser(user);
        const res = await request(app)
            .put(`/api/notes/${note.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'new title' })
        
        expect(res.status).toBe(200);
        expect(res.body.note).toBeDefined();
        expect(res.body.note.title).toEqual('new title');
    });
    test('PUT /api/notes/:id with invalid id', async () => {
        const user = getTestUser();
        const token = generateToken(user.email, user.id);
        const res = await request(app)
            .put(`/api/notes/invalid`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'new title' })
        
        expect(res.status).toBe(404);
        expect(res.body.error).toEqual('Note not found');
    });
    test('PUT /api/notes/:id with invalid data', async () => {
        const user = getTestUser();
        const token = generateToken(user.email, user.id);
        const note = getEditableTestNoteForUser(user);
        const res = await request(app)
            .put(`/api/notes/${note.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({})
        
        expect(res.status).toBe(400);
        expect(res.body.error).toEqual('At least one field is required');
    });
    test('PUT /api/notes/:id to note without access', async () => {
        const user = getTestUser();
        const token = generateToken(user.email, user.id);
        const note = getTestNoteForUserWithoutAccess(user);
        const res = await request(app)
            .put(`/api/notes/${note.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'new title' })
        
        expect(res.status).toBe(404);
        expect(res.body.error).toEqual('Note not found');
    });
    test('DELETE /api/notes/:id', async () => {
        const user = getTestUser();
        const token = generateToken(user.email, user.id);
        const note = getEditableTestNoteForUser(user);
        const res = await request(app)
            .delete(`/api/notes/${note.id}`)
            .set('Authorization', `Bearer ${token}`)
        
        expect(res.status).toBe(200);
        expect(res.body.message).toEqual('Note deleted');
    });
    test('DELETE /api/notes/:id with invalid id', async () => {
        const user = getTestUser();
        const token = generateToken(user.email, user.id);
        const res = await request(app)
            .delete(`/api/notes/invalid`)
            .set('Authorization', `Bearer ${token}`)
        
        expect(res.status).toBe(404);
        expect(res.body.error).toEqual('Note not found');
    });
    test('DELETE /api/notes/:id to note shared to user', async () => {
        const user = getTestUser();
        const token = generateToken(user.email, user.id);
        const note = getTestNoteSharedWithUser(user);
        const res = await request(app)
            .delete(`/api/notes/${note.id}`)
            .set('Authorization', `Bearer ${token}`)
        
        expect(res.status).toBe(404);
        expect(res.body.error).toEqual('Note not found');
    });
    test('POST /api/notes/:id/share', async () => {
        const user = getTestUser();
        const token = generateToken(user.email, user.id);
        let differentUser = getTestUser();
        while(differentUser.id === user.id){
            differentUser = getTestUser();
        }
        let note = getEditableTestNoteForUser(user);
        let i = 0;
        while(note.sharedWith.includes(differentUser.email) || note.sharedWith.includes(differentUser.id)){
            note = getEditableTestNoteForUser(user);
            if(i > user.notes.length) throw new Error('No note found to share');
        }
        const sharedWithLength = note.sharedWith.length;
        const res = await request(app)
            .post(`/api/notes/${note.id}/share`)
            .set('Authorization', `Bearer ${token}`)
            .send({ email: differentUser.email })
        
        expect(res.status).toBe(200);
        expect(res.body.note).toBeDefined();
        expect(res.body.note.sharedWith).toContain(differentUser.id);
        expect(res.body.note.sharedWith.length).toEqual(sharedWithLength + 1);
    });
    test('POST /api/notes/:id/share with invalid id', async () => {
        const user = getTestUser();
        const token = generateToken(user.email, user.id);
        let differentUser = getTestUser();
        while(differentUser.id === user.id){
            differentUser = getTestUser();
        }

        const res = await request(app)
            .post(`/api/notes/invalid/share`)
            .set('Authorization', `Bearer ${token}`)
            .send({ email: differentUser.email })

        expect(res.status).toBe(404);
        expect(res.body.error).toEqual('Note not found');
    });
    test('POST /api/notes/:id/share with invalid data', async () => {
        const user = getTestUser();
        const token = generateToken(user.email, user.id);
        const note = getEditableTestNoteForUser(user);
        const res = await request(app)
            .post(`/api/notes/${note.id}/share`)
            .set('Authorization', `Bearer ${token}`)
            .send({})

        expect(res.status).toBe(400);
        expect(res.body.error).toEqual('Email to share note with is required');
    });
    test('POST /api/notes/:id/share to note without access', async () => {
        const user = getTestUser();
        const token = generateToken(user.email, user.id);
        let differentUser = getTestUser();
        while(differentUser.id === user.id){
            differentUser = getTestUser();
        }
        const note = getTestNoteForUserWithoutAccess(user);
        const res = await request(app)
            .post(`/api/notes/${note.id}/share`)
            .set('Authorization', `Bearer ${token}`)
            .send({ email: differentUser.email })

        expect(res.status).toBe(404);
        expect(res.body.error).toEqual('Note not found');
    });
    test('POST /api/notes/:id/share to invalid user', async () => {
        const user = getTestUser();
        const token = generateToken(user.email, user.id);
        const note = getEditableTestNoteForUser(user);
        const res = await request(app)
            .post(`/api/notes/${note.id}/share`)
            .set('Authorization', `Bearer ${token}`)
            .send({ email: 'fake@fake.com' })

        expect(res.status).toBe(404);
        expect(res.body.error).toEqual('User not found');
    });

});