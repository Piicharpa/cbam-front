import React from "react";
import { AppBar, Toolbar, Button, Box, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
  
interface NavigationPropProps {
  children: React.ReactNode;
}
  
const NavigationProp: React.FC<NavigationPropProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { label: "หน้าหลัก", path: "/Home" },
    { label: "กรอกข้อมูล CBAM", path: "/Form" },
    { label: "สรุป", path: "/Report" },
  ];
  
  return (
    <>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar sx={{ justifyContent: "center" }}>
          <Box display="flex" gap="6rem">
            {navItems.map((item) => (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                variant={
                  location.pathname === item.path ? "contained" : "text"
                }
                sx={{
                  fontWeight: 600,
                  fontFamily: "'Times New Roman (serif)', 'Roboto', sans-serif",
                  borderRadius: "20px",
                  px: 3,
                  py: 1,
                  color: location.pathname === item.path ? "#fff" : "#313831",
                  fontSize: "1rem",
                  textTransform: "none", // Prevent all-caps button text
                }}
              >
                <Typography 
                  variant="button" 
                  fontFamily="'Times New Roman (serif)', 'Roboto', sans-serif"
                  fontWeight={600}
                >
                  {item.label}
                </Typography>
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      <main>{children}</main>
    </>
  );
};
  
export default NavigationProp;