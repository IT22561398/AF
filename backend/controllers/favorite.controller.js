// backend/controllers/favorite.controller.js
const db = require("../models");
const User = db.user;

// Get all favorite countries for the logged-in user
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }
    
    return res.status(200).send({ favoriteCountries: user.favoriteCountries || [] });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

// Toggle a country in favorites (add if not present, remove if present)
exports.toggleFavorite = async (req, res) => {
  try {
    const { countryCode, countryName, flagUrl } = req.body;
    
    if (!countryCode) {
      return res.status(400).send({ message: "Country code is required." });
    }
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }
    
    // Initialize favoriteCountries array if it doesn't exist
    if (!user.favoriteCountries) {
      user.favoriteCountries = [];
    }
    
    // Check if country is in favorites
    const countryIndex = user.favoriteCountries.findIndex(country => country.code === countryCode);
    
    if (countryIndex === -1) {
      // Country is not in favorites, add it
      user.favoriteCountries.push({
        code: countryCode,
        name: countryName,
        flag: flagUrl
      });
      
      await user.save();
      
      return res.status(200).send({
        message: "Country added to favorites successfully.",
        favoriteCountries: user.favoriteCountries,
        added: true
      });
    } else {
      // Country is in favorites, remove it
      user.favoriteCountries.splice(countryIndex, 1);
      
      await user.save();
      
      return res.status(200).send({
        message: "Country removed from favorites successfully.",
        favoriteCountries: user.favoriteCountries,
        added: false
      });
    }
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};
