# NoteApi
A simple note API with authentication and search functionality.

# Getting Started
## Prerequisites
- [Node.js](https://nodejs.org/en/download/)
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Environment Variables
The following environment variables are required to run the application, please set them in a `.env` file in the root directory of the project.
- `JWT_SECRET`
- `DATABASE_URL`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD` 
- `POSTGRES_DB`

## Installation
1. Clone the repository
2. Run `npm install` in the root directory
3. Run `docker-compose up` in the root directory to start the PostgreSQL database
4. Run `npx prisma generate` in the root directory to run the database migrations
5. Run `npx prisma migrate deploy` in the root directory to run the database migrations
6. Run `npm run seed` to seed the database with dummy data
7. Create a `.env` file in the root directory and set the environment variables listed in the [Environment Variables](#environment-variables) section

## Run Development Server
1. Run `npm run dev` in the root directory
2. Run `docker-compose up` in the root directory to start the PostgreSQL database if it is not already running

## Run Production Server
1. Run `npm run build` in the root directory
2. Run `npm start` in the root directory
3. Run `docker-compose up` in the root directory to start the PostgreSQL database if it is not already running

## Unit and Integration Tests
1. Run `npm test` in the root directory

# Packages/Tools Used
- [Express](https://expressjs.com/)
    - Express was used as the web framework for the application. Express is a great framework for building REST APIs in a fast and simple way.
- [TypeScript](https://www.typescriptlang.org/)
    - TypeScript was used to add static typing to the application.
- [Prisma](https://www.prisma.io/)
    - Prisma was used as the ORM for the application. I enjoy prisma for its ease of use, type safety, and migrations.
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/)
    - Docker was used to containerize the application.
- [Faker](https://www.npmjs.com/package/faker)
    - Faker was used to generate fake data for testing.
- [Jest](https://jestjs.io/)
    - Jest was used as the testing framework for the application. Jest has great integration with TypeScript and Express.
- [Express Rate Limit](https://www.npmjs.com/package/express-rate-limit)
    - Express Rate Limit was used to limit the number of requests to the API.

# Usage
## API Documentation

### Authentication Endpoints: 
- `POST /api/auth/signup`: create a new user account.
    - body parameters:
        - `email: string`
        - `password: string`
        - `name?: string`
    - Response:
        - `message: string`
- `POST /api/auth/login`: log in to an existing user account and receive an access token.
    - body parameters:
        - `email: string`
        - `password: string`
    - Response:
        - `token: string`
        - `email: string`

### Note Endpoints:
Note Endpoints: 
- `GET /api/notes`: get a list of all notes for the authenticated user. 
    - Headers:
        - `Authorization: Bearer <token>`
- `GET /api/notes/:id`: get a note by ID for the authenticated user.
    - Request Parameters:
        - `id: string`
    - Headers:
        - `Authorization: Bearer <token>`
    - Response: 
        - `id: string`
        - `title: string`
        - `content: string`
        - `createdAt: string`
        - `updatedAt: string`
        - `authorId: string`
- `POST /api/notes`: create a new note for the authenticated user.
    - Request Body:
        - `title: string`
        - `content: string`
        - `sharedWith?: string[]`
            - list of emails who the note should be shared with
    - Headers:
        - `Authorization: Bearer <token>`
    - Response: 
        - `id: string`
        - `title: string`
        - `content: string`
        - `createdAt: string`
        - `updatedAt: string`
        - `authorId: string`
- `PUT /api/notes/:id`: update an existing note by ID for the authenticated user.
    - Body parameters:
        - `title?: string`
        - `content?: string`
        - `sharedWith?: string[]`
            - list of emails who the note should be shared with
    - Headers:
        - `Authorization: Bearer <token>` 
    - Response:
        - `id: string`
        - `title: string`
        - `content: string`
        - `createdAt: string`
        - `updatedAt: string`
        - `authorId: string`
- `DELETE /api/notes/:id`: delete a note by ID for the authenticated user.
    - Request Parameters:
        - `id: string`
    - Headers:
        - `Authorization: Bearer <token>` 
    - Response:
        - `message: string`
- `POST /api/notes/:id/share`: share a note with another user for the authenticated user.
    - Request Parameters:
        - `id: string`
    - Body parameters:
        - `email: string`
    - Headers:
        - `Authorization: Bearer <token>` 
    - Response:
        - `message: string`

### Search Endpoint
- `GET /api/search?q=:query`: search for notes based on keywords for the authenticated user.
    - Request Parameters:
        - `q: string`
            - query string
    - Headers:
            - `Authorization: Bearer <token>`
    - Response:
        - `notes: Note[]`
            - `id: string`
            - `title: string`
            - `content: string`
            - `createdAt: string`
            - `updatedAt: string`
            - `authorId: string`

# Improvements
- Scalabalility
    - The application could be scaled by adding a load balancer and multiple instances of the application.
        - My personal preference for a load balancer is [NGINX](https://www.nginx.com/)
        - The server was built stateless, so it should be easy to scale horizontally simply by adding more instances of the application pointing to the same database.