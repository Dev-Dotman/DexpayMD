import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import IpAddress from "../Config/IpAddress";

export const AuthContext = createContext();

export const AuthProvider = ({ children, navigate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const base = IpAddress.base

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
      }
    }
  }, []);

  useEffect(() => {
    // Perform any necessary cleanup when component unmounts
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  const login = (token) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    setUser(decoded);
    setIsAuthenticated(true);
    navigate("/", { state: { user: decoded } });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
