import { Prisma, PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { hashSync } from 'bcryptjs';

const NumUsers = 10;
const NumNotes = 30;

const prisma = new PrismaClient();

async function seed(){
    for(let i = 0; i < NumUsers; i++){
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const firstNote = {
            title: faker.commerce.productName(),
            content: faker.commerce.productDescription(),
        }
        const user: Prisma.UserCreateInput = {
            email: faker.internet.email({ firstName, lastName, provider: 'gmail.com' }),
            name: `${firstName} ${lastName}`,
            password: hashSync('password', 10),
            notes: { create: firstNote }
        };
        console.log("Seeding user:", user.email);
        await prisma.user.create({ data: user });
    }
    
    const users = await prisma.user.findMany();
    for(let i = 0; i < NumNotes - NumUsers; i++){
        const noteOwner = faker.helpers.arrayElement(users);
        const shareWith = faker.helpers.arrayElements(users, faker.number.int({ min: 1, max: 3 }));
        const note: Prisma.NoteCreateInput = {
            title: faker.commerce.productName(),
            content: faker.commerce.productDescription(),
            author: { connect: { id: noteOwner.id } },
            sharedWith: { connect: shareWith.map((user) => ({ id: user.id })) },
        }
        console.log("Seeding note:", note.title)
        await prisma.note.create({ data: note });
    }

    await prisma.$disconnect();
}

seed().then(() => {
    console.log('Seeding complete.');
}).catch((error) => {
    console.error(error);
});