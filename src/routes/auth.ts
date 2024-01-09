import express from 'express';
import { errorHandler } from '../handlers/Error';
import { Login, Signup } from '../handlers/Auth';

const router = express.Router();

// `POST /api/auth/signup`: create a new user account.
router.post('/signup', async (req, res) => {
    try{
        return await Signup(req, res);
    }catch(error){
        return errorHandler(error, req, res, 500);
    }
});

// `POST /api/auth/login`: log in to an existing user account and receive an access token.
router.post('/login', async (req, res) => {
    try{
        return await Login(req, res);
    }catch(error){
        return errorHandler(error, req, res, 500);
    }
});

export default router;