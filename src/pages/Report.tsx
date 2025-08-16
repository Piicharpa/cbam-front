import React, { useState, useEffect } from "react";
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
  CircularProgress,
} from "@mui/material";
import FactoryIcon from "@mui/icons-material/Factory";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import BoltIcon from "@mui/icons-material/Bolt";
import SettingsIcon from "@mui/icons-material/Settings";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SummarizeIcon from "@mui/icons-material/Summarize"; // New icon for the Sumup tab
import { useMediaQuery } from "@mui/material";
import TabAInstallationData from "../components/reportTab/TabA_InstallationData";
import TabBEmissionInstallation from "../components/reportTab/TabB_EmissionInstallation";
import TabCEnergyEmission from "../components/reportTab/TabC_EnergyEmissions";
import TabDProcess from "../components/reportTab/TabD_Process";
import TabEPurchasedPrecursors from "../components/reportTab/TabE_PurchasedPrecursors";
import TabZ_Sumup from "../components/reportTab/TabZ_Sumup"; // Corrected import name

// Interface definitions
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Interface for the summary data
interface SummaryData {
  data: {
    installation_id: number;
    industry_type_id: number;
    goods_id: number;
    installation_name: string;
    verifier_name: string | null;
    industry_type_name: string;
    goods_category_name: string;
    cn_name: string;
    cn_code: string;
    product_name: string;
  }[];
  sum: {
    SEE_direct_sum: number;
    SEE_indirect_sum: number;
    SEE_total_sum: number;
  }[];
  unit: {
    SEE_direct_sum: string;
    SEE_indirect_sum: string;
    SEE_total_sum: string;
  }[];
}

// Interface for form fields pattern
interface FormFieldsData {
  installationName: string;
  product: string;
  carbonFootprint: string;
  date: string;
  [key: string]: string; // For special fields that may be added to each tab
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
    success: {
        main: "#4caf50",
    }
  },
});

// Styled Tab component
const StyledTab = styled(Tab)(({ theme }) => ({
  // Styling remains the same
  fontSize: "14px",
  fontWeight: 600,
  minWidth: 100,
  marginRight: theme.spacing(1),
  color: alpha("#000000", 0.5),
  "&.Mui-selected": {
    color: theme.palette.primary.main,
    fontWeight: 700,
  },
  "&.Mui-focusVisible": {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
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

const Report = () => {
  const location = window.location.search;
  const queryParams = new URLSearchParams(location);
  const reportId = queryParams.get("reportId");
  const [tabValue, setTabValue] = useState(0);

  // Add state for summary data with API integration
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab states for form data
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

  const [tabBData, setTabBData] = useState<{}>({});
  const [tabCData, setTabCData] = useState<{}>({});
  const [tabDData, setTabDData] = useState<{}>({});
  const [tabEData, setTabEData] = useState<{}>({});
  const [tabZData, setTabZData] = useState<{}>({}); 
  

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Form change handlers
  const handleTabAChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTabAData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
        {/* Header Banner - Now with API data integration */}
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
            sx={{
              position: "relative",
              zIndex: 1,
              fontWeight: "bold",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: -4,
                left: 0,
                width: "40px",
                height: "4px",
                backgroundColor: "primary.main",
                borderRadius: "2px",
              },
            }}
          >
            CBAM Reports
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
                  { // New tab for the sumup page
                    icon: <SummarizeIcon />,
                    label: "Summary",
                    color: "#0190c3",
                    index: 5,
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
                <TabPanel value={tabValue} index={5}>
                  <TabZ_Sumup
                    reportId={reportId}
                    formValues={tabZData}
                    setFormValues={setTabZData}
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
                  : tabValue === 4
                  ? "Purchased Precursors"
                  : "Sumup"}
              </strong>
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              {/* Add a status indicator */}
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
                {isLoading ? "Updating data..." : "Data updated"}
              </Typography>

              {/* Add a timestamp if desired */}
              {!isLoading && summaryData && (
                <Typography variant="body2" color="text.secondary">
                  {new Date().toLocaleTimeString()}
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Action Buttons - You can add these if needed */}
        <Box
          sx={{
            mt: 4,
            display: "flex",
            justifyContent: "flex-end",
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
