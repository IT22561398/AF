module.exports = {
    secret: process.env.JWT_SECRET || "your-jwt-secret-key",
    // JWT expires in 24 hours
    jwtExpiration: 86400
  };
  