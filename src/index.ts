import express from "express";
import { config } from "dotenv";

import authRouter from "./routes/auth";
import notesRouter from "./routes/notes";
import searchRouter from "./routes/search";
import { checkEnv } from "./utils/checkEnv";
import { notFoundHandler } from "./handlers/NotFound";
import { rateLimit } from "express-rate-limit"


export const app = express();


config();
checkEnv();

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 15, // maximum 15 requests
})
if(process.env.NODE_ENV !== 'test'){
    app.use(limiter);
}
    
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/notes", notesRouter);
app.use("/api/search", searchRouter);

app.use(notFoundHandler);

if(process.env.NODE_ENV !== 'test'){
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server ready on port ${port}`));
}