import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { 
  ArrowLeft, Heart, Globe, MapPin, Users, Languages, 
  Clock, DollarSign, Phone, Flag, Calendar, Landmark, Compass, 
  Maximize, Mountain, Waves, CloudRain, Thermometer, Truck,
  Map, Building, Briefcase, Wifi, Share2, BookOpen, Info,
  ChevronDown, ChevronUp, Download, ExternalLink, Image
} from "lucide-react";
import favoriteService from "../services/favorite.service";
import authService from "../services/auth.service";

const CountryDetails = () => {
  const { countryCode } = useParams();
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [borderCountries, setBorderCountries] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    geography: true,
    demographics: true,
    government: true,
    practical: true,
    international: true,
    codes: true
  });
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [favoriteError, setFavoriteError] = useState(null);
  const currentUser = authService.getCurrentUser();
  const [activeTab, setActiveTab] = useState("overview");
  const overviewRef = useRef(null);
  const geographyRef = useRef(null);
  const politicsRef = useRef(null);
  const economyRef = useRef(null);

  useEffect(() => {
    const fetchCountryDetails = async () => {
      setLoading(true);
      try {
        // Get detailed country info
        const response = await axios.get(`https://restcountries.com/v3.1/alpha/${countryCode}`);
        setCountry(response.data[0]);
        
        // Fetch border countries if any
        if (response.data[0].borders && response.data[0].borders.length > 0) {
          const bordersResponse = await axios.get(
            `https://restcountries.com/v3.1/alpha?codes=${response.data[0].borders.join(',')}`
          );
          setBorderCountries(bordersResponse.data);
        }
      } catch (err) {
        console.error("Error fetching country details:", err);
        setError("Failed to load country details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCountryDetails();
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [countryCode]);

  // Fetch favorites from API if logged in, otherwise from localStorage
  useEffect(() => {
    const fetchFavorites = async () => {
      if (currentUser) {
        try {
          const response = await favoriteService.getFavorites();
          setFavorites(response.data.favoriteCountries || []);
        } catch (err) {
          console.error("Error fetching favorites:", err);
          const savedFavorites = JSON.parse(localStorage.getItem("favoriteCountries") || "[]");
          setFavorites(savedFavorites);
        }
      } else {
        // Not logged in, use localStorage
        const savedFavorites = JSON.parse(localStorage.getItem("favoriteCountries") || "[]");
        setFavorites(savedFavorites);
      }
    };
    
    fetchFavorites();
  }, [currentUser]);

  // Toggle favorite status using API or localStorage
  const toggleFavorite = async () => {
    if (!country) return;
    
    setIsFavoriteLoading(true);
    setFavoriteError(null);
    
    if (currentUser) {
      // User is logged in, use API
      try {
        const response = await favoriteService.toggleFavorite(
          country.cca3,
          country.name.common,
          country.flags.png
        );
        
        setFavorites(response.data.favoriteCountries);
      } catch (err) {
        console.error("Error toggling favorite:", err);
        setFavoriteError("Failed to update favorite status. Please try again.");
        
        // Fallback to localStorage
        toggleLocalFavorite();
      } finally {
        setIsFavoriteLoading(false);
      }
    } else {
      // User is not logged in, use localStorage
      toggleLocalFavorite();
      setIsFavoriteLoading(false);
    }
  };

  // Helper function for localStorage fallback
  const toggleLocalFavorite = () => {
    const isFavorite = favorites.some(fav => (fav.code || fav.cca3) === country.cca3);
    let newFavorites;
    
    if (isFavorite) {
      newFavorites = favorites.filter(fav => (fav.code || fav.cca3) !== country.cca3);
    } else {
      newFavorites = [...favorites, {
        code: country.cca3,
        name: country.name.common,
        flag: country.flags.png
      }];
    }
    
    setFavorites(newFavorites);
    localStorage.setItem("favoriteCountries", JSON.stringify(newFavorites));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const formatObjectValues = (obj) => {
    if (!obj) return "N/A";
    return Object.values(obj).map(val => 
      typeof val === 'string' ? val : val.name || val.common || val
    ).join(", ");
  };

  const shareCountry = () => {
    if (navigator.share) {
      navigator.share({
        title: `${country.name.common} - Country Information`,
        text: `Check out information about ${country.name.common}`,
        url: window.location.href,
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Could not copy text: ', err));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute top-0 w-24 h-24 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute top-4 left-4 w-16 h-16 border-4 border-gray-500 border-t-transparent rounded-full animate-spin-slow"></div>
          </div>
          <p className="font-medium">Loading country information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="text-center p-8 max-w-md text-white">
          <div className="p-4 bg-gray-800 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Error Loading Country</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <Link 
            to="/" 
            className="inline-flex items-center px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors duration-200 shadow-md"
          >
            <ArrowLeft size={18} className="mr-2" />
            Return to World Explorer
          </Link>
        </div>
      </div>
    );
  }

  if (!country) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="text-center p-8 max-w-md text-white">
          <div className="p-4 bg-gray-800 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Country Not Found</h1>
          <p className="text-gray-300 mb-6">We couldn't find the country you're looking for.</p>
          <Link 
            to="/" 
            className="inline-flex items-center px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors duration-200 shadow-md"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Countries
          </Link>
        </div>
      </div>
    );
  }

  // Determine if the country is in favorites, handling both API and localStorage formats
  const isFavorite = favorites.some(fav => (fav.code || fav.cca3) === country.cca3);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Navigation Bar */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <Link 
                to="/"
                className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 shadow-sm mr-3"
              >
                <ArrowLeft size={18} className="mr-2" />
                Back
              </Link>
              <nav className="flex">
                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                  <li className="inline-flex items-center">
                    <Link to="/" className="text-sm text-gray-400 hover:text-white">
                      Home
                    </Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="w-3 h-3 text-gray-500 mx-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                      </svg>
                      <span className="text-sm font-medium text-white md:ml-2">{country.name.common}</span>
                    </div>
                  </li>
                </ol>
              </nav>
            </div>
            
            <div className="flex space-x-2">
              {/* Enhanced favorite button with loading state */}
              <button
                onClick={toggleFavorite}
                disabled={isFavoriteLoading}
                className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isFavoriteLoading ? "bg-gray-700 text-gray-400" :
                  isFavorite 
                    ? "bg-white text-black hover:bg-gray-200" 
                    : "bg-gray-800 text-white hover:bg-gray-700"
                }`}
              >
                {isFavoriteLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Heart size={18} className="mr-2" fill={isFavorite ? "#FFFFFF" : "none"} />
                    <span className="hidden sm:inline">{isFavorite ? "Favorite" : "Add to Favorites"}</span>
                  </>
                )}
              </button>
              
              <button
                onClick={shareCountry}
                className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Share2 size={18} className="mr-2 sm:mr-0" />
                <span className="hidden sm:inline ml-2">Share</span>
              </button>
            </div>
          </div>

          {/* Error message for favorite operations */}
          {favoriteError && (
            <div className="mb-4 p-3 bg-gray-800 text-white rounded-lg">
              <p className="text-sm">{favoriteError}</p>
            </div>
          )}

          {/* Country Header */}
          <div className="bg-gray-900 rounded-xl shadow-md overflow-hidden mb-8" ref={overviewRef}>
            <div className="relative">
              {/* Country flag as background with overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/40 z-10"></div>
              <div className="h-40 md:h-64 w-full bg-cover bg-center" 
                   style={{ backgroundImage: `url(${country.flags.svg || country.flags.png})` }}>
              </div>
              
              {/* Country basic info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20">
                <div className="flex items-end">
                  <div>
                    <h1 className="text-3xl md:text-5xl font-bold drop-shadow-lg mb-1">{country.name.common}</h1>
                    <p className="text-lg md:text-xl opacity-90">{country.name.official}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main content tabs */}
            <div className="border-b border-gray-700">
              <nav className="flex overflow-x-auto">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === "overview" 
                      ? "border-b-2 border-white text-white" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => {
                    setActiveTab("geography");
                    scrollToSection(geographyRef);
                  }}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === "geography" 
                      ? "border-b-2 border-white text-white" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Geography
                </button>
                <button
                  onClick={() => {
                    setActiveTab("politics");
                    scrollToSection(politicsRef);
                  }}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === "politics" 
                      ? "border-b-2 border-white text-white" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Politics & Society
                </button>
                <button
                  onClick={() => {
                    setActiveTab("economy");
                    scrollToSection(economyRef);
                  }}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === "economy" 
                      ? "border-b-2 border-white text-white" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Economy
                </button>
              </nav>
            </div>
            
            {/* Summary info */}
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Key facts */}
                <div className="md:col-span-2">
                  <h2 className="text-2xl font-bold mb-4">Key Facts</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Globe size={20} className="text-white mr-2" />
                        <h3 className="font-semibold">Region</h3>
                      </div>
                      <p>{country.region}</p>
                      {country.subregion && (
                        <p className="text-gray-400 text-sm mt-1">{country.subregion}</p>
                      )}
                    </div>
                    
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <MapPin size={20} className="text-white mr-2" />
                        <h3 className="font-semibold">Capital</h3>
                      </div>
                      <p>{country.capital?.join(", ") || "N/A"}</p>
                    </div>
                    
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Users size={20} className="text-white mr-2" />
                        <h3 className="font-semibold">Population</h3>
                      </div>
                      <p>{country.population.toLocaleString()}</p>
                    </div>
                    
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Languages size={20} className="text-white mr-2" />
                        <h3 className="font-semibold">Languages</h3>
                      </div>
                      <p>{formatObjectValues(country.languages)}</p>
                    </div>
                    
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <DollarSign size={20} className="text-white mr-2" />
                        <h3 className="font-semibold">Currency</h3>
                      </div>
                      <div>
                        {country.currencies ? (
                          Object.entries(country.currencies).map(([code, currency]) => (
                            <p key={code}>
                              {currency.name} 
                              <span className="text-gray-400 text-sm ml-1">
                                ({currency.symbol || code})
                              </span>
                            </p>
                          ))
                        ) : (
                          <p>N/A</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Clock size={20} className="text-white mr-2" />
                        <h3 className="font-semibold">Time Zone</h3>
                      </div>
                      <p>
                        {country.timezones?.[0] || "N/A"}
                      </p>
                      {country.timezones && country.timezones.length > 1 && (
                        <p className="text-gray-400 text-sm mt-1">+ {country.timezones.length - 1} more</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Coat of arms */}
                {country.coatOfArms && (country.coatOfArms.svg || country.coatOfArms.png) ? (
                  <div className="bg-gray-800 p-6 rounded-lg flex flex-col items-center justify-center">
                    <h3 className="font-semibold mb-3">Coat of Arms</h3>
                    <div className="flex-1 flex items-center justify-center p-4">
                      <img 
                        src={country.coatOfArms.svg || country.coatOfArms.png} 
                        alt={`Coat of Arms of ${country.name.common}`} 
                        className="max-h-32 object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-800 p-6 rounded-lg flex flex-col items-center justify-center">
                    <h3 className="font-semibold mb-3">Flag</h3>
                    <div className="flex-1 flex items-center justify-center p-4">
                      <img 
                        src={country.flags.svg || country.flags.png} 
                        alt={country.flags.alt || `Flag of ${country.name.common}`} 
                        className="max-h-24 object-contain border border-gray-700"
                      />
                    </div>
                    <p className="text-gray-400 text-sm mt-2 text-center">
                      {country.flags.alt || `The official flag of ${country.name.common}`}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Native Names */}
              {country.name.nativeName && Object.keys(country.name.nativeName).length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Native Names</h3>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(country.name.nativeName).map(([code, name]) => (
                        <div key={code} className="p-3 border border-gray-700 rounded-md bg-gray-900">
                          <div className="font-medium mb-1">{code}</div>
                          <div className="text-sm text-gray-300">{name.official}</div>
                          {name.common !== name.official && (
                            <div className="text-sm text-gray-400">{name.common}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Geography Section */}
          <div className="mb-8" ref={geographyRef}>
            <div className="bg-gray-900 rounded-xl shadow-md overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Geography & Location</h2>
                  <button 
                    onClick={() => toggleSection('geography')}
                    className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                  >
                    {expandedSections.geography ? (
                      <ChevronUp size={20} className="text-white" />
                    ) : (
                      <ChevronDown size={20} className="text-white" />
                    )}
                  </button>
                </div>
                
                {expandedSections.geography && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-gray-800 p-5 rounded-lg">
                          <h3 className="font-semibold text-lg mb-4 flex items-center">
                            <Compass size={20} className="mr-2" />
                            Coordinates
                          </h3>
                          <div className="space-y-3">
                            <div className="flex">
                              <span className="font-medium w-24">Latitude:</span>
                              <span>{country.latlng?.[0] || "N/A"}°</span>
                            </div>
                            <div className="flex">
                              <span className="font-medium w-24">Longitude:</span>
                              <span>{country.latlng?.[1] || "N/A"}°</span>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-gray-700">
                            <a 
                              href={country.maps?.googleMaps || `https://www.google.com/maps?q=${country.latlng?.[0]},${country.latlng?.[1]}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-white hover:text-gray-300 transition-colors"
                            >
                              <ExternalLink size={16} className="mr-1" />
                              View on Google Maps
                            </a>
                          </div>
                        </div>
                        
                        <div className="bg-gray-800 p-5 rounded-lg">
                          <h3 className="font-semibold text-lg mb-4 flex items-center">
                            <Maximize size={20} className="mr-2" />
                            Area & Borders
                          </h3>
                          <div className="space-y-3">
                            <div className="flex">
                              <span className="font-medium w-24">Total Area:</span>
                              <span>{country.area ? country.area.toLocaleString() : "N/A"} km²</span>
                            </div>
                            <div className="flex">
                              <span className="font-medium w-24">Land:</span>
                              <span>Data not available</span>
                            </div>
                            <div className="flex">
                              <span className="font-medium w-24">Water:</span>
                              <span>Data not available</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Border Countries */}
                        {borderCountries.length > 0 && (
                          <div className="sm:col-span-2 bg-gray-800 p-5 rounded-lg">
                            <h3 className="font-semibold text-lg mb-4 flex items-center">
                              <Map size={20} className="mr-2" />
                              Bordering Countries ({borderCountries.length})
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                              {borderCountries.map(border => (
                                <Link 
                                  key={border.cca3} 
                                  to={`/country/${border.cca3}`}
                                  className="group"
                                >
                                  <div className="border border-gray-700 bg-gray-900 rounded-lg p-3 hover:border-white hover:bg-gray-800 transition-all duration-200">
                                    <div className="flex items-center">
                                      <img 
                                        src={border.flags.png} 
                                        alt={`Flag of ${border.name.common}`} 
                                        className="w-8 h-6 object-cover rounded mr-2"
                                      />
                                      <span className="group-hover:text-white transition-colors">
                                        {border.name.common}
                                      </span>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Map */}
                    <div className="bg-gray-800 p-5 rounded-lg">
                      <h3 className="font-semibold text-lg mb-4 flex items-center">
                        <Map size={20} className="mr-2" />
                        Location
                      </h3>
                      
                      <div className="aspect-w-4 aspect-h-3 bg-gray-700 rounded-lg overflow-hidden mb-4">
                        <iframe
                          src={`https://maps.google.com/maps?q=${country.latlng?.[0]},${country.latlng?.[1]}&z=5&output=embed`}
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          style={{ border: 0 }}
                          allowFullScreen=""
                          aria-hidden="false"
                          tabIndex="0"
                          title={`Map of ${country.name.common}`}
                          className="filter grayscale"
                        ></iframe>
                      </div>
                      
                      <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            <div className="font-medium">Region:</div>
                            <div>{country.region} {country.subregion ? `(${country.subregion})` : ''}</div>
                          </div>
                          <div className="flex space-x-2">
                            <a 
                              href={country.maps?.googleMaps} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700 transition-colors"
                              title="Open in Google Maps"
                            >
                              <ExternalLink size={18} />
                            </a>
                            <a 
                              href={country.maps?.openStreetMaps} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700 transition-colors"
                              title="Open in OpenStreetMap"
                            >
                              <Map size={18} />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Politics & Society Section */}
          <div className="mb-8" ref={politicsRef}>
            <div className="bg-gray-900 rounded-xl shadow-md overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Politics & Society</h2>
                  <button 
                    onClick={() => toggleSection('demographics')}
                    className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                  >
                    {expandedSections.demographics ? (
                      <ChevronUp size={20} className="text-white" />
                    ) : (
                      <ChevronDown size={20} className="text-white" />
                    )}
                  </button>
                </div>
                
                {expandedSections.demographics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Demographics */}
                    <div className="bg-gray-800 p-5 rounded-lg">
                      <h3 className="font-semibold text-lg mb-4 flex items-center">
                        <Users size={20} className="mr-2" />
                        Demographics
                      </h3>
                      
                      <div className="mb-6">
                        <div className="flex items-center mb-2">
                          <span className="font-medium">Population:</span>
                          <span className="ml-2">{country.population.toLocaleString()}</span>
                        </div>
                        
                        <div className="relative pt-1">
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
                            <div 
                              style={{ width: `${Math.min((country.population / 1400000000) * 100, 100)}%` }} 
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-white"
                            ></div>
                          </div>
                          <div className="flex text-xs text-gray-400 justify-between">
                            <span>0</span>
                            <span>World's largest populations</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-700 pt-4 mt-4">
                        <h4 className="font-medium mb-3">Languages</h4>
                        {country.languages ? (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(country.languages).map(([code, language]) => (
                              <span key={code} className="px-3 py-1 bg-gray-900 rounded-full text-sm">
                                {language}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400">No language information available</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Government */}
                    <div className="bg-gray-800 p-5 rounded-lg">
                      <h3 className="font-semibold text-lg mb-4 flex items-center">
                        <Landmark size={20} className="mr-2" />
                        Government & Status
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <span className="font-medium w-32">Independent:</span>
                          <div className={`px-2 py-1 rounded-full text-xs ${country.independent ? 'bg-white text-black' : 'bg-gray-700 text-gray-300'}`}>
                            {country.independent ? "Yes" : "No"}
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <span className="font-medium w-32">UN Member:</span>
                          <div className={`px-2 py-1 rounded-full text-xs ${country.unMember ? 'bg-white text-black' : 'bg-gray-700 text-gray-300'}`}>
                            {country.unMember ? "Yes" : "No"}
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <span className="font-medium w-32">Capital:</span>
                          <span>{country.capital?.join(", ") || "N/A"}</span>
                        </div>
                      </div>
                      
                      {country.regionalBlocs && country.regionalBlocs.length > 0 && (
                        <div className="border-t border-gray-700 pt-4 mt-4">
                          <h4 className="font-medium mb-3">Regional Organizations</h4>
                          <div className="space-y-2">
                            {country.regionalBlocs.map(bloc => (
                              <div key={bloc.acronym} className="bg-gray-900 p-2 rounded border border-gray-700">
                                <div className="font-medium">{bloc.name}</div>
                                {bloc.acronym && <div className="text-sm text-gray-400">{bloc.acronym}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Economy Section */}
          <div className="mb-8" ref={economyRef}>
            <div className="bg-gray-900 rounded-xl shadow-md overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Economy & Practical Information</h2>
                  <button 
                    onClick={() => toggleSection('government')}
                    className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                  >
                    {expandedSections.government ? (
                      <ChevronUp size={20} className="text-white" />
                    ) : (
                      <ChevronDown size={20} className="text-white" />
                    )}
                  </button>
                </div>
                
                {expandedSections.government && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Economy */}
                    <div className="bg-gray-800 p-5 rounded-lg">
                      <h3 className="font-semibold text-lg mb-4 flex items-center">
                        <DollarSign size={20} className="mr-2" />
                        Economy
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Currencies</h4>
                          {country.currencies ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {Object.entries(country.currencies).map(([code, currency]) => (
                                <div key={code} className="bg-gray-900 p-3 rounded border border-gray-700">
                                  <div className="font-medium">{currency.name}</div>
                                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                                    <span>Code: {code}</span>
                                    <span>Symbol: {currency.symbol || "N/A"}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-400">No currency information available</p>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Car</h4>
                          <div className="flex flex-wrap gap-4">
                            <div className="bg-gray-900 p-3 rounded border border-gray-700 flex-1 min-w-[140px]">
                              <div className="text-sm text-gray-400">Driving Side</div>
                              <div className="font-medium capitalize">{country.car?.side || "N/A"}</div>
                            </div>
                            
                            <div className="bg-gray-900 p-3 rounded border border-gray-700 flex-1 min-w-[140px]">
                              <div className="text-sm text-gray-400">License Plate</div>
                              <div className="font-medium">{country.car?.signs?.join(", ") || "N/A"}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Practical Information */}
                    <div className="bg-gray-800 p-5 rounded-lg">
                      <h3 className="font-semibold text-lg mb-4 flex items-center">
                        <Info size={20} className="mr-2" />
                        Practical Information
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gray-900 p-3 rounded border border-gray-700">
                          <div className="flex">
                            <Clock size={18} className="mr-2 text-white flex-shrink-0" />
                            <div>
                              <p className="font-medium">Timezones</p>
                              <div className="text-sm text-gray-300 mt-1">
                                {country.timezones?.length > 0 ? (
                                  <>
                                    <p>{country.timezones[0]}</p>
                                    {country.timezones.length > 1 && (
                                      <p className="text-xs text-gray-400 mt-1">+ {country.timezones.length - 1} more</p>
                                    )}
                                  </>
                                ) : (
                                  "N/A"
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-900 p-3 rounded border border-gray-700">
                          <div className="flex">
                            <Calendar size={18} className="mr-2 text-white flex-shrink-0" />
                            <div>
                              <p className="font-medium">Start of Week</p>
                              <div className="text-sm text-gray-300 mt-1 capitalize">
                                {country.startOfWeek || "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-900 p-3 rounded border border-gray-700">
                          <div className="flex">
                            <Phone size={18} className="mr-2 text-white flex-shrink-0" />
                            <div>
                              <p className="font-medium">Calling Code</p>
                              <div className="text-sm text-gray-300 mt-1">
                                {country.idd?.root}{country.idd?.suffixes?.[0] || "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-900 p-3 rounded border border-gray-700">
                          <div className="flex">
                            <Flag size={18} className="mr-2 text-white flex-shrink-0" />
                            <div>
                              <p className="font-medium">Top-Level Domain</p>
                              <div className="text-sm text-gray-300 mt-1">
                                {country.tld?.join(", ") || "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-medium mb-3">Country Codes</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          <div className="bg-gray-900 p-2 rounded border border-gray-700 text-center">
                            <div className="text-xs text-gray-400">Alpha-2</div>
                            <div className="font-medium">{country.cca2}</div>
                          </div>
                          
                          <div className="bg-gray-900 p-2 rounded border border-gray-700 text-center">
                            <div className="text-xs text-gray-400">Alpha-3</div>
                            <div className="font-medium">{country.cca3}</div>
                          </div>
                          
                          <div className="bg-gray-900 p-2 rounded border border-gray-700 text-center">
                            <div className="text-xs text-gray-400">Numeric</div>
                            <div className="font-medium">{country.ccn3 || "N/A"}</div>
                          </div>
                          
                          {country.cioc && (
                            <div className="bg-gray-900 p-2 rounded border border-gray-700 text-center">
                              <div className="text-xs text-gray-400">CIOC</div>
                              <div className="font-medium">{country.cioc}</div>
                            </div>
                          )}
                          
                          {country.fifa && (
                            <div className="bg-gray-900 p-2 rounded border border-gray-700 text-center">
                              <div className="text-xs text-gray-400">FIFA</div>
                              <div className="font-medium">{country.fifa}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Back to top button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors duration-200 shadow-md"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              Back to Top
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryDetails;
