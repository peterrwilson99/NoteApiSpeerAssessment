import { faker } from "@faker-js/faker";
import { validateEmail, validatePassword } from "../validators";
import { getUserInfo } from "../getUserInfo";
import { Request } from "express";

describe('Test Announcement Endpoints', () => {
    test('validateEmail with valid email', () => {
        for(let i = 0; i < 10; i++){
            const email = faker.internet.email();
            expect(validateEmail(email)).toBe(true);
        }
    });
    test('validateEmail with invalid emails', () => {
        const emails = [
            'invalid',
            'invalid@',
            'invalid@invalid',
            'invalid@invalid.',
            '@.c',
        ];
        for(let i = 0; i < emails.length; i++){
            expect(validateEmail(emails[i])).toBe(false);
        }
    });
    test('validatePassword with valid passwords', () => {
        const passwords = [
            'ValidPassword123!',
            'ValidPassword123@',
            'ValidPassword123#',
            'ValidPassword123$',
            'ValidPassword123%',
            'ValidPassword123^',
            'ValidPassword123&',
            'ValidPassword123*',
        ];
        for(let i = 0; i < passwords.length; i++){
            expect(validatePassword(passwords[i])).toBe(true);
        }
    });
    test('validatePassword with invalid passwords', () => {
        const passwords = [
            'invalid',
            'invalid!',
            'invalid1',
            'invalid!',
            'invalid1!',
            'aA1!',
        ];
        for(let i = 0; i < passwords.length; i++){
            expect(validatePassword(passwords[i])).toBe(false);
        }
    });
    test('getUserInfo with valid userInfo', () => {
        const userInfo = {
            email: faker.internet.email(),
            userId: faker.string.uuid(),
        };
        // make a Express request with body.authUser set to userInfo
        const req = {
            body: {
                authUser: userInfo,
            }
        };
        // call getUserInfo with req
        const { email, userId } = getUserInfo(req as Request);
        expect(email).toEqual(userInfo.email);
        expect(userId).toEqual(userInfo.userId);
    });
    test('getUserInfo with invalid userInfo', () => {
        const userInfo = {
            email: faker.internet.email(),
            userId: faker.string.uuid(),
        };
        // make a Express request with body.authUser set to userInfo
        const req = {
            body: userInfo
        };
        // call getUserInfo with req and expect it to throw
        expect(() => getUserInfo(req as Request)).toThrow();
    });
    test('getUserInfo with invalid userInfo', () => {
        const userInfo = {
            email: faker.internet.email(),
            userId: undefined,
        };
        // make a Express request with body.authUser set to userInfo
        const req = {
            body: {
                authUser: userInfo
            }
        };
        // call getUserInfo with req and expect it to throw
        expect(() => getUserInfo(req as Request)).toThrow();
    });

});