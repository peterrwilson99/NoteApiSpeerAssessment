import { Request } from 'express';

export interface UserInfo {
    userId: string;
    email: string;
}

export const getUserInfo = (req: Request) => {
    const { userId, email } = req.body.authUser as UserInfo;
    if(!userId || !email) throw new Error('authUser, UserId or Email were not present in request body');

    return { userId, email };
}