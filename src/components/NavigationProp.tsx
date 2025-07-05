import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Collapse,
  Badge,
  Avatar,
  Fade,
  Grow,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import AddIcon from "@mui/icons-material/Add";
import NotificationsIcon from "@mui/icons-material/Notifications";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useNavigate, useLocation } from "react-router-dom";

// Define the navigation items
const navItems = [
  {
    label: "หน้าหลัก",
    path: "/Home",
    icon: <HomeIcon fontSize="small" />,
    tooltip: "Dashboard",
  }
];

interface NavigationPropProps {
  children: React.ReactNode;
}

const NavigationProp: React.FC<NavigationPropProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [notificationCount, setNotificationCount] = useState(2);
  const [mounted, setMounted] = useState(false);

  // Handle scroll effect
  useEffect(() => {
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
              ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`
              : "transparent",
            // transition: "all 0.3s ease",
            borderRadius: scrolled ? 0 : "0 0 24px 24px",
            // boxShadow: scrolled 
            //   ? `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`
            //   : "none",
            borderBottom: `1px solid ${alpha(theme.palette.divider, scrolled ? 0.1 : 0)}`,
            mb: 3,
          }}
        >
          <Toolbar sx={{ py:5 }}>
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
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'rotate(5deg) scale(1.05)'
                    }
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: theme.palette.primary.main,
                      width: 40, 
                      height: 40,
                      boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                    }}
                  >
                    CBAM
                  </Avatar>
                </Box>
                
                <Box>
                  <Typography 
                    variant="h3" 
                    component="div"
                    sx={{ 
                      fontWeight: 700,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent"
                    }}
                  >
                    CBAM Declaration
                  </Typography>
                  <Typography 
                    variant="caption" 
                    component="div"
                    sx={{ 
                      opacity: 0.7,
                      letterSpacing: 0.5
                    }}
                  >
                    Complete the steps below to submit your carbon border adjustment mechanism declaration
                  </Typography>
                </Box>
              </Box>
              
              {/* Navigation Items */}
              <Box display="flex" alignItems="center" gap={3}>
                {navItems.map((item) => (
                  <Tooltip title={item.tooltip} arrow key={item.path}>
                    <Button
                      onClick={() => handleNavigation(item.path)}
                      variant={location.pathname === item.path ? "contained" : "text"}
                      startIcon={item.icon}
                      sx={{
                        bgcolor: location.pathname === item.path 
                          ? alpha(theme.palette.primary.main, 0.1) 
                          : "transparent",
                        color: location.pathname === item.path 
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
                    borderLeft: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                    mx: 1 
                  }} 
                />
                
                {/* New Report Button with Hover Effect */}
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleNavigation("/cbam/formdev")}
                  sx={{
                    borderRadius: "12px",
                    px: 2.5,
                    py: 1,
                    textTransform: "none",
                    fontWeight: 600,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
                    transition: 'all 0.3s ease',
                    "&:hover": {
                      boxShadow: `0 6px 15px ${alpha(theme.palette.primary.main, 0.4)}`,
                      transform: 'translateY(-2px)'
                    },
                    "&:active": {
                      transform: 'translateY(0)'
                    }
                  }}
                >
                  New Report
                </Button>
                
                {/* Notifications */}
                {/* <Tooltip title="Notifications">
                  <IconButton color="inherit" sx={{ ml: 1 }}>
                    <Badge badgeContent={notificationCount} color="error">
                      <NotificationsIcon color="action" />
                    </Badge>
                  </IconButton>
                </Tooltip> */}
                
                {/* User Profile */}
                {/* <Box 
                  sx={{ 
                    display: "flex",
                    alignItems: "center",
                    ml: 2,
                    p: 1,
                    borderRadius: 2,
                                        cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.divider, 0.1),
                    }
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32,
                      bgcolor: theme.palette.secondary.main,
                      color: theme.palette.secondary.contrastText,
                      fontSize: '0.875rem',
                      fontWeight: 'bold'
                    }}
                  >
                    TH
                  </Avatar>
                  <Box ml={1} display={{ xs: 'none', sm: 'block' }}>
                    <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
                      Thailand
                    </Typography>
                    <Typography variant="caption" color="text.secondary" lineHeight={1}>
                      Administrator
                    </Typography>
                  </Box>
                  <KeyboardArrowDownIcon 
                    fontSize="small" 
                    sx={{ 
                      ml: 0.5, 
                      color: theme.palette.text.secondary,
                      fontSize: '1rem'
                    }} 
                  />
                
              
            </Box> */}
            </Box>
            </Box>
          </Toolbar>
          
          {/* Secondary Navigation */}
          {/* <Collapse in={scrolled}>
            <Box 
              sx={{ 
                px: 4, 
                py: 0.5, 
                bgcolor: alpha(theme.palette.background.paper, 0.6),
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                display: 'flex',
                overflowX: 'auto',
                '&::-webkit-scrollbar': { display: 'none' }
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                Quick Access:
              </Typography>
              
              {['Dashboard', 'Reports', 'Analytics', 'Settings'].map(item => (
                <Button
                  key={item}
                  color="inherit"
                  size="small"
                  sx={{
                    minWidth: 0,
                    px: 2,
                    py: 0.5,
                    mr: 1,
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    borderRadius: '12px',
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main
                    }
                  }}
                >
                  {item}
                </Button>
              ))}
            </Box>
          </Collapse> */}
        </AppBar>
      </Fade>
      
      {/* Page Content */}
      <Fade in={mounted} timeout={800}>
        <Box sx={{ px: { xs: 2, md: 4 } }}>
          {/* Page Header */}
          {/* <Grow in={mounted} timeout={1000}>
            <Box 
              sx={{ 
                mb: 4,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2
              }}
            > */}
              {/* <Box>
                <Typography 
                  variant="h4" 
                  fontWeight={700}
                  sx={{
                    mb: 0.5,
                    backgroundImage: `linear-gradient(45deg, ${theme.palette.text.primary}, ${alpha(theme.palette.text.primary, 0.7)})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: `0px 1px 1px ${alpha(theme.palette.common.black, 0.1)}`
                  }}
                >
                 เอกสาร <strong>CBAM</strong> ส่งไป <strong>EU</strong> ล่าสุด
                </Typography>
              </Box> */}
              
              {/* <Box 
                sx={{ 
                  display: 'flex', 
                  gap: 2,
                  mt: { xs: 2, sm: 0 }
                }}
              > */}
                {/* <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    px: 2
                  }}
                >
                  Export
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="small"
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    px: 2,
                    borderColor: alpha(theme.palette.divider, 0.5),
                    color: theme.palette.text.secondary
                  }}
                >
                  More Options
                </Button> */}
              {/* </Box>
            </Box> */}
          {/* </Grow> */}
          
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
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            <Typography variant="caption" color="text.secondary">
              © {new Date().getFullYear()} CBAM Portal. All rights reserved.
            </Typography>
            
            <Box display="flex" gap={3}>
              <Typography variant="caption" color="text.secondary" sx={{ cursor: 'pointer' }}>
                Privacy Policy
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ cursor: 'pointer' }}>
                Terms of Service
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ cursor: 'pointer' }}>
                Help Center
              </Typography>
            </Box>
          </Box>
        </Box>
      </Fade>
    </>
  );
};

export default NavigationProp;