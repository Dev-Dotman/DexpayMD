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
import { fetchWithAuth } from '../Services/fetchHelper'
import { AuthContext } from '../Contexts/AuthProvider';

const DashboardContainer = styled(Box)({
  display: "flex",
  height: "100vh",
});

const ContentContainer = styled(Box)({
  flexGrow: 1,
  padding: "20px",
});

const EventSection = styled(Paper)({
  padding: "20px",
  marginBottom: "20px",
});

function Dashboard() {
  const location = useLocation();
  // const { user } = location.state || { user: {} };
  const { user } = useContext(AuthContext);
  const [filter, setFilter] = useState("7d");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [courses, setCourses] = useState([]);
  const ip = IpAddress.ip;
  const [events, setEvents] = useState([]);
  const [err, setErr] = useState("");
  const [paymentDetails, setPaymentDetails] = useState({
    accountNumber: "**** 3456 (USD)",
    revenue: 54294,
    currency: "USD",
  });
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const [revenueData, setRevenueData] = useState({
    labels: Array(7)
      .fill("")
      .map((_, index) => `Day ${index + 1}`),
    datasets: [
      {
        label: "Revenue",
        data: Array(7).fill(0),
        borderColor: "#031d1a88",
        backgroundColor: "#031d1a", // Fill color under the line
        fill: true, // Fill the area under the line
        pointBackgroundColor: "#031d1a", // Point color
        pointBorderColor: "#031d1a", // Point border color
        pointHoverBackgroundColor: "rgba(75, 192, 192, 1)", // Point hover background color
        pointHoverBorderColor: "rgba(220, 220, 220, 1)",
      },
    ],
  });
  const [isMobileFiltersVisible, setIsMobileFiltersVisible] = useState(false);
  const [imageSrc, setImageSrc] = useState("");
  const [imageSrc2, setImageSrc2] = useState("");

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

  const fetchImage = async (imagePath) => {
    try {
      const response = await fetchWithAuth(`${ip}/get-image2`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imagePath }),
      });

      if (response.ok) {
        const imageBlob = await response.blob();
        return URL.createObjectURL(imageBlob);
      } else {
        console.error("Failed to fetch image:", response.statusText);
        setErr("Failed to fetch image");
        return null;
      }
    } catch (error) {
      console.error("Error fetching image:", error);
      setErr("Error fetching image");
      return null;
    }
  };

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

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetchWithAuth(`${ip}/myevents`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userEmail: user.email }), // Ensure correct format
        });

        const contentType = response.headers.get("content-type");

        if (contentType && contentType.indexOf("application/json") !== -1) {
          const data = await response.json();
          console.log("Response Data:", data); // Log the JSON data

          const sortedEvents = data.events.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setEvents(sortedEvents.slice(0, 3));
        } else {
          const text = await response.text(); // Get raw response text
          console.error("Non-JSON response:", text); // Log the non-JSON response
          setErr("Received non-JSON response from server");
          setEvents([]); // Ensure events is set to an empty array on error
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setErr("Failed to load events");
        setEvents([]); // Ensure events is set to an empty array on error
      }
    };

    fetchEvents();
  }, [ip, user.email]);

  useEffect(() => {
    fetchCoursesData(filter);
  }, [filter]);

  const fetchCoursesData = (filter) => {
    // Fetch courses data based on filter
    // Replace with your API call
    setCourses([
      { id: 1, name: "Course 1", students: 120 },
      { id: 2, name: "Course 2", students: 95 },
    ]);
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
        const transactions = data.transactions;

        let labels = [];
        let revenueValues = [];
        let totalRevenue = 0;

        if (transactions.length === 0) {
          // If transactions array is empty, use default values
          switch (filter) {
            case "24h":
              labels = Array(24)
                .fill("")
                .map((_, index) => `${index}:00`);
              revenueValues = Array(24).fill(0);
              break;
            case "7d":
              labels = Array(7)
                .fill("")
                .map((_, index) => `Day ${index + 1}`);
              revenueValues = Array(7).fill(0);
              break;
            case "30d":
              labels = Array(30)
                .fill("")
                .map((_, index) => `Day ${index + 1}`);
              revenueValues = Array(30).fill(0);
              break;
            case "365d":
              labels = Array(12)
                .fill("")
                .map((_, index) => `Month ${index + 1}`);
              revenueValues = Array(12).fill(0);
              break;
            case "all":
              labels = ["Year 1"];
              revenueValues = [0];
              break;
            default:
              break;
          }
        } else {
          const now = new Date();
          switch (filter) {
            case "24h":
              labels = Array(24)
                .fill("")
                .map((_, index) => `${index}:00`);
              revenueValues = Array(24).fill(0);
              transactions.forEach((transaction) => {
                const date = new Date(transaction.date);
                if (now - date <= 24 * 60 * 60 * 1000) {
                  const hour = date.getHours();
                  revenueValues[hour] += transaction.amount;
                }
              });
              totalRevenue = revenueValues.reduce((acc, curr) => acc + curr, 0);
              break;

            case "7d":
              labels = Array(7)
                .fill("")
                .map((_, index) => `Day ${index + 1}`);
              revenueValues = Array(7).fill(0);
              transactions.forEach((transaction) => {
                const date = new Date(transaction.date);
                if (now - date <= 7 * 24 * 60 * 60 * 1000) {
                  const day = Math.floor((now - date) / (24 * 60 * 60 * 1000));
                  revenueValues[6 - day] += transaction.amount;
                }
              });
              totalRevenue = revenueValues.reduce((acc, curr) => acc + curr, 0);
              break;

            case "30d":
              labels = Array(30)
                .fill("")
                .map((_, index) => `Day ${index + 1}`);
              revenueValues = Array(30).fill(0);
              transactions.forEach((transaction) => {
                const date = new Date(transaction.date);
                if (now - date <= 30 * 24 * 60 * 60 * 1000) {
                  const day = Math.floor((now - date) / (24 * 60 * 60 * 1000));
                  revenueValues[29 - day] += transaction.amount;
                }
              });
              totalRevenue = revenueValues.reduce((acc, curr) => acc + curr, 0);
              break;

            case "365d":
              labels = Array(12)
                .fill("")
                .map((_, index) => `Month ${index + 1}`);
              revenueValues = Array(12).fill(0);
              transactions.forEach((transaction) => {
                const date = new Date(transaction.date);
                if (now - date <= 365 * 24 * 60 * 60 * 1000) {
                  const month = date.getMonth();
                  revenueValues[month] += transaction.amount;
                }
              });
              totalRevenue = revenueValues.reduce((acc, curr) => acc + curr, 0);
              break;

            case "all":
              const years = new Set(
                transactions.map((t) => new Date(t.date).getFullYear())
              );
              labels = Array.from(years)
                .sort()
                .map((year) => year.toString());
              revenueValues = Array(years.size).fill(0);
              transactions.forEach((transaction) => {
                const date = new Date(transaction.date);
                const year = date.getFullYear();
                const index = labels.indexOf(year.toString());
                revenueValues[index] += transaction.amount;
              });
              totalRevenue = revenueValues.reduce((acc, curr) => acc + curr, 0);
              break;

            default:
              break;
          }
        }

        setTotalRevenue(totalRevenue);
        setRevenueData({
          labels,
          datasets: [
            {
              label: "Revenue",
              data: revenueValues,
              borderColor: "#031d1a88",
              backgroundColor: "#031d1a", // Fill color under the line
              fill: true, // Fill the area under the line
              pointBackgroundColor: "#031d1a", // Point color
              pointBorderColor: "#031d1a", // Point border color
              pointHoverBackgroundColor: "rgba(75, 192, 192, 1)", // Point hover background color
              pointHoverBorderColor: "rgba(220, 220, 220, 1)", // Point hover border color
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching revenue:", error);
      }
    };

    fetchRevenue();
  }, [user.email, filter, ip]);

  const options = {
    scales: {
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.1)", // Change the grid line color for x-axis
        },
        ticks: {
          color: "#031d1a", // Change the x-axis label color
        },
      },
      y: {
        grid: {
          color: "rgba(0, 0, 0, 0.1)", // Change the grid line color for y-axis
        },
        ticks: {
          color: "#031d1a", // Change the y-axis label color
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "#031d1a", // Change the legend label color
        },
      },
      title: {
        display: true,
        text: "Revenue Over Time",
        color: "#031d1a", // Change the title color
      },
    },
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
                Hello, {user.nickname}
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

          <div className="dashboard-main">
            <div className="chart-container">
              <div className="header-left">
                <FormControl variant="outlined" style={{ minWidth: 120 }}>
                  <Select
                    labelId="filter-label"
                    value={filter}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="filterLabel"
                    style={{
                      
                    }}
                  >
                    <MenuItem value="24h" onClick={() => setFilter("24h")}>
                      24 Hours
                    </MenuItem>
                    <MenuItem value="7d">7 Days</MenuItem>
                    <MenuItem value="30d">30 Days</MenuItem>
                    <MenuItem value="365d">365 Days</MenuItem>
                    <MenuItem value="all">All Time</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <Line data={revenueData} options={options} className="lineChart"/>
              <h4 style={{ color: "rgba(0, 0, 0, 0.3)" }}>Revenue Generated</h4>
              <Divider />
            </div>
            <div className="overview">
              <div className="total-revenue">
                <h4 style={{ color: "#031d1a" }}>
                  Total Revenue <span>( NGN ) </span>
                </h4>
                <h1 style={{ color: "#031d1a" }}>
                  {`${totalRevenue}`} <Money />
                </h1>
              </div>
              <div
                className="payment-details"
                style={{
                  backgroundColor: "white",
                  color: "#031d1a",
                  boxShadow: "0 0 2px #031d1a",
                }}
              >
                <h4
                  style={{
                    color: "#031d1a",
                  }}
                >
                  Payment Details{"  "}
                  <Info
                    sx={{
                      fontSize: "13px",
                    }}
                  />
                </h4>
                <p style={{ color: "#031d1a", fontWeight: "600" }}>
                  {user.BankAccountName}
                </p>
                <p
                  style={{ color: "#031d1a", fontWeight: "600" }}
                >{`Bank: ${user.BankName}`}</p>
                <p
                  style={{ color: "#031d1a", fontWeight: "600" }}
                >{`Acc No: ${user.BankAccountNo}`}</p>
              </div>
            </div>
          </div>

          <div className="dashboard-bottom-container">
            <div className="courses-section">
              <div className="courses-list">
                <Typography
                  variant="h6"
                  align="center"
                  sx={{ color: "#031d1a" }}
                >
                  Recent modules <CalendarMonth />
                </Typography>
                <Divider />

                <Box className="events-grid">
                  {events.length > 0 ? (
                    events.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        fetchImage={fetchImage}
                        navigate={navigate}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" align="center">
                      <GolfCourseOutlined
                        sx={{
                          fontSize: "100px",
                          color: "#ff990059",
                          marginTop: "20px",
                        }}
                      />
                    </Typography>
                  )}
                </Box>
              </div>
            </div>
          </div>
        </div>
      </Box>
    </>
  );
}

const EventCard = ({ event, fetchImage, navigate }) => {
  const [imageSrc2, setImageSrc2] = useState(null);

  useEffect(() => {
    if (event.coverPhoto) {
      const loadImage = async () => {
        const src = await fetchImage(event.coverPhoto);
        setImageSrc2(src);
      };
      loadImage();
    }
  }, [event.coverPhoto, fetchImage]);

  return (
    <Card
      key={event.id}
      className="event-card"
      sx={{
        width: "400px",
        borderRadius: "10px",
        overflow: "hidden",
        height: "180px",
      }}
    >
      <Box
        className="event-card-content"
        sx={{
          display: "block",
          height: "180px",
        }}
      >
        <img
          src={imageSrc2}
          alt="Event"
          className="event-image"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            left: 0,
            top: 0,
            zIndex: 0,
            borderRadius: "none",
            display: { xs: "none", md: "block" },
          }}
        />
        <CardContent
          className="event-details"
          sx={{
            zIndex: 10,
            position: "absolute",
            top: 0,
            width: "100%",
            backdropFilter: "blur(5px)",
            height: "100%",
            borderRadius: "none",
            backgroundColor: "#031d1a88",
            left: 0,
            color: "white",
          }}
        >
          <Typography variant="h6" className="small-text">
            {event.courseTitle}
          </Typography>
          <Typography variant="body2" className="small-text">
            Creator: {event.creator}
          </Typography>
          <Typography variant="body2" className="small-text">
            Creator email: {event.creatorEmail}
          </Typography>
          <Typography
            variant="body2"
            className="small-text"
            sx={{
              color: "#ff9800",
            }}
          >
            Course ID: {event.id}
          </Typography>
        </CardContent>
      </Box>
    </Card>
  );
};

export default Dashboard;
