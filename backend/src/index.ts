import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import { clerkMiddleware } from '@clerk/express'

const app = express();

app.use(cors({ origin: ENV.FRONTEND_URL, credentials: true }));
app.use(clerkMiddleware()) // auth obj will be attached to req.auth
app.use(express.json());                            // parses JSON request bodies.
app.use(express.urlencoded({ extended: true }));    // parses form data (like HTML forms).

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to BuySell API - Powered by PostgreSQL, Drizzle ORM & Clerk Auth",
    endpoints: {
      users: "/api/users",
      products: "/api/products",
      comments: "/api/comments",
    },
  });
});
  
app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
});