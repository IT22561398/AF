// backend/routes/favorite.routes.js
const { authJwt } = require("../middlewares");
const controller = require("../controllers/favorite.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  // Get all favorite countries
  app.get(
    "/api/favorites",
    [authJwt.verifyToken],
    controller.getFavorites
  );

  // Toggle a country in favorites
  app.post(
    "/api/favorites/toggle",
    [authJwt.verifyToken],
    controller.toggleFavorite
  );
};
