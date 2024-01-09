import { Request, Response } from "express";
import jwt from 'jsonwebtoken';

export const errorHandler = (error: any, req: Request, res: Response, status: number | undefined) => {
    // send log to logging service if it exists
    // in our case, we will just console.log
    const date = new Date();
    console.log(`[${date.toISOString()}] Error on Endpoint: ${req.method} ${req.originalUrl}`);
    console.log("With body: ", req.body);
    console.log("Error: ", error);

    if (error instanceof jwt.JsonWebTokenError) {
        return res.status(403).json({ error: 'Forbidden - Invalid token' });
    }

    const errorStatus: number = status || error.status || 500;
    if(errorStatus === 401) return res.status(401).json({ error: 'Unauthorized - Invalid credentials' });
    if(errorStatus === 403) return res.status(403).json({ error: 'Forbidden - Invalid token' });
    if(errorStatus === 404) return res.status(404).json({ error: 'Not found' });
    if(errorStatus === 409) return res.status(409).json({ error: 'Conflict - Duplicate entry' });
    return res.status(500).json({ error: 'Internal Server Error' });
}