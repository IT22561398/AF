import React, { useState, useEffect, useRef } from "react";
import { Navigate, Link } from "react-router-dom";
import authService from "../services/auth.service";
import axios from "axios";

const API_URL = "http://localhost:8080/api/";

const favoriteService = {
  getFavorites() {
    const user = JSON.parse(localStorage.getItem('user'));
    const headers = user && user.accessToken ? { 'x-access-token': user.accessToken } : {};
    return axios.get(API_URL + "favorites", { headers });
  },
  toggleFavorite(countryCode, countryName, flagUrl) {
    const user = JSON.parse(localStorage.getItem('user'));
    const headers = user && user.accessToken ? { 'x-access-token': user.accessToken } : {};
    return axios.put(API_URL + "favorites/toggle", { countryCode, countryName, flagUrl }, { headers });
  }
};

const Profile = () => {
  const currentUser = authService.getCurrentUser();
  const [bio, setBio] = useState("I'm a country enthusiast exploring the world through this amazing application.");
  const [favoriteCountries, setFavoriteCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [didInitialFetch, setDidInitialFetch] = useState(false);
  const carouselRef = useRef(null);

  useEffect(() => {
    if (!didInitialFetch) {
      fetchFavoriteCountries();
      setDidInitialFetch(true);
    }
  }, [didInitialFetch]);

  if (!currentUser) return <Navigate to="/login" />;

  const fetchFavoriteCountries = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await favoriteService.getFavorites();
      if (response.data && Array.isArray(response.data.favoriteCountries)) {
        setFavoriteCountries(response.data.favoriteCountries);
      } else {
        loadFromLocalStorage();
      }
    } catch {
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const localFavorites = JSON.parse(localStorage.getItem("favoriteCountries")) || [];
      setFavoriteCountries(localFavorites);
    } catch {
      setError("Failed to load favorite countries. Please refresh.");
      setFavoriteCountries([]);
    }
  };

  const removeFavorite = async (countryCode) => {
    try {
      const response = await favoriteService.toggleFavorite(countryCode, "", "");
      if (response.data && Array.isArray(response.data.favoriteCountries)) {
        setFavoriteCountries(response.data.favoriteCountries);
      } else {
        const updated = favoriteCountries.filter(c => c.code !== countryCode && c.cca3 !== countryCode);
        setFavoriteCountries(updated);
        localStorage.setItem("favoriteCountries", JSON.stringify(updated));
      }
    } catch {
      const updated = favoriteCountries.filter(c => c.code !== countryCode && c.cca3 !== countryCode);
      setFavoriteCountries(updated);
      localStorage.setItem("favoriteCountries", JSON.stringify(updated));
    }
  };

  const getInitials = (name) => name.split(' ').map(w => w[0]).join('').toUpperCase();
  const formatRoleName = (role) => {
    const clean = role.replace('ROLE_', '');
    return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Profile Header */}
        <div className="bg-gray-900 shadow-lg rounded-xl p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-bold text-white">
              {getInitials(currentUser.username)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-semibold text-white">{currentUser.username}</h2>
              </div>
              <p className="text-gray-400">{currentUser.email}</p>
              <div className="mt-1 flex space-x-2">
                {currentUser.roles.map((role, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-gray-700 text-white rounded-full">
                    {formatRoleName(role)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* About Me */}
        <div className="bg-gray-900 shadow-lg rounded-xl p-6">
          <h3 className="text-xl font-medium text-white mb-2">About Me</h3>
          <p className="text-gray-300">{bio}</p>
        </div>

        {/* Favorites */}
        <div className="bg-gray-900 shadow-lg rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-medium text-white">Favorite Countries</h3>
            <button onClick={fetchFavoriteCountries} className="text-sm text-gray-300 hover:text-white">
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-600 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <p className="text-red-400 mb-3">{error}</p>
              <button onClick={fetchFavoriteCountries} className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600">
                Try Again
              </button>
            </div>
          ) : favoriteCountries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">You have no favorite countries.</p>
              <Link to="/" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Explore Countries
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {favoriteCountries.map(country => (
                <div
                  key={country.code || country.cca3}
                  className="flex items-center bg-gray-800 rounded-xl px-4 py-2 shadow hover:shadow-md transition duration-200"
                >
                  <Link to={`/country/${country.code || country.cca3}`} className="flex items-center space-x-3 flex-grow">
                    <img
                      src={country.flag || country.flagUrl}
                      alt={`Flag of ${country.name}`}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={e => e.target.src = 'https://via.placeholder.com/32?text=NA'}
                    />
                    <span className="text-sm font-medium text-white truncate">{country.name}</span>
                  </Link>
                  <button
                    onClick={() => removeFavorite(country.code || country.cca3)}
                    className="ml-2 text-red-400 hover:text-red-600"
                    title="Remove"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7L5 7M10 11v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
