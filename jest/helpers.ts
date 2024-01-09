import { faker } from "@faker-js/faker";
import { Users, Notes } from "./data"

export const getTestUser = () => {
    // random number
    const user = faker.helpers.arrayElement(Users);
    if(!user){
        throw new Error("No user found");
    }
    return user;
}

export const getTestUsersAccessibleNotes = (user: typeof Users[0]) => {
    const possibleNotes = Notes.filter(note => note.authorId === user.id || note.sharedWith.includes(user.id));
    return possibleNotes;
}

export const getTestNoteForUser = (user: typeof Users[0]) => {
    const possibleNotes = getTestUsersAccessibleNotes(user);
    const note = faker.helpers.arrayElement(possibleNotes);
    if(!note){
        throw new Error("No note found");
    }
    return note;
}
export const getEditableTestNoteForUser = (user: typeof Users[0]) => {
    const possibleNotes = getUsersOwnedNotes(user);
    const note = faker.helpers.arrayElement(possibleNotes);
    if(!note){
        throw new Error("No note found");
    }
    return note;
}


export const getUsersOwnedNotes = (user: typeof Users[0]) => {
    const possibleNotes = Notes.filter(note => note.authorId === user.id);
    return possibleNotes;
}

export const getTestNoteForUserWithoutAccess = (user: typeof Users[0]) => {
    const possibleNotes = Notes.filter(note => note.authorId !== user.id && !note.sharedWith.includes(user.id));
    const note = faker.helpers.arrayElement(possibleNotes);
    if(!note){
        throw new Error("No note found");
    }
    return note;
}

export const getTestNoteSharedWithUser = (user: typeof Users[0]) => {
    const possibleNotes = Notes.filter(note => note.authorId !== user.id && note.sharedWith.includes(user.id));
    const note = faker.helpers.arrayElement(possibleNotes);
    if(!note){
        throw new Error("No note found");
    }
    return note;
}