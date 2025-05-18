import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Header = ({ currentUser, logOut }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleLogOut = (e) => {
    e.preventDefault();
    logOut();
    setIsUserDropdownOpen(false);
    navigate("/");
  };

  const linkBase =
    "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200";

  const isActive = (path) =>
    location.pathname === path
      ? "bg-gray-800 text-white"
      : "text-gray-400 hover:text-white hover:bg-gray-700";

  return (
    <nav className="bg-black shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="ml-2 text-white text-xl font-bold tracking-wide">
Globetrotter
</span>
            </Link>
            {/* Desktop nav */}
            <div className="hidden md:flex md:ml-10 space-x-2">
              <Link to="/" className={`${linkBase} ${isActive("/")}`}>
                Home
              </Link>
              {/* Add more nav links here if needed */}
            </div>
          </div>

          {/* Right side (desktop) */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {currentUser ? (
              <div className="relative">
                <button
                  ref={buttonRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsUserDropdownOpen((o) => !o);
                  }}
                  className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold">
                    {currentUser.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-200">{currentUser.username}</span>
                  <svg
                    className={`h-4 w-4 text-gray-200 transform transition-transform ${
                      isUserDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isUserDropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-50 z-20"
                  >
                    <Link
                      to="/profile"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                    >
                      Your Profile
                    </Link>
                    <button
                      onClick={handleLogOut}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    isActive("/login") === linkBase + " " + isActive("/login")
                      ? "bg-gray-800 text-white"
                      : "text-gray-200 hover:bg-gray-700"
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-md bg-gray-700 text-white text-sm font-medium hover:bg-gray-900 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen((o) => !o)}
              className="text-gray-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 p-2 rounded-md"
            >
              <span className="sr-only">Toggle menu</span>
              {isMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`${linkBase} block ${isActive("/")}`}
            >
              Home
            </Link>
            {/* More links... */}
          </div>
          <div className="border-t border-gray-700 pt-4 pb-3 px-2">
            {currentUser ? (
              <>
                <div className="flex items-center space-x-3 px-3">
                  <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold">
                    {currentUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-gray-200 font-medium">
                      {currentUser.username}
                    </p>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    to="/profile"
                    className="block px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded-md"
                  >
                    Your Profile
                  </Link>
                  <button
                    onClick={handleLogOut}
                    className="w-full text-left block px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded-md"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="block w-full text-center px-3 py-2 rounded-md text-sm font-medium text-gray-200 hover:bg-gray-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-center px-3 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
