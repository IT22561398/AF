// frontend/src/services/favorite.service.js
import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "https://af-d8h4-c1xoneurv-nidula-hesaras-projects.vercel.app/api/";

class FavoriteService {
  getFavorites() {
    return axios.get(API_URL + "favorites", { headers: authHeader() });
  }

  toggleFavorite(countryCode, countryName, flagUrl) {
    return axios.post(
      API_URL + "favorites/toggle",
      { countryCode, countryName, flagUrl },
      { headers: authHeader() }
    );
  }
}

export default new FavoriteService();
