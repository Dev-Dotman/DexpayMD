import React, { useState, useEffect, useContext } from "react";
import { Sidebar } from "./Sidebar";
import "./ManageEvents.css";
import { Line } from "react-chartjs-2";
import { MenuItem, FormControl, Select, Divider } from "@mui/material";
import { Info, Money, Search } from "@mui/icons-material";
import { AuthContext } from "../../Contexts/AuthProvider";
import IpAddress from "../../Config/IpAddress";
const supportedCurrencies = ["SOL"];

const ManageEvents = ({ route }) => {
  const { user } = useContext(AuthContext);
  const [paymentLinks, setPaymentLinks] = useState([]);
  const [selectedLink, setSelectedLink] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [amountFiat, setAmountFiat] = useState("");
  const [filter, setFilter] = useState("all");
  const [balance, setBalance] = useState(0);
  const [balanceFiat, setBalanceFiat] = useState(0);
  const [revenueData, setRevenueData] = useState({
    labels: [],
    datasets: [],
  });
  const [selectedPaymentLinkDetails, setSelectedPaymentLinkDetails] = useState(
    {}
  );
  const [err, setErr] = useState("");
  const ip = IpAddress.ip;

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

  const [currency, setCurrency] = useState(supportedCurrencies[0]);

  const handleCryptoChange = (value) => {
    const convertedAmount = (
      value *
      (cryptoRates[currency] * nairaRate)
    ).toFixed(2); // Convert to fiat
    setAmountFiat(convertedAmount);
  };

  const handleCryptoChange2 = (value) => {
    const convertedAmount = (
      value *
      (cryptoRates[currency] * nairaRate)
    ).toFixed(2); // Convert to fiat
    setBalanceFiat(convertedAmount);
  };
  useEffect(() => {
    const fetchPaymentLinks = async () => {
      try {
        const response = await fetch(`${ip}/payment-links`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ merchant_id: user.id }),
        });

        const data = await response.json();
        if (response.ok) {
          setPaymentLinks(data);
        } else {
          setErr("Failed to fetch payment links.");
        }
      } catch (error) {
        setErr("An error occurred: " + error.message);
      }
    };

    fetchPaymentLinks();
  }, [user.id]);

  const handleLinkChange = async (linkId) => {
    setSelectedLink(linkId);

    try {
      const response = await fetch(`${ip}/fetchTransactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_link_id: linkId,
          filter, // Send the selected filter value
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setTransactions(data.transactions);
        setFilteredTransactions(data.transactions);
        setTotalRevenue(data.totalRevenue);
        handleCryptoChange(data.totalRevenue);
        handleCryptoChange2(data.balance);
        setBalance(data.balance);
        setRevenueData({
          labels: data.revenueData.labels, // Set labels dynamically
          datasets: [
            {
              label: "Revenue",
              data: data.revenueData.datasets[0].data, // Set data dynamically
              backgroundColor: "rgba(0, 128, 0, 0.3)", // Dark theme green
              borderColor: "rgba(0, 255, 0, 1)", // Bright green for borders
              borderWidth: 1,
            },
          ],
        });
        setSelectedPaymentLinkDetails(data.paymentLink);
        setErr("");
      } else {
        setErr("Failed to fetch transactions.");
      }
    } catch (error) {
      setErr("An error occurred: " + error.message);
    }
  };

  const handleFilterChange = (value) => {
    setFilter(value);
    if (selectedLink) {
      // Refetch the transactions for the selected link based on the new filter
      handleLinkChange(selectedLink);
    }
  };

  const [searchQuery, setSearchQuery] = useState(""); // State to manage search query
  const [filteredTransactions, setFilteredTransactions] =
    useState(transactions);

  // Handle search input change and filter transactions
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter transactions by payer email or transaction hash
    const filtered = transactions.filter(
      (transaction) =>
        transaction.payer_email.toLowerCase().includes(query) ||
        transaction.transaction_hash.toLowerCase().includes(query)
    );

    setFilteredTransactions(filtered); // Set the filtered transactions
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          alert("Copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    } else {
      // Fallback for browsers that do not support Clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Copied to clipboard!");
    }
  };

  return (
    <div
      className="dashboard-container"
      style={{ backgroundColor: "#121212", color: "#fff" }}
    >
      <Sidebar />
      <div className="manage-events-container">
        <div className="moduleHolder">
          <h2 style={{ color: "#fff" }}>My Payment Links</h2>
          {err && (
            <p className="error-message" style={{ color: "red" }}>
              {err}
            </p>
          )}
          <select
            value={selectedLink}
            onChange={(e) => handleLinkChange(e.target.value)}
            className="payment-link-dropdown"
            style={{ backgroundColor: "#1e1e2e", color: "#fff" }}
          >
            <option value="">Select a payment link</option>
            {paymentLinks.map((link) => (
              <option key={link.key} value={link.key}>
                {link.link_name}
              </option>
            ))}
          </select>

          <div className="dashboard-main">
            {!selectedLink && (
              <div className="centered-content">
                <div className="icon">🔗</div>
                <p>No payment module selected</p>
              </div>
            )}

            {selectedLink && (
              <>
                {/* Payment Link Details */}
                <div className="payment-link-details">
                  <h4 style={{ color: "#90caf9" }}>Payment Link Details</h4>
                  <input
                    type="text"
                    value={selectedPaymentLinkDetails?.link_name || ""}
                    disabled
                    style={{
                      backgroundColor: "#1e1e2e",
                      color: "#fff",
                      border: "1px solid #fff",
                      marginBottom: "10px",
                    }}
                  />
                  <input
                    type="text"
                    value={`Key - ${selectedPaymentLinkDetails?.key || ""}`}
                    disabled
                    style={{
                      backgroundColor: "#1e1e2e",
                      color: "#fff",
                      border: "1px solid #fff",
                    }}
                  />
                  <input
                    type="text"
                    value={`Payment Link - ${
                      IpAddress.ip2
                    }/module/payment-link/${
                      selectedPaymentLinkDetails?.key || ""
                    }`}
                    style={{
                      backgroundColor: "#1e1e2e",
                      color: "#fff",
                      border: "1px solid #fff",
                    }}
                    className="det-input"
                  />
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `${IpAddress.ip2}/module/payment-link/${selectedPaymentLinkDetails?.key}`
                      )
                    }
                    className="copy-button"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.5)",
                      color: "white",
                    }}
                  >
                    Copy Link
                  </button>
                </div>

                {/* Flex Container for Chart and Overview */}
                <div className="chart-overview-container">
                  {/* Chart Container */}
                  <div className="chart-container">
                    <div className="header-left">
                      <FormControl variant="outlined" style={{ minWidth: 120 }}>
                        <Select
                          labelId="filter-label"
                          value={filter}
                          onChange={(e) => handleFilterChange(e.target.value)}
                          className="filterLabel"
                          sx={{
                            color: "#90caf9", // Changes the selected text color
                            "& .MuiSvgIcon-root": {
                              color: "#90caf9", // Customize the dropdown arrow
                            },
                            "& .MuiSelect-select": {
                              "&.Mui-selected": {
                                color: "green", // Changes the selected text in the dropdown menu
                              },
                            },
                          }}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                "& .MuiMenuItem-root.Mui-selected": {
                                  backgroundColor: "lightblue", // Change the background of selected menu item
                                  color: "black", // Change the selected item text color
                                },
                              },
                            },
                          }}
                        >
                          <MenuItem value="24h">24 Hours</MenuItem>
                          <MenuItem value="7d">7 Days</MenuItem>
                          <MenuItem value="30d">30 Days</MenuItem>
                          <MenuItem value="365d">365 Days</MenuItem>
                          <MenuItem value="all">All Time</MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                    <div style={{ height: "400px", width: "100%" }}>
                      <Line
                        data={revenueData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                        className="lineChart"
                      />
                    </div>
                    <h4 style={{ color: "rgba(144, 202, 249, 0.7)" }}>
                      Revenue Generated
                    </h4>
                    <Divider />
                  </div>

                  {/* Overview Section */}
                  <div className="overview2">
                    {/* <div className="total-revenue">
                      <h4 style={{ color: "#90caf9" }}>
                        Wallet balance <span>( Sol ) </span>
                      </h4>

                      <h1 style={{ color: "#90caf9" }}>
                        {`${balance}`} <Money />
                      </h1>
                      <h5 style={{ color: "#90caf9" }}>
                        Currently valued at {balanceFiat} naira
                      </h5>
                    </div> */}
                    <div className="total-revenue">
                      <h4 style={{ color: "#90caf9" }}>
                        Platform received revenue <span>( Sol ) </span>
                      </h4>

                      <h1 style={{ color: "#90caf9" }}>
                        {totalRevenue.toFixed(6)} <Money />
                      </h1>
                      <h5 style={{ color: "#90caf9" }}>
                        Currently valued at {amountFiat} naira
                      </h5>
                    </div>
                    <div
                      className="payment-details"
                      style={{
                        backgroundColor: "#1e1e1e",
                        color: "#90caf9",
                        boxShadow: "0 0 2px #90caf9",
                      }}
                    >
                      <h4 style={{ color: "#90caf9" }}>
                        Wallet Address <Info sx={{ fontSize: "13px" }} />
                      </h4>
                      <p style={{ color: "#90caf9", fontWeight: "600" }}>
                        {user.BankAccountName}
                      </p>
                      <p style={{ color: "#90caf9", fontWeight: "600" }}>
                        {selectedPaymentLinkDetails.wallet_address
                          ? selectedPaymentLinkDetails.wallet_address.substring(
                              0,
                              window.innerWidth <= 768 ? 20 : 30
                            )
                          : ""}
                        ...
                      </p>
                    </div>
                    <h4 style={{ color: "#90caf9" }}>
                      {/* Wallet balance <span>( Sol ) </span> */}
                      NB: All payments are made to your solana wallet address
                    </h4>
                  </div>
                </div>

                {/* Table for Transactions */}
                <div className="transactions-container">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <Search style={{ marginRight: "10px", color: "#90caf9" }} />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      style={{
                        padding: "5px",
                        width: "250px",
                        borderRadius: "5px",
                        border: "1px solid #fff",
                        backgroundColor: "#1e1e2e",
                        color: "#fff",
                      }}
                    />
                    <h3>Total Payments - {filteredTransactions.length}</h3>
                  </div>
                  <h4 style={{ color: "#90caf9" }}>Transaction History</h4>
                  <div className="transactions-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Transaction Ref</th>
                          <th>Amount Sent</th>
                          <th>Payer Email</th>
                          <th>Status</th>
                          <th>Created At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.length > 0 ? (
                          filteredTransactions.map((transaction) => (
                            <tr key={transaction.id}>
                              <td>{transaction.transaction_hash}</td>
                              <td>{transaction.total_amount} sol</td>
                              <td>{transaction.payer_email}</td>
                              <td>{transaction.status}</td>
                              <td>
                                {new Date(
                                  transaction.created_at
                                ).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" style={{ textAlign: "center" }}>
                              No transactions available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>


                <div className="transactions-container2">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <Search style={{ marginRight: "10px", color: "#90caf9" }} />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      style={{
                        padding: "5px",
                        width: "250px",
                        borderRadius: "5px",
                        border: "1px solid #fff",
                        backgroundColor: "#1e1e2e",
                        color: "#fff",
                      }}
                    />
                    <h3>{filteredTransactions.length}</h3>
                  </div>
                  <h4 style={{ color: "#90caf9" }}>Transaction History</h4>
                  <div className="transactions-table2">
                    <table>
                      <thead>
                        <tr>
                          <th>Payer Email</th>
                          <th>Amount Sent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.length > 0 ? (
                          filteredTransactions.map((transaction) => (
                            <tr key={transaction.id}>
                              <td>{transaction.payer_email}</td>
                              <td>{transaction.total_amount} sol</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" style={{ textAlign: "center" }}>
                              No transactions available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { ManageEvents };
