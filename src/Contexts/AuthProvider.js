import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import IpAddress from "../Config/IpAddress";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();
const supportedCurrencies = ["SOL"];

export const AuthProvider = ({ children}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [paymentLinks, setPaymentLinks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [currency, setCurrency] = useState(supportedCurrencies[0]);
  const [revenueData, setRevenueData] = useState({
    labels: [],
    datasets: [],
  });
  const base = IpAddress.base;
  const ip = IpAddress.ip;
  const  navigate  = useNavigate()

  const fetch_transactions = async (paymentLinkIds) => {
    try {
      const response = await fetch(`${ip}/fetchTransactions2`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payment_link_ids: paymentLinkIds }), // Send an array of IDs
      });

      const data = await response.json();
      if (response.ok) {
        const latestTransactions = data.transactions; // Now fetched from all IDs
        setTransactions(latestTransactions);
        console.log(data.transactions);
        setTotalRevenue(data.totalRevenue);
        setRevenueData({
          labels: data.revenueData.labels, // x-axis labels
          datasets: [
            {
              label: "Revenue",
              data: data.revenueData.datasets[0].data, // y-axis data
              backgroundColor: "rgba(0, 128, 0, 0.3)", // Dark theme green
              borderColor: "rgba(0, 255, 0, 1)", // Bright green for borders
              borderWidth: 1,
            },
          ],
        });
      } else {
        console.error("Failed to fetch transactions.");
      }
    } catch (error) {
      console.error("An error occurred: " + error.message);
    }
  };

  const fetchPaymentLinks = async (user) => {
    try {
      const response = await fetch(`${ip}/payment-links`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ merchant_id: user }),
      });

      const data = await response.json();
      if (response.ok) {
        setPaymentLinks(data); // Store the payment links in state
        const paymentLinkIds = data.map((link) => link.key); // Extract the IDs
        fetch_transactions(paymentLinkIds); // Pass the IDs to fetch transactions
      } else {
        console.error("Failed to fetch payment links.");
      }
    } catch (error) {
      console.error("An error occurred: " + error.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
        navigate("/");
        setIsAuthenticated(true);
        fetchPaymentLinks(decoded.id);
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        navigate("/login");
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

  const [cryptoRates, setCryptoRates] = useState({ SOL: 0, USDC: 0 }); // State for crypto rates
  const [nairaRate, setNairaRate] = useState(0); // State for Naira rate

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const cryptoResponse = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=solana,usd-coin&vs_currencies=usd"
        );
        const cryptoData = await cryptoResponse.json();
        setCryptoRates({
          SOL: cryptoData.solana.usd,
          USDC: cryptoData["usd-coin"].usd,
        });

        const nairaResponse = await fetch(
          "https://api.exchangerate-api.com/v4/latest/USD"
        ); // Example Naira rate API
        const nairaData = await nairaResponse.json();
        setNairaRate(nairaData.rates.NGN); // Set Naira rate
      } catch (error) {
        console.error("Error fetching rates:", error);
      }
    };

    fetchRates(); // Initial fetch
    const interval = setInterval(fetchRates, 60000); // Fetch every minute

    return () => clearInterval(interval); // Clean up interval on unmount
  }, []);

  const handleCryptoChange = (value) => {
    const convertedAmount = (
      value *
      (cryptoRates[currency] * nairaRate)
    ).toFixed(2); // Convert to fiat
    return convertedAmount;
  };

  const login = (token) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    setUser(decoded);
    setIsAuthenticated(true);
    navigate("/");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        transactions,
        totalRevenue,
        revenueData,
        cryptoRates,
        nairaRate,
        handleCryptoChange,
        paymentLinks,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
