import React, { useState, useContext } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Typography,
  IconButton,
} from "@mui/material";
import {
  Dashboard,
  Event,
  DataObject,
  Payment,
  Settings,
  LogoutOutlined,
  Close,
  Menu as MenuIcon,
  BubbleChart,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { AuthContext } from "../../Contexts/AuthProvider";

const Sidebar = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <IconButton
        className="menu-icon"
        onClick={toggleSidebar}
        sx={{
          display: { xs: "block", md: "block", lg: "none" },
          position: "fixed",
          top: "8px",
          left: "8px",
          zIndex: 2000,
          textAlign: "center",
          mixBlendMode: "difference",
        }}
      >
        {isOpen ? (
          <Close
            sx={{
              color: "white",
              fontSize: "30px",
              marginLeft: "-0px",
              position: "fixed",
              top: "8px",
              left: "8px",
              mixBlendMode: "difference",
            }}
          />
        ) : (
          <MenuIcon
            sx={{
              color: "white",
              fontSize: "40px",
              marginLeft: "-0px",
              position: "fixed",
              top: "8px",
              left: "8px",
              mixBlendMode: "difference",
            }}
          />
        )}
      </IconButton>
      <Box className={`sidebar-container ${isOpen ? "open" : ""}`}>
        <Box className="sidebar-header">
          <Typography variant="h6">
            WHATFLOW <BubbleChart sx={{ color: "white" }} />
          </Typography>
        </Box>
        <List>
          <ListItem
            button
            onClick={() => navigate("/", { state: { user: user } })}
          >
            <ListItemIcon sx={{ color: "rgba(255, 255, 255, 0.4)" }}>
              <Dashboard />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <Divider sx={{ width: "80%" }} />
          <ListItem
            button
            onClick={() => navigate("/createevent", { state: { user: user } })}
          >
            <ListItemIcon sx={{ color: "rgba(255, 255, 255, 0.4)" }}>
              <Event />
            </ListItemIcon>
            <ListItemText primary="Create Module" />
          </ListItem>
          <ListItem
            button
            onClick={() => navigate("/manageevent", { state: { user: user } })}
          >
            <ListItemIcon sx={{ color: "rgba(255, 255, 255, 0.4)" }}>
              <Event />
            </ListItemIcon>
            <ListItemText primary="Manage Modules" />
          </ListItem>
          <ListItem
            button
            onClick={() =>
              navigate("/dataAndAnalytics", { state: { user: user } })
            }
          >
            <ListItemIcon sx={{ color: "rgba(255, 255, 255, 0.4)" }}>
              <DataObject />
            </ListItemIcon>
            <ListItemText primary="Analytics and Data" />
          </ListItem>
          <ListItem
            button
            onClick={() => navigate("/wallet", { state: { user: user } })}
          >
            <ListItemIcon sx={{ color: "rgba(255, 255, 255, 0.4)" }}>
              <Payment />
            </ListItemIcon>
            <ListItemText primary="Payment Information" />
          </ListItem>
          <ListItem
            button
            onClick={() => navigate("/settings", { state: { user: user } })}
          >
            <ListItemIcon sx={{ color: "rgba(255, 255, 255, 0.4)" }}>
              <Settings />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        </List>
        <ListItem
          button
          onClick={logout}
          sx={{
            position: "absolute",
            bottom: 60,
            left: "10%",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            width: "80%",
            borderRadius: "20px",
            color: "#ff9800",
          }}
        >
          <ListItemIcon sx={{ color: "#ff9800" }}>
            <LogoutOutlined />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </Box>
    </>
  );
};

export { Sidebar };
