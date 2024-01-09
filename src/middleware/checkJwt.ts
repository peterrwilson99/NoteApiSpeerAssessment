import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

interface DecodedJwt {
    email: string;
    userId: string;
    iat: number;
    exp?: number;
}

export const checkJwt = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(403).json({ error: 'Forbidden - Invalid token' });

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedJwt;
        req.body.authUser = {
            email: decodedToken.email,
            userId: decodedToken.userId
        };
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Forbidden - Invalid token' });
    }
}