import React from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Typography,
  useTheme,
  alpha,
  Paper,
  Tooltip,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import EditIcon from "@mui/icons-material/Edit";
import BarChartIcon from "@mui/icons-material/BarChart";

interface NavigationPropProps {
  children: React.ReactNode;
}

const NavigationProp: React.FC<NavigationPropProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const navItems = [
    {
      label: "หน้าหลัก",
      path: "/Home",
      icon: <HomeIcon fontSize="small" />,
      tooltip: "Dashboard",
    },
    {
      label: "กรอกข้อมูล CBAM",
      path: "/Form",
      icon: <EditIcon fontSize="small" />,
      tooltip: "Fill CBAM Form",
    },
    // {
    //   label: "สรุป",
    //   path: "/Report",
    //   icon: <BarChartIcon fontSize="small" />,
    //   tooltip: "View Reports",
    // },
  ];

  // Handle navigation directly
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          mb: 4,
          borderRadius: "28px",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "100%",
            background: `linear-gradient(180deg, 
              ${alpha(theme.palette.background.default, 0.1)} 0%, 
              ${alpha(theme.palette.background.default, 0)} 100%)`,
            zIndex: 1,
          },
        }}
      >
        <AppBar
          color="default"
          elevation={0}
          sx={{
            background: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: "blur(8px)",
          }}
        >
          <Toolbar sx={{ justifyContent: "center", py: 1 }}>
            <Box
              display="flex"
              gap={{ xs: "1rem", sm: "2rem", md: "3rem", lg: "6rem" }}
              alignItems="center"
              position="relative"
              zIndex={2}
            >
              {navItems.map((item) => (
                <Box key={item.path} sx={{ position: "relative" }}>
                  <Tooltip
                    title={item.tooltip}
                    arrow
                    placement="bottom"
                    enterDelay={500}
                    leaveDelay={200}
                  >
                    <span>
                      {" "}
                      {/* Use span as wrapper for tooltip */}
                      <Button
                        onClick={() => handleNavigation(item.path)}
                        variant={
                          location.pathname === item.path ? "contained" : "text"
                        }
                        startIcon={item.icon}
                        sx={{
                          fontWeight: 600,
                          fontFamily: "'Poppins', 'Roboto', sans-serif",
                          borderRadius: "20px",
                          px: 3,
                          py: 1.2,
                          color:
                            location.pathname === item.path
                              ? "#fff"
                              : theme.palette.text.primary,
                          fontSize: "0.95rem",
                          textTransform: "none",
                          transition: "all 0.3s ease",
                          background:
                            location.pathname === item.path
                              ? `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`
                              : "transparent",
                          boxShadow:
                            location.pathname === item.path
                              ? `0 4px 10px ${alpha(
                                  theme.palette.primary.main,
                                  0.4
                                )}`
                              : "none",
                          "&:hover": {
                            background:
                              location.pathname === item.path
                                ? `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`
                                : alpha(theme.palette.primary.main, 0.08),
                            transform: "translateY(-3px)",
                            boxShadow:
                              location.pathname === item.path
                                ? `0 6px 12px ${alpha(
                                    theme.palette.primary.main,
                                    0.4
                                  )}`
                                : `0 4px 8px ${alpha(
                                    theme.palette.primary.main,
                                    0.2
                                  )}`,
                          },
                        }}
                      >
                        <Typography
                          variant="button"
                          fontFamily="inherit"
                          fontWeight={600}
                        >
                          {item.label}
                        </Typography>
                      </Button>
                    </span>
                  </Tooltip>
                </Box>
              ))}
            </Box>

            {/* Decorative elements */}
            <Box
              sx={{
                position: "absolute",
                left: "5%",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: alpha(theme.palette.secondary.main, 0.6),
                boxShadow: `0 0 20px ${alpha(
                  theme.palette.secondary.main,
                  0.4
                )}`,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                right: "5%",
                width: "15px",
                height: "15px",
                borderRadius: "50%",
                background: alpha(theme.palette.primary.main, 0.6),
                boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.4)}`,
              }}
            />
          </Toolbar>
        </AppBar>
      </Paper>

      <main>{children}</main>
    </>
  );
};

export default NavigationProp;
