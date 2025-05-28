import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User, insertUserSchema } from "@shared/schema";
import { ZodError } from "zod";

// Define user for Express
declare global {
  namespace Express {
    // Extend Express.User interface with our User properties except password
    interface User {
      id: number;
      username: string;
      name: string | null;
      email: string | null;
      createdAt?: Date;
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "pet-adoption-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Validate input against schema
      try {
        insertUserSchema.parse(req.body);
      } catch (err) {
        if (err instanceof ZodError) {
          return res.status(400).json({ 
            message: "Validation failed", 
            errors: err.errors.map(e => ({
              path: e.path.join('.'),
              message: e.message
            }))
          });
        }
        throw err;
      }

      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        // Extract user data without password
        const { password, ...userResponse } = user;
        res.status(201).json(userResponse);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    // Basic validation for required fields
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: [
          { 
            path: !req.body.username ? "username" : "password", 
            message: "This field is required" 
          }
        ]
      });
    }

    passport.authenticate("local", (err: Error, user: User) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ 
          message: "Invalid username or password",
          errors: [{ path: "credentials", message: "The username or password you entered is incorrect" }]
        });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        // Extract user data without password
        const { password, ...userResponse } = user;
        res.status(200).json(userResponse);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ message: "Successfully logged out" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Make sure we never send the password hash to the client
    const { password, ...userWithoutPassword } = req.user as User;
    res.json(userWithoutPassword);
  });
  
  // API endpoint to check if username is available
  app.get("/api/user/check-username", async (req, res) => {
    try {
      const { username } = req.query;
      
      if (!username || typeof username !== 'string') {
        return res.status(400).json({ message: "Username parameter is required" });
      }
      
      const existingUser = await storage.getUserByUsername(username);
      
      res.json({ exists: !!existingUser });
    } catch (error) {
      console.error("Error checking username:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
}