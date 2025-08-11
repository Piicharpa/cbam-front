import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  Tooltip,
  useTheme,
  alpha,
  Fade,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate, useLocation } from "react-router-dom";
import { useToken } from "../utils/localStorage";
import { fetchCompanyData,type CompanyType } from "../utils/company";

// Define the navigation items
const navItems = [
  {
    label: "หน้าหลัก",
    path: "/Home",
    icon: <HomeIcon fontSize="medium" />,
    tooltip: "Dashboard",
  },
];

interface NavigationPropProps {
  children: React.ReactNode;
}

const NavigationProp: React.FC<NavigationPropProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useToken()
  const theme = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyType>();
  

  // Handle scroll effect
  
  
  useEffect(() => {
    if (token?.company?.[0]?.company_id) {
    fetchCompanyData(token?.token,token?.company?.[0]?.company_id).then(setCompanyData);
  }
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    setMounted(true); // For animations
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle navigation
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleCreateNewReport = () => {
    const cbamKeys = [
      "reportId",
      "cbamFormData",
      "amountFormData",
      "goodsFormData",
      "precursorData",
      "precursorId",
      "selectedCnCode",
      "selectedGoods",
      "selectedIndustry",
      "activeTable",
      "selectedCctvIds",
      "selectedNodeIds",
      "searchFilters",
    ];

    cbamKeys.forEach((key) => localStorage.removeItem(key));

    // Navigate to form
    handleNavigation("/cbam/formdev");
  };

  return (
    <>
      <Fade in={mounted} timeout={500}>
        <AppBar
          position="sticky"
          color="transparent"
          elevation={0}
          sx={{
            backdropFilter: scrolled ? "blur(10px)" : "none",
            background: scrolled
              ? `linear-gradient(135deg, ${alpha(
                  theme.palette.background.paper,
                  0.9
                )}, ${alpha(theme.palette.background.paper, 0.7)})`
              : "transparent",
            borderRadius: scrolled ? 0 : "0 0 24px 24px",
            borderBottom: `1px solid ${alpha(
              theme.palette.divider,
              scrolled ? 0.1 : 0
            )}`,
            mb: 3,
          }}
        >
          <Toolbar sx={{ py: 5 }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              width="100%"
              px={8}
            >
              {/* Logo and Brand Section */}
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    transition: "transform 0.3s ease",
                    "&:hover": {
                      transform: "rotate(5deg) scale(1.05)",
                    },
                  }}
                ></Box>

                <Box>
                  <Typography
                    fontSize="32px"
                    variant="h3"
                    component="div"
                    sx={{
                      fontWeight: 700,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    CBAM Declaration
                  </Typography>
                  <Typography
                    fontSize="16px"
                    variant="caption"
                    component="div"
                    sx={{
                      opacity: 0.7,
                      letterSpacing: 0.5,
                    }}
                  >
                    Company Name : {companyData?.name}
                  </Typography>
                  <Typography
                    fontSize="16px"
                    variant="caption"
                    component="div"
                    sx={{
                      opacity: 0.7,
                      letterSpacing: 0.5,
                    }}
                  >
                    Address : {companyData?.address},{" "}
                    {companyData?.subdistrict_name},{" "}
                    {companyData?.district_name}, {companyData?.province_name},{" "}
                    {companyData?.zipcode} เบอร์โทรศัพท์:{" "}
                    {companyData?.contact_no}
                  </Typography>
                </Box>
              </Box>

              {/* Navigation Items */}
              <Box display="flex" alignItems="center" gap={3}>
                {navItems.map((item) => (
                  <Tooltip title={item.tooltip} arrow key={item.path}>
                    <Button
                      onClick={() => handleNavigation(item.path)}
                      variant={
                        location.pathname === item.path ? "contained" : "text"
                      }
                      startIcon={item.icon}
                      sx={{
                        bgcolor:
                          location.pathname === item.path
                            ? alpha(theme.palette.primary.main, 0.1)
                            : "transparent",
                        color:
                          location.pathname === item.path
                            ? theme.palette.primary.main
                            : theme.palette.text.secondary,
                        fontWeight: 500,
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        textTransform: "none",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      <Typography variant="button">{item.label}</Typography>
                    </Button>
                  </Tooltip>
                ))}

                <Box
                  component="span"
                  sx={{
                    height: 24,
                    borderLeft: `1px solid ${alpha(
                      theme.palette.divider,
                      0.3
                    )}`,
                    mx: 1,
                  }}
                />

                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleCreateNewReport} // ← เปลี่ยนเป็นนี้
                  sx={{
                    borderRadius: "12px",
                    px: 2.5,
                    py: 1,
                    textTransform: "none",
                    fontWeight: 600,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    boxShadow: `0 4px 10px ${alpha(
                      theme.palette.primary.main,
                      0.3
                    )}`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: `0 6px 15px ${alpha(
                        theme.palette.primary.main,
                        0.4
                      )}`,
                      transform: "translateY(-2px)",
                    },
                    "&:active": {
                      transform: "translateY(0)",
                    },
                  }}
                >
                  New Report
                </Button>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>
      </Fade>

      {/* Page Content */}
      <Fade in={mounted} timeout={800}>
        <Box sx={{ px: { xs: 2, md: 4 } }}>
          {/* Main Content with Animation */}
          <Fade in={mounted} timeout={1200}>
            <Box>
              <main>{children}</main>
            </Box>
          </Fade>

          {/* Footer */}
          <Box
            component="footer"
            sx={{
              mt: 8,
              mb: 4,
              pt: 3,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              © {new Date().getFullYear()} CBAM Portal. All rights reserved.
            </Typography>
          </Box>
        </Box>
      </Fade>
    </>
  );
};

export default NavigationProp;
