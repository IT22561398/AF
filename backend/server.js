const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const mongoose = require("mongoose");
const config = require("./config/config");

const app = express();

// CORS configuration
app.use(cors(config.cors));

// Parse requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  cookieSession({
    name: "countries-session",
    secret: config.auth.cookieSecret,
    httpOnly: true,
    sameSite: 'strict'
  })
);

// Connect to MongoDB
mongoose
  .connect(config.database.uri, config.database.options)
  .then(() => {
    console.log("Successfully connected to MongoDB.");
    initial(); // Initialize roles collection
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit(1);
  });

// Routes
require("./routes/auth.routes")(app);
require("./routes/user.routes")(app);
require("./routes/favorite.routes")(app);

// Initialize server
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// Initialize roles in the database
function initial() {
  // ...your existing initial function code here...
}
