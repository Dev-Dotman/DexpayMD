import React, { useState, useEffect, useContext } from "react";
import { Line } from "react-chartjs-2";
import { styled } from "@mui/system";
import { Sidebar } from "./SmallerComps/Sidebar";
import "./Dashboard.css";
import IpAddress from "../Config/IpAddress";
import {
  Box,
  CssBaseline,
  Paper,
  Card,
  CardContent,
  Typography,
  Avatar,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useLocation, useNavigate } from "react-router-dom";
import { Select, FormControl, InputLabel } from "@mui/material";
import {
  CalendarMonth,
  Details,
  EventBusy,
  EventBusyOutlined,
  EventNoteOutlined,
  GolfCourseOutlined,
  Info,
  Money,
  Receipt,
} from "@mui/icons-material";
import { fetchWithAuth } from "../Services/fetchHelper";
import { AuthContext } from "../Contexts/AuthProvider";

const supportedCurrencies = ["SOL"];
function Dashboard({ navigation }) {
  const location = useLocation();
  // const { user } = location.state || { user: {} };
  const { user, cryptoRates, handleCryptoChange } = useContext(AuthContext);
  const [filter, setFilter] = useState("R.T.D");
  const ip = IpAddress.ip;
  const [err, setErr] = useState("");
  const [paymentLinks, setPaymentLinks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [currency, setCurrency] = useState(supportedCurrencies[0]);
  const [revenueData, setRevenueData] = useState({
    labels: [],
    datasets: [],
  });
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const [isMobileFiltersVisible, setIsMobileFiltersVisible] = useState(false);
  const [imageSrc, setImageSrc] = useState("");

  const amountFiat = handleCryptoChange(totalRevenue);

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
    const fetchImage = async () => {
      try {
        const response = await fetchWithAuth(`${ip}/get-image`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imagePath: user.imagePath }),
        });

        if (response.ok) {
          const imageBlob = await response.blob();
          const imageObjectURL = URL.createObjectURL(imageBlob);
          setImageSrc(imageObjectURL);
        } else {
          console.error("Failed to fetch image:", response.statusText);
          setErr("Failed to fetch image");
        }
      } catch (error) {
        console.error("Error fetching image:", error);
        setErr("Error fetching image");
      }
    };

    fetchImage();
  }, [ip, user.imagePath]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetchWithAuth(
          `${ip}/notifications?email=${user.email}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: user.email }), // Ensure correct format
          }
        );
        const data = await response.json();
        if (response.ok) {
          setNotifications(data.notifications);
          fetchPaymentLinks(user.id);
        } else {
          setErr(data.error);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setErr("Failed to load notifications");
      }
    };

    fetchNotifications();
  }, [user.email, ip]);

  const markAsRead = async (notificationIds) => {
    try {
      const response = await fetchWithAuth(`${ip}/notifications/read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: notificationIds }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log(data.message);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const handleNotificationsClick = (event) => {
    setAnchorEl(event.currentTarget);
    const notificationIds = notifications.map(
      (notification) => notification.id
    );
    markAsRead(notificationIds);
  };

  const handleNotificationsClose = () => {
    setAnchorEl(null);
  };

  const handleFilterChange = (event) => {
    setFilter(event);
  };

  const toggleMobileFiltersVisibility = () => {
    setIsMobileFiltersVisible((prevVisible) => !prevVisible);
  };

  return (
    <>
      <CssBaseline />
      <Box className="dashboard-container">
        <Sidebar />
        <div className="dashboard">
          <div className="dashboard-header">
            <div className="header-right">
              <IconButton
                color="inherit"
                onClick={handleNotificationsClick}
                style={{
                  backgroundColor: "#ff9900",
                }}
              >
                <Badge badgeContent={notifications.length} color="warning">
                  <NotificationsIcon sx={{ color: "#031d1a" }} />
                </Badge>
              </IconButton>
              <Avatar src={imageSrc} className="profile-avatar" />
              <Typography
                variant="h6"
                className="user-greeting"
                sx={{
                  marginRight: "10px",
                  marginLeft: "10px",
                }}
              >
                {user.nickname}
              </Typography>
            </div>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleNotificationsClose}
            >
              {notifications.map((notification, index) => (
                <MenuItem key={index} onClick={handleNotificationsClose}>
                  <p>{notification.message}</p>
                  <p
                    style={{
                      color: !notification.read ? "green" : "rgba(0,0,0,0.2)",
                      marginLeft: "10px",
                    }}
                  >
                    {notification.read ? "Read" : "Unread"}
                  </p>
                </MenuItem>
              ))}
            </Menu>
          </div>
          <div>
            <div
              style={{
                height: "300px",
                backgroundColor: "#1e1e2e",
                border: "2px solid #1e1e2e",
                borderRadius: 10,
                display: "flex",
                justifyContent: "space-between",
                padding: 20,
              }}
              className="shortcut"
            >
              <div
                style={{
                  width: "auto",
                  backgroundColor: "transparent",
                  borderRadius: 10,
                  padding: "20px",
                  display: "flex",
                }}
              >
                <div
                  style={{
                    width: "250px",
                    height: "200px",
                    margin: "10px",
                    backgroundColor: "rgba(0,0,0,0.4)",
                    borderRadius: 10,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px",
                  }}
                  onClick={() => navigate("createevent")}
                >
                  <div
                    style={{
                      fontSize: "50px",
                      color: "white",
                      marginBottom: "10px",
                      cursor: "pointer",
                    }}
                  >
                    ➕
                  </div>
                  <div
                    style={{
                      color: "white",
                      fontSize: "18px",
                      textAlign: "center",
                    }}
                  >
                    New payment link
                  </div>
                </div>
                {paymentLinks
                  .slice(-4)
                  .reverse()
                  .map((link, index) => (
                    <div
                      key={index}
                      style={{
                        margin: "10px",
                        padding: "10px",
                        border: "1px solid #90caf9",
                        borderRadius: "5px",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        color: "white",
                        height: "200px",
                        width: "250px",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onClick={() => navigate("manageevent")}
                    >
                      <h4
                        style={{
                          color: "#50fa7b",
                        }}
                      >
                        {link.link_name}
                      </h4>
                      <h5>{link.description}</h5>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="transactions-container">
            <h4 style={{ color: "#90caf9" }}>Latest Transactions</h4>
            <div className="transactions-table">
              <table>
                <thead>
                  <tr>
                    <th>Transaction Hash</th>
                    <th>Amount Sent</th>
                    <th>Payer Email</th>
                    <th>module</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>
                          {transaction.transaction_hash
                            ? transaction.transaction_hash.substring(
                                0,
                                window.innerWidth <= 768 ? 20 : 30
                              )
                            : ""}
                          ....
                        </td>
                        <td>{transaction.amount} sol</td>
                        <td>{transaction.payer_email}</td>
                        <td>{transaction.payment_link_name}</td>
                        <td>
                          {new Date(transaction.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center" }}>
                        No transactions
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

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
                    <MenuItem value="R.T.D">Retro Dynamic</MenuItem>
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
            <div className="overview">
              <div className="total-revenue">
                <h4 style={{ color: "#90caf9" }}>
                  Total revenue <span>( Sol ) </span>
                </h4>

                <h1 style={{ color: "#90caf9" }}>
                  {totalRevenue? totalRevenue.toFixed(6) : 0} <Money />
                </h1>
                <h5 style={{ color: "#90caf9" }}>
                  Currently valued at {amountFiat} naira
                </h5>
              </div>
              {/* <div
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
              </div> */}
              <h4 style={{ color: "#90caf9" }}>
                {/* Wallet balance <span>( Sol ) </span> */}
                NB: All payments are made to your solana wallet address
              </h4>
            </div>
          </div>

          <div className="transactions-container2">
            <div className="transactions-table2">
              <h4 style={{ color: "#90caf9" }}>Latest Transactions</h4>
              <table>
                <thead>
                  <tr>
                    <th>Payer Email</th>
                    <th>module</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>{transaction.payer_email}</td>
                        <td>{transaction.payment_link_name}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center" }}>
                        No transactions
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Box>
    </>
  );
}

export default Dashboard;
