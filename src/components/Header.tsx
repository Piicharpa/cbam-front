import React from "react";
import { AppBar, Toolbar, Box, Typography, Button } from "@mui/material";
import { fetchCompanyData, type CompanyType } from "../utils/company";
import { useEffect, useState } from "react";
import { useToken } from "../utils/localStorage";

interface HeaderProps {
  companyName?: string;
  userStatus?: string;
}

const Header: React.FC<HeaderProps> = ({ companyName = "" }) => {
  const token = useToken();
  const [companyData, setCompanyData] = useState<CompanyType>();
  useEffect(() => {
    if (token?.company?.[0]?.company_id) {
      fetchCompanyData(token?.token, token?.company?.[0]?.company_id).then(
        setCompanyData
      );
    }
  }, []);

  return (
    <AppBar
      position="static"
      sx={{
        background: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        borderRadius: "8px",
        marginBottom: "24px",
      }}
    >
      <Toolbar
        sx={{
          padding: "16px 24px",
          justifyContent: "space-between",
          flexDirection: "column", // Stack content vertically
          alignItems: "stretch", // Stretch to full width
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between", // Space between left and right sections
            width: "100%", // Take up full width of the Toolbar
          }}
        >
          {/* Logo Section */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Box
              sx={{
                width: "48px",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={`${process.env.PUBLIC_URL}/image/favicon_cbam.png`}
                alt="TGO Logo"
                style={{
                  width: "48px",
                  height: "48px",
                  objectFit: "contain",
                }}
              />
            </Box>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  color: "#1a1a1a",
                  marginBottom: "4px",
                  fontWeight: "600",
                  fontSize: "24px",
                }}
              >
                CBAM Platform
              </Typography>
              <Typography
                sx={{
                  color: "#666666",
                  fontSize: "14px",
                  fontWeight: "400",
                }}
              >
                องค์การบริหารจัดการก๊าซเรือนกระจก (องค์การมหาชน)
              </Typography>
            </Box>
          </Box>
          {/* User Info Section */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Box sx={{ textAlign: "right" }}>
              <Typography
                sx={{
                  fontWeight: "600",
                  color: "#1a1a1a",
                  fontSize: "14",
                }}
              >
                {companyData?.name}
              </Typography>
              <Typography
                sx={{
                  color: "#666666",
                  fontSize: "0.75rem",
                }}
              ></Typography>
            </Box>
            <Button
              variant="outlined"
              onClick={() =>
                window.open("http://178.128.123.212:8080/cfp/select_cbam_cfp")
              }
              sx={{
                borderColor: "#e0e0e0",
                color: "#666666",
                backgroundColor: "white",
                padding: "8px 16px",
                fontSize: "0.875rem",
                fontWeight: "500",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                  borderColor: "#d0d0d0",
                },
              }}
            >
              กลับสู่ระบบ CFP
            </Button>
          </Box>
        </Box>
        {/* Disclaimer Section */}
        <Box sx={{ width: "100%", mt: 2, borderTop: "1px solid #e0e0e0", pt: 2 }}>
          <Typography
            sx={{
              color: "#666666",
              fontSize: "12px",
              fontWeight: "200",
              textAlign: "left", // Align text to the right
            }}
          >
            แพลตฟอร์มนี้จัดทำขึ้นเพื่อการเรียนรู้การคำนวณค่า Embedded Emission
            ภายใต้ข้อกำหนดของมาตรการการปรับภาษีคาร์บอนข้ามพรมแดนของสหภาพยุโรป (Carbon Border Adjustment Mechanism: CBAM) เท่านั้น
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;