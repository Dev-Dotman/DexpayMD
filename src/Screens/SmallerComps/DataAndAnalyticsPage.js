import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CssBaseline,
} from "@mui/material";
import "./DataAndAnalyticsPage.css";
import { useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Line, Bar } from "react-chartjs-2";
import IpAddress from "../../Config/IpAddress"; // Import the ip directly
import { fetchWithAuth } from '../../Services/fetchHelper'

const DataAndAnalyticsPage = () => {
  const [revenueData, setRevenueData] = useState({ labels: [], datasets: [] });
  const [barChartData, setBarChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [events, setEvents] = useState([]);
  const [err, setErr] = useState("");
  const ip = IpAddress.ip;
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = location.state || {};
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    setLoading(true);

    const fetchRevenue = async () => {
      try {
        const response = await fetchWithAuth(`${ip}/user/revenue`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: user.email }), // Ensure correct format
          });
        const data = await response.json();
        const transactions = data.transactions;

        const now = new Date();
        const currentMonth = now.getMonth();
        const daysInMonth = new Date(
          now.getFullYear(),
          currentMonth + 1,
          0
        ).getDate();

        const labels = Array.from(
          { length: daysInMonth },
          (_, index) => `Day ${index + 1}`
        );
        const revenueValues = Array(daysInMonth).fill(0);

        if (transactions && transactions.length > 0) {
          transactions.forEach((transaction) => {
            const date = new Date(transaction.date);
            if (date.getMonth() === currentMonth) {
              const day = date.getDate() - 1;
              revenueValues[day] += transaction.amount;
            }
          });
        }

        setRevenueData({
          labels,
          datasets: [
            {
              label: "Revenue",
              data: revenueValues,
              borderColor: "#311d00",
              fill: false,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching revenue:", error);
      }
    };

    const fetchEventsAndTransactions = async () => {
      try {
        const eventsResponse = await fetchWithAuth(`${ip}/myevents`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userEmail: user.email }), // Ensure correct format
          });
        const eventsData = await eventsResponse.json();
        const events = eventsData.events || [];
        console.log(eventsData.events)
        const transactionsResponse = await fetchWithAuth(`${ip}/user/revenue`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: user.email }), // Ensure correct format
          });
        const transactionsData = await transactionsResponse.json();
        const transactions = transactionsData.transactions || [];

        const eventRevenueMap = {};

        events.forEach((event) => {
          eventRevenueMap[event.courseTitle] = 0;
        });

        if (transactions.length > 0) {
          transactions.forEach((transaction) => {
            const event = events.find(
              (event) => event.courseId === transaction.courseId
            );
            if (event) {
              eventRevenueMap[event.name] += transaction.amount;
            }
          });
        }

        setBarChartData({
          labels: Object.keys(eventRevenueMap),
          datasets: [
            {
              label: "Revenue by Event",
              data: Object.values(eventRevenueMap),
              backgroundColor: [
                "rgba(255, 99, 132, 0.2)",
                "rgba(54, 162, 235, 0.2)",
                "rgba(255, 206, 86, 0.2)",
                "rgba(75, 192, 192, 0.2)",
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
              ],
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching events and transactions:", error);
        setErr("Failed to load events or transactions");
      }
    };

    fetchRevenue();
    fetchEventsAndTransactions(); 
    setLoading(false);
  }, [user.email, ip]);

  const handlePrint = () => {
    window.print();
  };

  const transactions = [
    {
      id: 1,
      date: "2024-07-01",
      description: "Course Payment",
      amount: "$100",
    },
    {
      id: 2,
      date: "2024-07-02",
      description: "Subscription Payment",
      amount: "$50",
    },
    {
      id: 3,
      date: "2024-07-03",
      description: "Course Payment",
      amount: "$150",
    },
    // Add more dummy transactions here
  ];

  const accountStatement = [
    {
      id: 1,
      date: "2024-06-01",
      description: "Opening Balance",
      amount: "$1000",
    },
    {
      id: 2,
      date: "2024-06-15",
      description: "Course Payment",
      amount: "$100",
    },
    {
      id: 3,
      date: "2024-06-30",
      description: "Closing Balance",
      amount: "$1100",
    },
    // Add more dummy account statement data here
  ];

  return (
    <>
      <CssBaseline />
      <Box className="analytics-container">
      {loading && (
        <div className="loading-overlay">
          <div className="backg">
          <div className="spinner"></div>
          </div>
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
          className="data-analytics-container"
          sx={{ padding: 4, textAlign: "center" }}
        >
          <Typography variant="h4" gutterBottom align="center" sx={{
            color: 'white'
          }}>
            Data and Analytics
          </Typography>

          <Box
            className="charts-container"
            sx={{ display: "block", gap: 4, marginBottom: 4 }}
          >
            <Paper
              elevation={3}
              className="data-paper"
              sx={{ flex: 1, padding: 4, marginBottom: 10 }}
            >
              <Typography variant="h5" gutterBottom>
                Revenue Trend For The Month 
              </Typography>
              <Line data={revenueData} />
            </Paper>

            <Paper
              elevation={3}
              className="data-paper"
              sx={{ flex: 1, padding: 4 }}
            >
              <Typography variant="h5" gutterBottom>
                Revenue By Course
              </Typography>
              <Bar data={barChartData} />
            </Paper>
          </Box>

          {/* <Paper
            elevation={3}
            className="data-paper"
            sx={{ padding: 4, marginBottom: 4 }}
          >
            <Typography variant="h5" gutterBottom>
              Transactions
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button variant="contained" color="primary" sx={{ marginTop: 2 }}>
              See More
            </Button>
          </Paper>

          <Paper elevation={3} className="data-paper" sx={{ padding: 4 }}>
            <Typography variant="h5" gutterBottom>
              Account Statement
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {accountStatement.map((statement) => (
                    <TableRow key={statement.id}>
                      <TableCell>{statement.date}</TableCell>
                      <TableCell>{statement.description}</TableCell>
                      <TableCell>{statement.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button
              variant="contained"
              color="primary"
              onClick={handlePrint}
              sx={{ marginTop: 2 }}
            >
              Print
            </Button>
          </Paper> */}
        </Box>
      </Box>
    </>
  );
};

export default DataAndAnalyticsPage;
