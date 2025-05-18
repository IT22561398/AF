import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Search, ChevronDown, Heart, X } from "lucide-react";
import favoriteService from "../services/favorite.service";
import authService from "../services/auth.service";

const Home = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [region, setRegion] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState({});
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    fetchAllCountries();
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    if (currentUser) {
      try {
        const { data } = await favoriteService.getFavorites();
        setFavorites(data.favoriteCountries || []);
      } catch {
        setFavorites(JSON.parse(localStorage.getItem("favoriteCountries") || "[]"));
      }
    } else {
      setFavorites(JSON.parse(localStorage.getItem("favoriteCountries") || "[]"));
    }
  };

  const fetchAllCountries = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("https://restcountries.com/v3.1/all");
      setCountries(data);
    } finally {
      setLoading(false);
    }
  };

  const searchCountries = async () => {
    if (!searchTerm.trim()) {
      fetchAllCountries();
      setIsFilterActive(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.get(`https://restcountries.com/v3.1/name/${searchTerm}`);
      setCountries(data);
      setIsFilterActive(true);
    } catch {
      setCountries([]);
    } finally {
      setLoading(false);
    }
  };

  const filterByRegion = async (regionValue) => {
    setRegion(regionValue);
    setShowRegionDropdown(false);
    if (!regionValue) {
      fetchAllCountries();
      setIsFilterActive(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.get(`https://restcountries.com/v3.1/region/${regionValue}`);
      setCountries(data);
      setIsFilterActive(true);
    } catch {
      setCountries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchCountries();
  };

  const toggleFavorite = async (e, country) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavoriteLoading(prev => ({ ...prev, [country.cca3]: true }));

    if (currentUser) {
      try {
        const { data } = await favoriteService.toggleFavorite(
          country.cca3,
          country.name.common,
          country.flags.png
        );
        setFavorites(data.favoriteCountries);
      } catch {
        toggleLocalFavorite(country);
      } finally {
        setIsFavoriteLoading(prev => ({ ...prev, [country.cca3]: false }));
      }
    } else {
      toggleLocalFavorite(country);
      setIsFavoriteLoading(prev => ({ ...prev, [country.cca3]: false }));
    }
  };

  const toggleLocalFavorite = (country) => {
    const exists = favorites.some(fav => fav.code === country.cca3);
    const updated = exists
      ? favorites.filter(fav => fav.code !== country.cca3)
      : [...favorites, { code: country.cca3, name: country.name.common, flag: country.flags.png }];
    setFavorites(updated);
    localStorage.setItem("favoriteCountries", JSON.stringify(updated));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRegion("");
    setIsFilterActive(false);
    fetchAllCountries();
  };

  const sortedCountries = [...countries].sort((a, b) => {
    if (sortBy === "name") return a.name.common.localeCompare(b.name.common);
    if (sortBy === "population-high") return b.population - a.population;
    if (sortBy === "population-low") return a.population - b.population;
    return 0;
  });

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Hero */}
        <header className="text-center space-y-2">
          <h1 className="text-5xl font-extrabold">Find Your Next Destination</h1>
          <p className="text-gray-400 text-lg">Browse, filter & bookmark countries around the globe.</p>
        </header>

        {/* Search & Filters */}
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4 items-stretch">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Type a country name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-900 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white transition"
            />
            <Search
              size={20}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowRegionDropdown(!showRegionDropdown)}
              className="w-full px-4 py-3 bg-gray-900 rounded-lg flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-white transition"
            >
              <span>{region ? `Region: ${region}` : "All Regions"}</span>
              <ChevronDown size={18} className={`${showRegionDropdown ? "rotate-180" : ""} transition`} />
            </button>
            {showRegionDropdown && (
              <ul className="absolute mt-2 bg-gray-900 border border-gray-700 rounded-lg w-full z-10">
                {["", "Africa", "Americas", "Asia", "Europe", "Oceania"].map((r, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => filterByRegion(r.toLowerCase())}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-800 transition"
                    >
                      {r || "All Regions"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-4 py-3 bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-white transition"
          >
            <option value="name">A → Z</option>
            <option value="population-high">Population ↓</option>
            <option value="population-low">Population ↑</option>
          </select>

          {isFilterActive && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center px-4 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition"
            >
              <X size={16} className="mr-2" /> Reset
            </button>
          )}
        </form>

        {/* Results Count */}
        <p className="text-gray-400">
          {loading
            ? "Loading countries..."
            : `Showing ${countries.length} ${countries.length === 1 ? "country" : "countries"}`}
        </p>

        {/* Country Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading
            ? Array(8).fill(0).map((_, i) => (
                <div key={i} className="h-64 bg-gray-900 rounded-lg animate-pulse" />
              ))
            : sortedCountries.length > 0
            ? sortedCountries.map(country => {
                const isFav = favorites.some(f => f.code === country.cca3);
                return (
                  <div
                    key={country.cca3}
                    className="bg-gray-900 rounded-lg overflow-hidden shadow hover:shadow-lg transition flex flex-col"
                  >
                    <div className="relative h-40">
                      <img
                        src={country.flags.png}
                        alt={country.name.common}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={e => toggleFavorite(e, country)}
                        disabled={isFavoriteLoading[country.cca3]}
                        className={`absolute top-3 right-3 p-2 rounded-full ${
                          isFav ? "bg-red-600 text-white" : "bg-white text-gray-900"
                        } transition`}
                      >
                        <Heart size={18} fill={isFav ? "currentColor" : "none"} />
                      </button>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h2 className="font-semibold text-lg mb-1">{country.name.common}</h2>
                      <p className="text-gray-400 text-sm mb-4">
                        🌐 {country.region} &nbsp;|&nbsp; 👥 {country.population.toLocaleString()}
                      </p>
                      {/* Subtle Read More */}
                      <div className="mt-auto text-right">
  <Link
    to={`/country/${country.cca3}`}
    className="text-indigo-400 text-sm hover:underline"
  >
    View →
  </Link>
</div>

                    </div>
                  </div>
                );
              })
            : (
              <div className="col-span-full text-center py-16 text-gray-500">
                No matches found. Try a different keyword or region.
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Home;
