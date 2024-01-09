import { Router } from "express";
import { checkJwt } from "../middleware/checkJwt";
import { getUserInfo } from "../utils/getUserInfo";
import { PrismaClient } from "@prisma/client";
import { errorHandler } from "../handlers/Error";

const router = Router();
const prisma = new PrismaClient();

// `GET /api/search?q=:query`: search for notes based on keywords for the authenticated user.
router.get('/', checkJwt, async (req, res) => {
    try{
        const query = req.query.q;
        if(!query) return res.status(400).json({ error: 'Query is required' });
        const { userId, email } = getUserInfo(req);
        if(!userId || !email) throw new Error('UserId or Email were not added to request body in checkJwt.');
        
        const userAccessibleNotes = await prisma.note.findMany({
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
        
        const notes = userAccessibleNotes.filter(note => {
            const { title, content } = note;
            if(title?.toLowerCase().includes(query.toString().toLowerCase()) || content?.toLowerCase().includes(query.toString().toLowerCase())) return true;
            return false;
        }); 

        return res.status(200).json({ notes })
    }catch(error){
        return errorHandler(error, req, res, 500);
    }
});

export default router;