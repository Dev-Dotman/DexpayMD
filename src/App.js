import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import Login from "./Screens/Login";
import Signup from "./Screens/Signup";
import "./App.css";
import Dashboard from "./Screens/Dashboard";
import { CreatePayment } from "./Screens/SmallerComps/CreateEvent";
import { ManageEvents } from "./Screens/SmallerComps/ManageEvents";
import { SearchEvents } from "./Screens/SmallerComps/SearchEvents";
import { Wallet } from "./Screens/SmallerComps/Wallet";
import EventDetails from "./Screens/SmallerComps/EventDetails";
import DataAndAnalyticsPage from "./Screens/SmallerComps/DataAndAnalyticsPage";
import Settings from "./Screens/SmallerComps/Settings";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AuthProvider } from "./Contexts/AuthProvider";
import PrivateRoute from "./Screens/PrivateRoute";
import PaymentPage from "./Screens/SmallerComps/PaymentPage";

const theme = createTheme({
  palette: {
    primary: {
      main: "#128c7e",
    },
    secondary: {
      main: "#ff9800",
    },
    // Add other colors if needed
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is authenticated
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <AuthProvider navigate={navigate}>
      <ThemeProvider theme={theme}>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
              <Route path="/" element={<Dashboard />} />
            </Route>
            <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
              <Route path="/createevent" element={<CreatePayment />} />
            </Route>
            <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
              <Route path="/manageevent" element={<ManageEvents />} />
            </Route>
            <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
              <Route path="/Searchevent" element={<SearchEvents />} />
            </Route>
            <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
              <Route path="/wallet" element={<Wallet />} />
            </Route>
            <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
              <Route path="/eventdetails" element={<EventDetails />} />
            </Route>
            <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
              <Route
                path="/dataAndAnalytics"
                element={<DataAndAnalyticsPage />}
              />
            </Route>
            <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route
              path="/module/payment-link/:token"
              element={<PaymentPage />}
            />
          </Routes>
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
