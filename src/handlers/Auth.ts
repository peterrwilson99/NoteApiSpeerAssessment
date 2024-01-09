import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { compareSync, hashSync } from "bcryptjs";
import { validateEmail, validatePassword } from "../utils/validators";
import { generateToken } from "../utils/generateToken";

const prisma = new PrismaClient();

export interface SignupProps {
    email: string;
    password: string;
    name?: string;
}

export const Signup = async (request: Request, response: Response) => {
    const { email, password, name }: SignupProps = request.body;
    if (!email || !password) {
        return response.status(400).json({ error: "Email and password required" });
    }

    if(!validatePassword(password)) return response.status(400).json({ error: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character." });
    if(!validateEmail(email)) return response.status(400).json({ error: "Invalid email" });

    // check if user exists in database
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
        return response.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = hashSync(password, 10)
    
    await prisma.user.create({ data: { email, password: hashedPassword, name } });
    
    return response.status(201).json({ message: "User created", email });
}

export interface LoginProps {
    email: string;
    password: string;
}

export const Login = async (request: Request, response: Response) => {
    const { email, password }: LoginProps = request.body;
    if (!email || !password) {
        return response.status(400).json({ error: "Email and password required" });
    }

    // check if user exists in database
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return response.status(400).json({ error: "Email or password are incorrect" });
    }
    // check if password is correct
    const validPassword = compareSync(password, user.password);
    if(!validPassword) {
        return response.status(400).json({ error: 'Invalid email or password' });
    }
    // create jwt token with userId and email
    const token = generateToken(user.email, user.id);

    return response.status(200).json({ message: "User logged in", email, token });
}