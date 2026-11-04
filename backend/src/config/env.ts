import dotenv from "dotenv";

dotenv.config({quiet: true});

export const ENV = {
    PORT: process.env.PORT || 3000,
    DB_URL: process.env.DB_URL || "sthliketest",
    NODE_ENV: process.env.NODE_ENV || "development",
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
    CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY || "",
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || "",
};