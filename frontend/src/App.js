import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import authService from "./services/auth.service";

// Import components
import Hedera from "./components/Header";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Profile from "./components/Profile";
import CountryDetails from "./components/CountryDetails";

const App = () => {
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const logOut = () => {
    authService.logout();
    setCurrentUser(undefined);
  };

  return (
    <div>
      <Hedera currentUser={currentUser} logOut={logOut} />

      <div className="container mx-auto mt-3">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/country/:countryCode" element={<CountryDetails />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
