import { sign } from "jsonwebtoken";

export function generateToken(email: string, userId: string, expiresIn: string = '1h'){
    const token = sign({ email, userId }, process.env.JWT_SECRET!, { expiresIn });
    return token;
}