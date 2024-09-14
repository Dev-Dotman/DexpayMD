import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  CssBaseline,
  Grid,
  Typography,
  Paper,
  Card,
  CardContent,
  Autocomplete,
} from "@mui/material";
import { Sidebar } from "./Sidebar";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { useLocation } from "react-router-dom";
import "./Wallet.css";
import IpAddress from "../../Config/IpAddress";
import { fetchWithAuth } from '../../Services/fetchHelper'

const Wallet = () => {
  const location = useLocation();
  const { user } = location.state || {};
  const ip = IpAddress.ip;
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [bankAccountNo, setBankAccountNo] = useState(
    user.BankAccountNo === "None" ? "None" : user.BankAccountNo
  );
  const [bankAccountName, setBankAccountName] = useState(user?.BankAccountName);
  const [bankName, setBankName] = useState(user?.BankName);
  const [withdrawAmount, setWithdrawAmount] = useState("None");
  const [accountBalance, setAccountBalance] = useState(0); // Example balance, replace with actual balance from user data
  const [err, setErr] = useState("");
  const [showInputs, setShowInputs] = useState(true);
  const [bankcode, setBankcode] = useState(
    user.BankCode === "None" ? "000" : user.BankCode
  );
  const [notifications, setNotifications] = useState([
    "Your last transaction was successful!",
    "Your account balance has been updated.",
    "New payments received: 3",
  ]);
  const [loading, setLoading] = useState(false); // Add loading state

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const response = await fetchWithAuth(`${ip}/user/revenue`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: user.email }), // Ensure correct format
        });
        const data = await response.json();

        setTotalRevenue(data.revenue.totalRevenue);
      } catch (error) {
        console.error("Error fetching revenue:", error);
      }
    };

    fetchRevenue();
  }, [user.email]);

  const [bankList, setBankList] = useState([]);

  useEffect(() => {
    // Fetch the list of banks from your backend API
    const fetchBanks = async () => {
      try {
        const response = await fetchWithAuth(`${ip}/banks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: user.email }), // Ensure correct format
        });
        const data = await response.json();
        setBankList(data.banks);
      } catch (error) {
        console.error("Error fetching banks:", error);
      }
    };

    fetchBanks();
  }, [ip]);

  useEffect(() => {
    if (bankAccountNo.length === 10) {
      verifyAccount();
    }
  }, [bankAccountNo]);

  const verifyAccount = async () => {
    const bankCode = bankcode;
    const accountNumber = bankAccountNo;

    try {
      const response = await fetchWithAuth(`${ip}/verify-bank-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankCode, accountNumber }),
      });
      const accountInfo = await response.json();

      if (response.ok) {
        setBankAccountName(accountInfo.data.account_name);
      } else {
        setErr(accountInfo.error);
      }
    } catch (error) {
      console.error("Error verifying account:", error);
    }
  };

  const handleUpdatePaymentInfo = async (e) => {
    e.preventDefault();
    if (!bankAccountNo || !bankAccountName || !bankName) {
      setErr("Please fill in all required fields.");
      return;
    }

    storeBankDetails({
      bankName: bankName,
      bankCode: bankcode,
      bankAccountNo: bankAccountNo,
      bankAccountName: bankAccountName,
      userEmail: user.email,
    });
  };

  const storeBankDetails = async (bankDetail) => {
    setLoading(true); // Start loading
    try {
      const response = await fetchWithAuth(`${ip}/storePaymentDetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bankDetail),
      });

      if (!response.ok) {
        throw new Error("Failed to store bank details");
      }

      const data = await response.json();
      alert(data.message);
      return data;
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleWithdrawFunds = async (e) => {
    e.preventDefault();
    if (!withdrawAmount) {
      setErr("Please enter an amount to withdraw.");
      return;
    }
    // Withdraw funds logic here
    alert("Funds withdrawn.");
  };

  const handleShowInputs = () => {
    setShowInputs(!showInputs);
  };

  return (
    <>
      <CssBaseline />
      <Box
        className="wallet-container"
        sx={{
          backgroundColor: "#273532",
        }}
      >
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        )}
        <Sidebar
          data={{
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            nickname: user.nickname,
            contact: user.contact,
            imagePath: user.imagePath,
            BankName: user.BankName,
            BankAccountNo: user.BankAccountNo,
            BankAccountName: user.BankAccountName,
            BankCode: user.BankCode,
          }}
        />
        <Box
          className="wallet-content-container"
          sx={{
            backgroundColor: "white",
            borderRadius: "0px",
          }}
        >
          <Paper
            elevation={3}
            className="wallet-paper"
            align="center"
            sx={{ padding: 5 }}
          >
            <Typography variant="h4" gutterBottom align="center">
              Payment Information
            </Typography>
            {err && <p className="error-message">{err}</p>}

            <div className="dashboard-main2">
              <div className="payment-details">
                <Typography variant="h6">
                  Current Payment Information
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#031d1a !important",
                  }}
                >
                  Bank Account Number: {bankAccountNo}
                </Typography>
                <Typography
                  sx={{
                    color: "#031d1a !important",
                  }}
                >
                  Bank Account Name: {bankAccountName}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#031d1a !important",
                  }}
                >
                  Bank Name: {bankName}
                </Typography>
                <div
                  className="total-revenue"
                  style={{
                    marginTop: "30px",
                  }}
                >
                  <h3>Total Revenue (NGN)</h3>
                  <h1>{`${totalRevenue}`}</h1>
                </div>
              </div>

              <div className="actions-section" style={{ width: "100%" }}>
                <Button
                  variant="contained"
                  onClick={handleShowInputs}
                  className="wallet-button wallet-button-primary"
                  sx={{ mb: 3 }}
                  style={{ marginTop: 30 }}
                >
                  {showInputs ? "Hide" : "Update Payment Info"}
                </Button>

                {showInputs && (
                  <Grid container spacing={3} className="payment-info-grid">
                    <Grid item xs={12} md={6}>
                      <Autocomplete
                        options={bankList}
                        getOptionLabel={(option) => option.name}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Bank Name"
                            margin="normal"
                            variant="outlined"
                            fullWidth
                            required
                          />
                        )}
                        value={
                          bankList.find((bank) => bank.code === bankcode) ||
                          null
                        }
                        onChange={(event, newValue) => {
                          setBankName(newValue ? newValue.name : "");
                          setBankcode(newValue ? newValue.code : "");
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        type="number"
                        label="Bank Account Number"
                        value={bankAccountNo}
                        onChange={(e) => setBankAccountNo(e.target.value)}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        required
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Bank Account Name"
                        value={bankAccountName}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <button
                        variant="contained"
                        color="success"
                        onClick={handleUpdatePaymentInfo}
                        fullWidth
                        className="wallet-button wallet-button-primary"
                      >
                        Update Payment Information
                      </button>
                    </Grid>
                  </Grid>
                )}
              </div>
            </div>

            <Box className="notification-box" style={{ height: "300px" }}>
              <Typography variant="h6">Notifications</Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export { Wallet };
