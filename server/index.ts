import dotenv from 'dotenv';
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectToDatabase } from "./mongodb";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Connect to MongoDB first if environment variable is set
    if (process.env.MONGODB_URI) {
      log("Connecting to MongoDB...");
      await connectToDatabase();
      log("MongoDB connected successfully");
    } else {
      log("MONGODB_URI not set - payment features will be disabled");
    }
  } catch (error) {
    log(`MongoDB connection error: ${error}`);
    log("Payment features will be disabled");
    // Continue even if MongoDB fails - the app should still work with PostgreSQL
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Try to serve on port 5000, but if it's in use, try alternatives
  const primaryPort = 5000;
  const fallbackPorts = [3000, 8080, 8000];
  
  // Function to attempt starting the server
  const startServer = (port: number) => {
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
      console.log(`Server is running at http://localhost:${port}`);
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        // If primary port is in use, try fallback ports
        if (port === primaryPort && fallbackPorts.length > 0) {
          const nextPort = fallbackPorts.shift()!;
          log(`Port ${port} is in use, trying port ${nextPort}...`);
          startServer(nextPort);
        } else {
          log(`All ports are in use. Please manually free a port or specify a different port.`);
          console.error('All attempted ports are in use. Please close other applications or specify a different port.');
          process.exit(1);
        }
      } else {
        log(`Failed to start server: ${err.message}`);
        console.error(err);
        process.exit(1);
      }
    });
  };
  
  // Start the server on the primary port first
  startServer(primaryPort);
})();
