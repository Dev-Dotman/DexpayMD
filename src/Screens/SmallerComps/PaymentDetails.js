import React, { useState, useEffect, useContext } from "react";
import "./PaymentPage.css"; // Updated CSS file for the crypto theme
import { QRCodeSVG } from "qrcode.react"; // Use QRCodeSVG
import { AuthContext } from "../../Contexts/AuthProvider";

const PaymentPage = ({ paymentData }) => {
  const { amount_fiat, currency, description, link_name, wallet_address, key } =
    paymentData;
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [cryptoRates, setCryptoRates] = useState({ SOL: 0, USDC: 1 });
  const [nairaRate, setNairaRate] = useState(0);
  const [amountCrypto, setAmountCrypto] = useState(0);
  const [escrowAddress, setEscrowAddress] = useState(""); // State for escrow wallet address

  // Fetching live crypto rates
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

  // Calculate amount in crypto based on fiat and exchange rates
  useEffect(() => {
    if (currency === "SOL") {
      setAmountCrypto(amount_fiat / nairaRate / cryptoRates.SOL);
    } else if (currency === "USDC") {
      setAmountCrypto(amount_fiat / nairaRate / cryptoRates.USDC);
    }
  }, [currency, amount_fiat, cryptoRates, nairaRate]);

  const handlePayClick = async () => {
    // Fetch the escrow account
    try {
      const response = await fetch("/api/create-escrow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountCrypto,
          currency,
          payerId: user.email,
          merchantWalletAddress: wallet_address,
          key
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create escrow account");
      }

      const data = await response.json();
      setEscrowAddress(data.escrow_address); // Set the escrow wallet address from the response
      setShowModal(true); // Show the modal after creating the escrow account
    } catch (error) {
      console.error("Error creating escrow:", error);
      alert("Failed to create escrow account. Please try again.");
    }
  };

  // Copy wallet address function
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // USDC token mint address on Solana
  const USDC_MINT_ADDRESS = "Es9vMFrzaCER5F1etQY2oFkaUahk7Y3WwT1Sme8zjSNR";

  // Generate QR Code URI based on the currency
  const generateQRCodeUri = () => {
    if (currency === "USDC") {
      return `solana:${escrowAddress}?amount=${amountCrypto}&spl-token=${USDC_MINT_ADDRESS}&label=${encodeURIComponent(
        link_name
      )}&message=${encodeURIComponent(description)}`;
    } else if (currency === "SOL") {
      return `solana:${escrowAddress}?amount=${amountCrypto}&label=${encodeURIComponent(
        link_name
      )}&message=${encodeURIComponent(description)}`;
    }
    return "";
  };

  return (
    <div className="payment-page">
      <h2 style={{ color: "white" }}>DexPay</h2>
      <div className="payment-details">
        <h1>{link_name}</h1>
        <p>
          <strong>Amount (Fiat):</strong> ₦{amount_fiat}
        </p>
        <p>
          <strong>Amount (Crypto):</strong> {amountCrypto.toFixed(6)} {currency}
        </p>
        <p>
          <strong>Description:</strong> {description}
        </p>

        <button className="pay-button" onClick={handlePayClick}>
          Pay
        </button>

        {/* DexPay support link */}
        <p style={{ marginTop: "20px" }}>
          Want to support crypto payments? Visit{" "}
          <a
            href="https://dexpay.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "lightblue", textDecoration: "underline" }}
          >
            DexPay.com
          </a>
        </p>
      </div>

      {/* Payment Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Payment Instructions</h2>
            <label>Escrow Wallet Address</label>
            <input
              type="text"
              value={escrowAddress}
              disabled
              className="wallet-address-input"
            />
            <p>
              Send {amountCrypto.toFixed(6)} {currency} to the above address.
            </p>
            <button
              onClick={() => copyToClipboard(escrowAddress)}
              className="copy-button"
            >
              Copy Address
            </button>

            {/* Toggle between showing and hiding QR Code */}
            <button
              className="toggle-button"
              onClick={() => setShowQRCode((prev) => !prev)}
            >
              {showQRCode ? "Hide QR Code" : "Show QR Code"}
            </button>

            {/* Show QR Code if selected */}
            {showQRCode && (
              <QRCodeSVG
                value={generateQRCodeUri()}
                size={200}
                className="qr-code"
              />
            )}

            <button
              onClick={() => setShowModal(false)}
              className="close-button"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
