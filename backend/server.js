const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const mongoose = require("mongoose");
const config = require("./config/config");
const db = require("./models");
const Role = db.role;

const app = express();

// CORS configuration - updated for deployment
app.use(cors({
  origin: process.env.CLIENT_URL || config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token', 'Origin', 'Accept']
}));

// Parse requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration - updated for cross-domain support in production
app.use(
  cookieSession({
    name: "countries-session",
    secret: config.auth.cookieSecret,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    secure: process.env.NODE_ENV === 'production'
  })
);

// Production security headers
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    next();
  });
}

// Connect to MongoDB with improved error handling
mongoose
  .connect(config.database.uri, {
    ...config.database.options,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connected to MongoDB.");
    initial(); // Initialize roles collection
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Routes
require("./routes/auth.routes")(app);
require("./routes/user.routes")(app);
require("./routes/favorite.routes")(app);

// Simple route for API health check
app.get("/api/health", (req, res) => {
  res.json({ message: "API is running." });
});

// Catch 404 and forward to error handler
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: process.env.NODE_ENV === 'production' 
      ? "Internal Server Error" 
      : err.message 
  });
});

// Initialize server with PORT from environment variable (required by most hosting platforms)
const PORT = process.env.PORT || config.server.port;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// Initialize roles in the database - properly implemented
function initial() {
  Role.estimatedDocumentCount()
    .then(count => {
      // Only add roles if the collection is empty
      if (count === 0) {
        new Role({ name: "user" })
          .save()
          .then(() => console.log("Added 'user' to roles collection"))
          .catch(err => console.error("Error adding 'user' role:", err));

        new Role({ name: "moderator" })
          .save()
          .then(() => console.log("Added 'moderator' to roles collection"))
          .catch(err => console.error("Error adding 'moderator' role:", err));

        new Role({ name: "admin" })
          .save()
          .then(() => console.log("Added 'admin' to roles collection"))
          .catch(err => console.error("Error adding 'admin' role:", err));
      }
    })
    .catch(err => console.error("Error when counting roles:", err));
}
