require('dotenv').config();

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 8080,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  
  // MongoDB configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/countriesApp',
    options: {
    }
  },
  
  // JWT and authentication
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret-key',
    jwtExpiration: 86400, // 24 hours
    cookieSecret: process.env.COOKIE_SECRET || 'your-secret-key',
  },
  
  // API endpoints for REST Countries API
  countriesApi: {
    baseUrl: 'https://restcountries.com/v3.1',
    endpoints: {
      all: '/all',
      name: '/name/',
      region: '/region/',
      alpha: '/alpha/',
    }
  },
  
  // CORS settings
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }
};

module.exports = config;
