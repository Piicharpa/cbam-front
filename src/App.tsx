// src/App.tsx
import React from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
  Paper,
  alpha,
} from "@mui/material";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import NavigationProp from "./components/NavigationProp";
import Formdev from "./pages/Formdev"; // Make sure the import name matches the component
import Report from "./pages/Report";

// Define a custom theme based on your color palette
const theme = createTheme({
  typography: {
    fontFamily: "'Poppins', 'Inter', 'Segoe UI', sans-serif",
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  palette: {
    primary: {
      main: "#0190c3",
      light: "#07b8dd",
      dark: "#0290c4",
    },
    secondary: {
      main: "#74aa15",
      light: "#f3f7e7",
      dark: "#6aaa33",
    },
    error: {
      main: "#c72121",
    },
    warning: {
      main: "#eb810f",
    },
    success: {
      main: "#6aaa33",
    },
    background: {
      default: "#f8f9fa",
      paper: "#ffffff",
    },
    text: {
      primary: "#313837",
      secondary: "#6f6f6f",
    },
    grey: {
      200: "#f7f7f7",
      300: "#d5d5d5",
      400: "#939393",
      500: "#5f5f5f",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "10px 20px",
          boxShadow: "0 4px 10px rgba(1, 144, 195, 0.15)",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 6px 12px rgba(1, 144, 195, 0.25)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.06)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: `radial-gradient(#e7f9cd 0.5px, transparent 0.5px), radial-gradient(#e7f9cd 0.5px, #f8f9fa 0.5px)`,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 10px 10px",
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          minWidth: "100vh",
          pb: 6,
          pt: 2,
          px: { xs: 2, sm: 3, md: 4 },
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(
              "#07b8dd",
              0.1
            )} 0%, rgba(255,255,255,0) 70%)`,
            zIndex: 0,
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(
              "#e7f9cd",
              0.6
            )} 0%, rgba(255,255,255,0) 70%)`,
            zIndex: 0,
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
          {/* Top wave decoration */}
          <Box
            component="svg"
            viewBox="0 0 1440 120"
            sx={{
              position: "absolute",
              top: -20,
              left: -20,
              right: -20,
              zIndex: -1,
              opacity: 0.4,
              pointerEvents: "none",
            }}
          >
            <path
              fill="#0190c3"
              d="M0,32L60,42.7C120,53,240,75,360,85.3C480,96,600,96,720,80C840,64,960,32,1080,21.3C1200,11,1320,21,1380,26.7L1440,32L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
            />
          </Box>

          {/* Header Component */}
          <Paper
            elevation={0}
            sx={{
              flexGrow: 1, // ขยายให้เต็มพื้นที่ที่เหลือ
              p: 2,
              mb: 4,
              background: "linear-gradient(to right, #f3f7e7, #e7f9cd)",
              borderLeft: "6px solid #74aa15",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Header
              companyName="บริษัท เอบีซี จำกัด"
              userStatus="Welcome to CBAM System!"
            />
          </Paper>
          {/* Main Content */}

          {/* Content Container with glass effect */}
          <Paper
            elevation={2}
            sx={{
              borderRadius: 3,
              minHeight: "500px",
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(8px)",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "5px",
                background: "linear-gradient(90deg, #0190c3, #07b8dd)",
              },
            }}
          >
            <NavigationProp>
              {/* Routes Container */}
              <Box
                sx={{
                  p: { xs: 2, sm: 3, md: 4 },
                  minHeight: "500px",
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <Routes>
                  <Route path="/" element={<Navigate to="/Home" replace />} />
                  <Route path="/Home" element={<Dashboard />} />

                  {/* Fix the Form route */}
                  <Route
                    path="/Form"
                    element={<Navigate to="/cbam/formdev" replace />}
                  />

                  {/* Add the proper CBAM form routes */}
                  <Route path="/cbam/formdev" element={<Formdev />} />
                  <Route
                    path="/cbam/cbam/formdev"
                    element={
                      <Navigate
                        to={`/cbam/formdev${window.location.search}`}
                        replace
                      />
                    }
                  />

                  <Route path="/Report" element={<Report />} />
                  {/* Add a route for reports with IDs */}
                  <Route path="/cbam/report" element={<Report />} />

                  <Route
                    path="*"
                    element={
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          minHeight: "400px",
                          textAlign: "center",
                        }}
                      >
                        <Box
                          component="img"
                          src="/404.svg" // Add a 404 image to your public folder
                          alt="Page not found"
                          sx={{
                            width: "100%",
                            maxWidth: "300px",
                            mb: 3,
                          }}
                        />
                        <h2 style={{ color: theme.palette.text.primary }}>
                          Page Not Found
                        </h2>
                        <p style={{ color: theme.palette.text.secondary }}>
                          The page you're looking for doesn't exist or has been
                          moved.
                        </p>
                      </Box>
                    }
                  />
                </Routes>
              </Box>

              {/* Decorative elements */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: -10,
                  right: -10,
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${alpha(
                    "#f3f7e7",
                    0.5
                  )} 0%, rgba(255,255,255,0) 70%)`,
                  zIndex: 1,
                  pointerEvents: "none",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: "30%",
                  left: -20,
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${alpha(
                    "#0190c3",
                    0.07
                  )} 0%, rgba(255,255,255,0) 70%)`,
                  zIndex: 1,
                  pointerEvents: "none",
                }}
              />
            </NavigationProp>
          </Paper>

          {/* Footer with version info */}
          <Box
            sx={{
              mt: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "success.main",
                  animation: "pulse 2s infinite",
                  "@keyframes pulse": {
                    "0%": {
                      boxShadow: `0 0 0 0 ${alpha(
                        theme.palette.success.main,
                        0.7
                      )}`,
                    },
                    "70%": {
                      boxShadow: `0 0 0 6px ${alpha(
                        theme.palette.success.main,
                        0
                      )}`,
                    },
                    "100%": {
                      boxShadow: `0 0 0 0 ${alpha(
                        theme.palette.success.main,
                        0
                      )}`,
                    },
                  },
                }}
              />
              <Box
                component="span"
                sx={{ fontSize: "0.75rem", color: "text.secondary" }}
              >
                System Online
              </Box>
            </Box>

            <Box
              component="span"
              sx={{ fontSize: "0.75rem", color: "text.secondary" }}
            >
              CBAM System v1.0.0 •{" "}
              <Box component="span" sx={{ color: "primary.main" }}>
                The Greenhouse Organization (TGO)
              </Box>
            </Box>
          </Box>
        </Container>

        {/* Bottom wave decoration */}
        <Box
          component="svg"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          sx={{
            position: "absolute",
            bottom: -1,
            left: 0,
            right: 0,
            zIndex: -1,
            width: "100%",
            height: "120px",
            opacity: 0.4,
            pointerEvents: "none",
          }}
        >
          <path
            fill="#74aa15"
            d="M0,64L60,69.3C120,75,240,85,360,80C480,75,600,53,720,42.7C840,32,960,32,1080,48C1200,64,1320,96,1380,112L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
