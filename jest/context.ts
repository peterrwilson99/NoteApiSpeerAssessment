import { faker } from "@faker-js/faker";
import { Notes, Users } from "./data";
import { Prisma } from "@prisma/client";

jest.mock("@prisma/client", () => {
    const usersMock = Users;
    const notesMock = Notes;
  
  
    return { 
        PrismaClient: jest.fn().mockImplementation(() => {
            return {
                user: {
                    findMany: jest.fn().mockResolvedValue(usersMock),
                    findUnique: jest.fn().mockImplementation(({ where }) => {
                        const user = usersMock.find(user => user.email === where.email);
                        return user;
                    }),
                    create: jest.fn().mockImplementation(({ data }) => {
                        const user = {
                            id: faker.string.uuid(),
                            email: data.email,
                            password: data.password,
                            name: data.name,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            notes: [] as string[],
                            sharedNotes: [] as string[],
                        };
                        usersMock.push(user);
                        return user;
                    }),
                },
                note: {
                    findMany: jest.fn().mockImplementation(({ where }) => {
                        if(where.OR){
                            const notes = notesMock.filter(note => {
                                const authorIdOrIndex = where.OR.findIndex((s: any) => s.authorId !== undefined);
                                const sharedWithOrIndex = where.OR.findIndex((s: any) => s.sharedWith !== undefined);
                                return note.authorId === where.OR[authorIdOrIndex].authorId || note.sharedWith.includes(where.OR[authorIdOrIndex].authorId);
                            });
                            return notes;
                        }
                        if(where.authorId){
                            const notes = notesMock.filter(note => note.authorId === where.authorId);
                            return notes;
                        }
                        throw new Error('Invalid where clause');
                    }),
                    findUnique: jest.fn().mockImplementation(({ where }) => {
                        const note = notesMock.find(note => note.id === where.id);
                        if(where.OR){
                            const userId = where.OR.find((s: any) => s.authorId !== undefined);
                            if(note?.authorId === userId.authorId) return note;
                            if(note?.sharedWith.includes(userId.authorId)) return note;
                            return null;
                        }
                        return note;
                    }),
                    create: jest.fn().mockImplementation(({ data }) => {
                        const noteData = data as Prisma.NoteCreateInput
                        const sharedWith = (noteData.sharedWith?.connect as any[]).map((index: any) => index.email || index.id);
                        const note = {
                            id: faker.string.uuid(),
                            title: noteData.title as string,
                            content: noteData.content,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            authorId: noteData.author?.connect?.id as string,
                            sharedWith: sharedWith,
                        };

                        notesMock.push(note);
                        // add note to author's notes
                        const author = usersMock.find(user => user.id === note.authorId);
                        if(author) author.notes.push(note.id);
                        // add note to shared users' sharedNotes
                        for(const email of note.sharedWith){
                            const user = usersMock.find(user => user.email === email);
                            if(user) user.sharedNotes.push(note.id);
                        }
                        return note;
                    }),
                    update: jest.fn().mockImplementation(({ where, data }) => {
                        const note = notesMock.find(note => note.id === where.id && note.authorId === where.authorId);
                        if(!note) return null;
                        if(data.title) note.title = data.title;
                        if(data.content) note.content = data.content;
                        if(data.sharedWith){
                            if(data.sharedWith.connect){
                                for(const identifier of data.sharedWith.connect){
                                    // find user by email or id
                                    const user = usersMock.find(user => user.email === identifier.email || user.id === identifier.id);
                                    if(user){
                                        user.sharedNotes.push(note.id);
                                        note.sharedWith.push(user.id);
                                    }
                                }

                            }else if(data.sharedWith.set){
                                
                                for(const identifier of data.sharedWith.set){
                                    for(const identifier of note.sharedWith){
                                        const email = identifier.includes('@') ? identifier : undefined;
                                        const id = identifier.includes('@') ? undefined : identifier;
                                        const user = usersMock.find(user => user.email === email || user.id === id);
                                        // remove note from shared users' sharedNotes
                                        if(user){
                                            const noteIndex = user.sharedNotes.findIndex(noteId => noteId === note.id);
                                            if(noteIndex !== -1) user.sharedNotes.splice(noteIndex, 1);
                                        }
                                    } 
                                    note.sharedWith = [];
                                    const user = usersMock.find(user => user.email === identifier.email || user.id === identifier.id);
                                    if(user){
                                        const noteIndex = user.sharedNotes.findIndex(noteId => noteId === note.id);
                                        if(noteIndex !== -1) user.sharedNotes.splice(noteIndex, 1);
                                        const sharedWithIndex = note.sharedWith.findIndex(userId => userId === user.id);
                                        if(sharedWithIndex !== -1) note.sharedWith.splice(sharedWithIndex, 1);
                                    }
                                }
                            }
                        }
                        return note;
                    }),
                    delete: jest.fn().mockImplementation(({ where }) => {
                        const noteIndex = notesMock.findIndex(note => note.id === where.id && note.authorId === where.authorId);

                        if(noteIndex === -1) return null;
                        const note = notesMock.splice(noteIndex, 1)[0];
                        // remove note from author's notes
                        const author = usersMock.find(user => user.id === note.authorId);
                        if(author){
                            const noteIndex = author.notes.findIndex(noteId => noteId === note.id);
                            if(noteIndex !== -1) author.notes.splice(noteIndex, 1);
                        }
                        // remove note from shared users' sharedNotes
                        for(const identifier of note.sharedWith){
                            // find user by email or id
                            const user = usersMock.find(user => user.email === identifier || user.id === identifier);
                            if(user){
                                const noteIndex = user.sharedNotes.findIndex(noteId => noteId === note.id);
                                if(noteIndex !== -1) user.sharedNotes.splice(noteIndex, 1);
                            }
                        }
                        return note;
                    }),
                },
            }
        }),
    };
  });