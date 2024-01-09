import { faker } from "@faker-js/faker";
import { Prisma } from "@prisma/client";
import { hashSync } from "bcryptjs";

export const NumUsers = 10;
export const NotesPerUser = 3;

interface DummyUsers {
    id: string;
    email: string;
    password: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    notes: string[];
    sharedNotes: string[];
}

interface DummyNote {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    authorId: string;
    sharedWith: string[];
  }

const createData = () => {
    const Users: DummyUsers[] = [];
    const Notes: DummyNote[] = [];
    for(let i = 0; i < NumUsers; i++){
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const user: DummyUsers = {
            id: faker.string.uuid(),
            email: faker.internet.email({ firstName, lastName, provider: 'gmail.com' }),
            password: hashSync('password', 10),
            name: `${firstName} ${lastName}`,
            createdAt: faker.date.past(),
            updatedAt: faker.date.recent(),
            notes: [] as string[],
            sharedNotes: [] as string[],
        };
        for(let j = 0; j < NotesPerUser; j++){
            const note: DummyNote = {
                id: faker.string.uuid(),
                title: faker.commerce.productName(),
                content: faker.commerce.productDescription(),
                createdAt: faker.date.past(),
                updatedAt: faker.date.recent(),
                authorId: user.id,
                sharedWith: [] as string[],
            }
            Notes.push(note);
            user.notes.push(note.id);
        }
        Users.push(user);
    }

    // now we share these notes with other users
    for(let i = 0; i < Notes.length; i++){
        const note = Notes[i];
        const author = Users.find((user) => user.id === note.authorId);
        if(!author) throw new Error("Author not found");

        const sharedWith = faker.helpers.arrayElements(Users, faker.number.int({ min: 0, max: 5 }));
        
        // if the author is in the sharedWith array, remove them
        const index = sharedWith.findIndex((user) => user.id === author.id);
        if(index > -1){
            sharedWith.splice(index, 1);
        }
        
        // add the note to the sharedWith users
        for(let j = 0; j < sharedWith.length; j++){
            const user = sharedWith[j];
            user.sharedNotes.push(note.id);
            Users[Users.findIndex((u) => u.id === user.id)] = user;
        }
        note.sharedWith = sharedWith.map((user) => user.id);
        Notes[i] = note;
    }

    return { Users, Notes };
}

export const { Users, Notes } = createData();