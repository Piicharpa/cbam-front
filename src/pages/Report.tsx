import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Tab,
  Paper,
  ThemeProvider,
  createTheme,
  styled,
  alpha,
  Fade,
} from "@mui/material";
import FactoryIcon from "@mui/icons-material/Factory";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import BoltIcon from "@mui/icons-material/Bolt";
import SettingsIcon from "@mui/icons-material/Settings";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useMediaQuery } from "@mui/material";
import TabAInstallationData from "../components/reportTab/TabA_InstallationData";
import TabBEmissionInstallation from "../components/reportTab/TabB_EmissionInstallation";
import TabCEnergyEmission from "../components/reportTab/TabC_EnergyEmissions";
import TabDProcess from "../components/reportTab/TabD_Process";
import TabEPurchasedPrecursors from "../components/reportTab/TabE_PurchasedPrecursors";
import { useLocation } from "react-router-dom";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Custom theme based on provided colors
const theme = createTheme({
  palette: {
    primary: {
      main: "#0190c3",
      light: "#07b8dd",
      dark: "#0290c4",
    },
    secondary: {
      light: "#f3f7e7",
      main: "#74aa15",
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
    text: {
      primary: "#313837",
      secondary: "#6f6f6f",
    },
    grey: {
      200: "#f7f7f7",
      300: "#d5d5d5",
      500: "#939393",
      700: "#5f5f5f",
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', 'Arial', sans-serif",
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.5rem",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.2rem",
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.06)",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          fontSize: "0.95rem",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: alpha("#0190c3", 0.05),
          },
          "&.Mui-selected": {
            fontWeight: 600,
          },
        },
      },
    },
  },
});

// Styled Tab component
const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: 64,
  display: "flex",
  alignItems: "center",
  flexDirection: "row",
  justifyContent: "flex-start",
  textAlign: "left",
  paddingLeft: 16,
  paddingRight: 16,
  gap: 10,
  "& .MuiTab-iconWrapper": {
    marginBottom: 0,
    marginRight: 8,
  },
  "&.Mui-selected": {
    color: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
}));

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <Fade in={value === index} timeout={500}>
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`report-tabpanel-${index}`}
        aria-labelledby={`report-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    </Fade>
  );
};


// Interface สำหรับ Form Fields Pattern
interface FormFieldsData {
  installationName: string;
  product: string;
  carbonFootprint: string;
  date: string;
  [key: string]: string; // สำหรับฟิลด์พิเศษที่อาจมีเพิ่มในแต่ละแท็บ
}

const Report = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const reportId = queryParams.get("reportId");
  const [tabValue, setTabValue] = useState(0);

  // แยก state สำหรับแต่ละแท็บ
  const [tabAData, setTabAData] = useState<{
    id: string;
    table_db: string;
    variable: string;
    name: string;
    cell: string;
    sheet: string;
    title: string;
    subtitle: string;
    value: string;
  }>({
    id: "",
    table_db: "",
    variable: "",
    name: "",
    cell: "",
    sheet: "",
    title: "",
    subtitle: "",
    value: "",
  });

  const [tabBData, setTabBData] = useState<{
    id: string;
    table_db: string;
    variable: string;
    name: string;
    cell: string;
    sheet: string;
    title: string;
    subtitle: string;
    value: string;
  }>({
    id: "",
    table_db: "",
    variable: "",
    name: "",
    cell: "",
    sheet: "",
    title: "",
    subtitle: "",
    value: "",
  });

  const [tabCData, setTabCData] = useState<{
    id: string;
    table_db: string;
    variable: string;
    name: string;
    cell: string;
    sheet: string;
    title: string;
    subtitle: string;
    value: string;
  }>({
    id: "",
    table_db: "",
    variable: "",
    name: "",
    cell: "",
    sheet: "",
    title: "",
    subtitle: "",
    value: "",
  });

  const [tabDData, setTabDData] = useState<{
    id: string;
    table_db: string;
    variable: string;
    name: string;
    cell: string;
    sheet: string;
    title: string;
    subtitle: string;
    value: string;
  }>({
    id: "",
    table_db: "",
    variable: "",
    name: "",
    cell: "",
    sheet: "",
    title: "",
    subtitle: "",
    value: "",
  });

  const [tabEData, setTabEData] = useState<{
    id: string;
    table_db: string;
    variable: string;
    name: string;
    cell: string;
    sheet: string;
    title: string;
    subtitle: string;
    value: string;
  }>({
    id: "",
    table_db: "",
    variable: "",
    name: "",
    cell: "",
    sheet: "",
    title: "",
    subtitle: "",
    value: "",
  });

  const isDesktop = useMediaQuery("(min-width:900px)");

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // สร้างฟังก์ชันสำหรับแต่ละแท็บเพื่อจัดการ input changes
  const handleTabAChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTabAData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTabBChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTabBData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTabCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTabCData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTabDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTabDData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTabEChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTabEData((prev) => ({ ...prev, [name]: value }));
  };
  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
        {/* Header Banner */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            background: "linear-gradient(to right, #f3f7e7, #e7f9cd)",
            borderLeft: "6px solid #74aa15",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -15,
              right: -15,
              width: 120,
              height: 120,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(7,184,221,0.1) 0%, rgba(1,144,195,0) 70%)",
              zIndex: 0,
            }}
          />

          <Typography
            variant="h4"
            color="primary.main"
            gutterBottom
            sx={{ position: "relative", zIndex: 1 }}
          >
            CBAM Reports
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ position: "relative", zIndex: 1 }}
          >
            รายงานข้อมูล CBAM
          </Typography>
        </Paper>
        {/* Main Content Paper */}
        <Paper
          elevation={1}
          sx={{
            width: "100%",
            mt: 3,
            borderRadius: 3,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Background pattern */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: "radial-gradient(#f3f7e7 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              opacity: 0.3,
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          {/* Tabs section */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              minHeight: 550,
            }}
          >
            {/* Left sidebar with tabs */}
            <Box
              sx={{
                width: { xs: "100%", md: "280px" },
                background:
                  "linear-gradient(145deg,rgba(7,184,221,0.1) 0%, rgba(1,144,195,0) 70%)",
                position: "relative",
                zIndex: 1,
                p: 2,
                borderRadius: { xs: 0, md: "0 20px 20px 0" },
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  color: "primary.main",
                  fontWeight: 700,
                  fontSize: "20px",
                  textAlign: "center",
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                📊 CBAM Reports
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "row", md: "column" },
                  gap: 2,
                }}
              >
                {[
                  {
                    icon: <FactoryIcon />,
                    label: "A_InstData",
                    color: "#ff6b6b",
                    index: 0,
                  },
                  {
                    icon: <LocalFireDepartmentIcon />,
                    label: "B_EmInst",
                    color: "#ffa726",
                    index: 1,
                  },
                  {
                    icon: <BoltIcon />,
                    label: "C_Emissions&Energy",
                    color: "#ffee58",
                    index: 2,
                  },
                  {
                    icon: <SettingsIcon />,
                    label: "D_Processes",
                    color: "#66bb6a",
                    index: 3,
                  },
                  {
                    icon: <ShoppingCartIcon />,
                    label: "E_PurchPrec",
                    color: "#ab47bc",
                    index: 4,
                  },
                ].map((tab) => (
                  <Box
                    key={tab.index}
                    onClick={() => setTabValue(tab.index)}
                    sx={{
                      p: 2,
                      borderRadius: "15px",
                      cursor: "pointer",
                      transition:
                        "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      background:
                        tabValue === tab.index
                          ? `linear-gradient(135deg, ${tab.color} 0%, ${alpha(
                              tab.color,
                              0.8
                            )} 100%)`
                          : alpha("#ffffff", 0.1),
                      border: `2px solid ${
                        tabValue === tab.index ? tab.color : "transparent"
                      }`,
                      backdropFilter: "blur(10px)",
                      transform:
                        tabValue === tab.index
                          ? "scale(1.05) translateX(10px)"
                          : "scale(1)",
                      boxShadow:
                        tabValue === tab.index
                          ? `0 10px 30px ${alpha(
                              tab.color,
                              0.4
                            )}, 0 0 0 1px ${alpha("#ffffff", 0.1)}`
                          : `0 4px 15px ${alpha("#000000", 0.1)}`,
                      "&:hover": {
                        transform: "scale(1.03) translateX(5px)",
                        background:
                          tabValue === tab.index
                            ? `linear-gradient(135deg, ${tab.color} 0%, ${alpha(
                                tab.color,
                                0.9
                              )} 100%)`
                            : alpha("#ffffff", 0.15),
                      },
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: "10px",
                          background:
                            tabValue === tab.index
                              ? alpha("#ffffff", 0.2)
                              : alpha(tab.color, 0.2),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {React.cloneElement(tab.icon, {
                          sx: {
                            color:
                              tabValue === tab.index ? "#ffffff" : tab.color,
                            fontSize: 18,
                          },
                        })}
                      </Box>
                      <Typography
                        variant="body2"
                        fontWeight={tabValue === tab.index ? 700 : 600}
                        sx={{
                          color:
                            tabValue === tab.index
                              ? "#ffffff"
                              : alpha("#000000", 0.5),
                          fontSize: "14px",
                          textShadow:
                            tabValue === tab.index
                              ? "0 1px 2px rgba(0,0,0,0.2)"
                              : "none",
                        }}
                      >
                        {tab.label}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Decorative elements */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 20,
                  right: 20,
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />
            </Box>

            {/* Right content area */}
            <Box
              sx={{
                flexGrow: 1,
                backgroundColor: "#fff",
                position: "relative",
                zIndex: 1,
              }}
            >
              <Paper sx={{ width: "100%", mt: 3 }}>
                <TabPanel value={tabValue} index={0}>
                  <TabAInstallationData
                    reportId={reportId}
                    formValues={tabAData}
                    setFormValues={setTabAData}
                  />
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                  <TabBEmissionInstallation
                    reportId={reportId}
                    formValues={tabBData}
                    setFormValues={setTabBData}
                  />
                </TabPanel>
                <TabPanel value={tabValue} index={2}>
                  <TabCEnergyEmission
                    reportId={reportId}
                    formValues={tabCData}
                    setFormValues={setTabCData}
                  />
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                  <TabDProcess
                    reportId={reportId}
                    formValues={tabDData}
                    setFormValues={setTabDData}
                  />
                </TabPanel>

                <TabPanel value={tabValue} index={4}>
                  <TabEPurchasedPrecursors
                    reportId={reportId}
                    formValues={tabEData}
                    setFormValues={setTabEData}
                  />
                </TabPanel>
              </Paper>
            </Box>
          </Box>

          {/* Footer section with current tab info */}
          <Box
            sx={{
              p: 2,
              borderTop: `1px solid ${theme.palette.grey[300]}`,
              backgroundColor: alpha(theme.palette.grey[200], 0.4),
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Currently viewing:{" "}
              <strong>
                {tabValue === 0
                  ? "Installation Data"
                  : tabValue === 1
                  ? "Emission Installation"
                  : tabValue === 2
                  ? "Emission of Energy"
                  : tabValue === 3
                  ? "Process"
                  : "Purchased Precursors"}
              </strong>
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: theme.palette.success.main,
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
              <Typography variant="body2" color="text.secondary">
                Data updated
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* ปุ่มดำเนินการต่างๆ */}
        <Box
          sx={{
            mt: 4,
            display: "flex",
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Report;
