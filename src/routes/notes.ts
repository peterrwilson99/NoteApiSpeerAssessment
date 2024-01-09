import express from 'express';
import { errorHandler } from '../handlers/Error';
import { checkJwt } from '../middleware/checkJwt';
import { PrismaClient } from '@prisma/client';
import { getUserInfo } from '../utils/getUserInfo';

const router = express.Router();
const prisma = new PrismaClient();


// `GET /api/notes`: get a list of all notes for the authenticated user. 
router.get('/', checkJwt, async (req, res) => {
    try{
        const { userId, email } = getUserInfo(req);

        const notes = await prisma.note.findMany({
            where: {
                OR: [
                    { authorId: userId },
                    { sharedWith: { some: { email } } }
                ]
            },
            include: {
                author: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        return res.status(200).json({ notes })
    }catch(error){
        return errorHandler(error, req, res, 500);
    }
});

// `POST /api/notes`: create a new note for the authenticated user. 
export interface CreateNoteProps {
    title?: string;
    content: string;
    sharedWith?: string[]; // sharedWith is an array of emails
}
router.post('/', checkJwt, async (req, res) => {
    try{
        const { userId } = getUserInfo(req);
        const { title, content, sharedWith }: CreateNoteProps = req.body;
        if(!content) return res.status(400).json({ error: 'Content is required' });
        const note = await prisma.note.create({
            data: {
                title,
                content,
                sharedWith: {
                    connect: sharedWith?.map(email => ({ email })) ?? []
                },
                author: {
                    connect: { id: userId }
                }
            }
        });
        return res.status(200).json({ note })
    }catch(error){
        return errorHandler(error, req, res, 500);
    }
});

// `GET /api/notes/:id`: get a note by ID for the authenticated user. 
router.get('/:id', checkJwt, async (req, res) => {
    try{
        const { userId, email } = getUserInfo(req);

        const { id } = req.params;
        if(!id) return res.status(400).json({ error: 'Note ID is required' });

        const note = await prisma.note.findUnique({
            where: { 
                id: id,
                OR: [
                    { authorId: userId },
                    { sharedWith: { some: { email } } }
                ]
            }
        })

        if(!note) return res.status(404).json({ error: 'Note not found' });

        return res.status(200).json({ note })
    }catch(error){
        return errorHandler(error, req, res, 500);
    }
});

export interface UpdateNoteProps {
    title?: string;
    content?: string
    sharedWith?: string[]; // sharedWith is an array of emails
}
// `PUT /api/notes/:id`: update an existing note by ID for the authenticated user. 
router.put('/:id', checkJwt, async (req, res) => {
    try{
        const { id } = req.params;
        if(!id) return res.status(400).json({ error: 'Note ID is required' });

        const { title, content, sharedWith }: UpdateNoteProps = req.body;
        const { userId } = getUserInfo(req);
        if(!title && !content && !sharedWith) return res.status(400).json({ error: 'At least one field is required' });
        
        
        const note = await prisma.note.update({
            where: { 
                id: id,
                authorId: userId
            },
            data: {
                title,
                content,
                sharedWith: {
                    set: sharedWith?.map(email => ({ email }))
                }
            },
        });

        if(!note) return res.status(404).json({ error: 'Note not found' });

        return res.status(200).json({ note })
    }catch(error){
        return errorHandler(error, req, res, 500);
    }
});

// `DELETE /api/notes/`: delete a note by ID for the authenticated user. 
router.delete('/:id', checkJwt, async (req, res) => {
    try{
        const { id } = req.params;
        if(!id) return res.status(400).json({ error: 'Note ID is required' });
        const { userId } = getUserInfo(req);

        const note = await prisma.note.delete({
            where: { 
                id: id,
                authorId: userId
            }
        });
        if(!note) return res.status(404).json({ error: 'Note not found' });
        return res.status(200).json({ message: 'Note deleted' })
    }catch(error){
        return errorHandler(error, req, res, 500);
    }
});

// `POST /api/notes/:id/share`: share a note with another user for the authenticated user.
interface ShareNoteProps {
    email: string;
}
router.post('/:id/share', checkJwt, async (req, res) => {
    try{
        const { id } = req.params;
        if(!id) return res.status(400).json({ error: 'Note ID is required' });
        const { email }: ShareNoteProps = req.body;
        if(!email) return res.status(400).json({ error: 'Email to share note with is required' });
        const { userId } = getUserInfo(req);

        const userToShareWith = await prisma.user.findUnique({
            where: { email }
        });
        if(!userToShareWith) return res.status(404).json({ error: 'User not found' });

        const note = await prisma.note.update({
            where: { 
                id: id,
                authorId: userId
            },
            data: {
                sharedWith: {
                    connect: [{ email }]
                }
            },
            include: {
                sharedWith: true
            }
        });

        if(!note) return res.status(404).json({ error: 'Note not found' });

        return res.status(200).json({ message: 'Success', note})
    }catch(error){
        return errorHandler(error, req, res, 500);
    }
});

export default router;