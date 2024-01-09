/* istanbul ignore file */
export function checkEnv() {
    // ensure all required env variables are set
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not set");
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
    if (!process.env.POSTGRES_USER) throw new Error("POSTGRES_USER not set")
    if (!process.env.POSTGRES_PASSWORD) throw new Error("POSTGRES_PASSWORD not set")
    if (!process.env.POSTGRES_DB) throw new Error("POSTGRES_DB not set")
}