import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import "./CreateEvent.css";
import IpAddress from "../../Config/IpAddress";
import { fetchWithAuth } from "../../Services/fetchHelper";
import { AuthContext } from "../../Contexts/AuthProvider";

const supportedCurrencies = ["SOL"];

const CreatePayment = () => {
  const navigate = useNavigate();
  const ip = IpAddress.ip;
  const { user } = useContext(AuthContext);

  // Define state for form inputs
  const [amountFiat, setAmountFiat] = useState("");
  const [amountCrypto, setAmountCrypto] = useState("");
  const [currency, setCurrency] = useState(supportedCurrencies[0]); // Default to SOL
  const [walletAddress, setWalletAddress] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [description, setDescription] = useState("");
  const [linkName, setLinkName] = useState(""); // New state for link name
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [cryptoRates, setCryptoRates] = useState({ SOL: 0, USDC: 0 }); // State for crypto rates
  const [nairaRate, setNairaRate] = useState(0); // State for Naira rate

  // Fetch live crypto rates and Naira rate when the component mounts and every minute
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

  // Handle amount change for Fiat
  const handleFiatChange = (value) => {
    setAmountFiat(value);
    const convertedAmount = (
      value /
      (cryptoRates[currency] * nairaRate)
    ).toFixed(6); // Convert to crypto
    setAmountCrypto(convertedAmount);
  };

  // Handle amount change for Crypto
  const handleCryptoChange = (value) => {
    setAmountCrypto(value);
    const convertedAmount = (
      value *
      (cryptoRates[currency] * nairaRate)
    ).toFixed(2); // Convert to fiat
    setAmountFiat(convertedAmount);
  };

  // Validate Solana wallet address (simplified check)
  const isValidSolanaAddress = (address) => {
    return address.length === 44; // Basic check for length of Solana wallet address
  };

  const minAmountUSDC = 1; // Minimum amount for USDC

  // Function to calculate dynamic minimum for SOL based on current price and estimated gas fee
  const calculateMinAmountSOL = () => {
    const gasFeeEstimate = 0.0005; // Hypothetical gas fee in SOL
    const minSOL = Math.max(0.01, gasFeeEstimate); // Minimum is 0.01 SOL or gas fee equivalent
    return minSOL;
  };

  // Handle form submission
  const handleCreatePayment = async (e) => {
    e.preventDefault();

    const minAmountSOL = calculateMinAmountSOL();
    // Validate inputs
    if (
      !amountFiat ||
      !amountCrypto ||
      !currency ||
      !walletAddress ||
      !linkName // Check for link name
    ) {
      setErr("Please fill in all required fields.");
      return;
    }
    if (currency === "USDC" && parseFloat(amountCrypto) < minAmountUSDC) {
      setErr(`Minimum transaction amount for USDC is ${minAmountUSDC} USDC.`);
      return;
    }

    if (currency === "SOL" && parseFloat(amountCrypto) < minAmountSOL) {
      setErr(`Minimum transaction amount for SOL is ${minAmountSOL} SOL.`);
      return;
    }

    // Existing validation for Solana wallet address
    if (!isValidSolanaAddress(walletAddress)) {
      setErr("Please enter a valid Solana wallet address.");
      return;
    }

    try {
      setLoading(true);

      const formData = {
        merchant_email: user.email,
        merchant_id: user.id,
        amount_fiat: parseFloat(amountFiat),
        amount_crypto: parseFloat(amountCrypto),
        currency,
        wallet_address: walletAddress,
        description,
        link_name: linkName, // Add link name to formData
        status: "Pending",
      };

      const response = await fetchWithAuth(`${ip}/createPayment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Payment request created successfully on Solana network!");
        navigate("/manageevent");
      } else {
        setErr("Failed to create payment request.");
      }
    } catch (error) {
      setErr("An error occurred: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      {loading && (
        <div className="loading-overlay">
          <div className="backg">
            <div className="spinner"></div>
          </div>
        </div>
      )}
      <Sidebar />
      <div className="create-payment-container">
        <h2 style={{
          color: "white",
          marginTop: 40
        }}>Generate a payment link</h2>
        {err && <p className="error-message">{err}</p>}

        <div className="payment-form">
          <div className="form-group">
            <label>Link Name</label>
            <input
              type="text"
              value={linkName}
              onChange={(e) => setLinkName(e.target.value)}
              placeholder="Enter a name for the payment link"
              required
            />
          </div>

          <div className="form-group">
            <label>Currency (Solana Supported)</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              required
            >
              {supportedCurrencies.map((currencyOption, index) => (
                <option key={index} value={currencyOption}>
                  {currencyOption}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <p style={{ color: "#888888" }}>
              Current {currency} Price: {cryptoRates[currency]} USD
            </p>
            <p style={{ color: "#888888" }}>
              Current {currency} Price in Naira:{" "}
              {(cryptoRates[currency] * nairaRate).toFixed(2)} NGN
            </p>
          </div>

          <div className="form-group">
            <label>Amount (Fiat)</label>
            <input
              type="number"
              value={amountFiat}
              onChange={(e) => handleFiatChange(e.target.value)}
              placeholder="Enter fiat amount"
              required
            />
          </div>

          <div className="form-group">
            <label>Amount (Crypto)</label>
            <input
              type="number"
              value={amountCrypto}
              onChange={(e) => handleCryptoChange(e.target.value)}
              placeholder="Enter crypto amount"
              required
            />
          </div>

          <div className="form-group">
            <label>Wallet Address (Solana)</label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter your Solana wallet address"
              required
            />
          </div>
          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter payment description"
            ></textarea>
          </div>
        </div>
        <div className="create-btn">
          <button type="button" onClick={handleCreatePayment} style={{
            backgroundColor: "rgba(0,0,0,0.3)",
            color: "white"
          }}>
            Generate Payment link
          </button>
        </div>
      </div>
    </div>
  );
};

export { CreatePayment };
