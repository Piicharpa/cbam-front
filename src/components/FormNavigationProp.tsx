import React from "react";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

interface NavigationPropProps {
  children: React.ReactNode;
}

const FormNavigationProp: React.FC<NavigationPropProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Installation", path: "/Installation" },
    { label: "Verifier", path: "/Verifier" },
    { label: "Goods", path: "/Goods" },
    { label: "Precursors", path: "/Precursors" },
    { label: "Amount", path: "/Amount" },
  ];

  return (
    <>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={1}
        sx={{ backgroundColor: " #31383" }}
      >
        <Toolbar sx={{ justifyContent: "center" }}>
          <Box display="flex" gap="2rem">
            {navItems.map((item) => (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                variant={
                  location.pathname === item.path ? "contained" : "text"
                }
                sx={{
                  fontWeight: "bold",
                  borderRadius: "20px",
                  px: 5,
                  py: 1,
                  color: "#31383",
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      <main>{children}</main>
    </>
  );
};

export default FormNavigationProp;
