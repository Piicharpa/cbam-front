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
import { useMediaQuery } from "@mui/material";
import TabAInstallationData from "../components/reportTab/TabA_InstallationData";
import TabBEmissionInstallation from "../components/reportTab/TabB_EmissionInstallation";
import TabCEnergyEmission from "../components/reportTab/TabC_EnergyEmissions";
import TabDProcess from "../components/reportTab/TabD_Process";
import TabEPurchasedPrecursors from "../components/reportTab/TabE_PurchasedPrecursors";
import { useLocation } from "react-router-dom";

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
  // Theme configuration remains the same
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
    // Rest of palette configuration...
  },
  // Rest of theme configuration...
});

// Styled Tab component
const StyledTab = styled(Tab)(({ theme }) => ({
  // Styling remains the same
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
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const reportId = queryParams.get("reportId");
  const [tabValue, setTabValue] = useState(0);

  // Add state for summary data with API integration
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab states remain the same
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

  // States for other tabs remain the same
  const [tabBData, setTabBData] = useState<{
    /*...*/
  }>(/*...*/);
  const [tabCData, setTabCData] = useState<{
    /*...*/
  }>(/*...*/);
  const [tabDData, setTabDData] = useState<{
    /*...*/
  }>(/*...*/);
  const [tabEData, setTabEData] = useState<{
    /*...*/
  }>(/*...*/);

  const isDesktop = useMediaQuery("(min-width:900px)");

  // Fetch summary data when component mounts or reportId changes
  useEffect(() => {
    const fetchSummaryData = async () => {
      if (!reportId) {
        setError("No report ID provided");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const apiUrl = `http://178.128.123.212:5000/api/cbam/report/sumary/${reportId}`;
        console.log(`Fetching data from: ${apiUrl}`);

        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log("Summary data received:", data);
        setSummaryData(data);
      } catch (err) {
        console.error("Error fetching summary data:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummaryData();
  }, [reportId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Form change handlers remain the same
  const handleTabAChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTabAData((prev) => ({ ...prev, [name]: value }));
  };

  // Handlers for other tabs remain the same

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

          {isLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <CircularProgress size={24} />
              <Typography color="text.secondary">
                Loading summary data...
              </Typography>
            </Box>
          ) : error ? (
            <Typography color="error" sx={{ position: "relative", zIndex: 1 }}>
              Error loading data: {error}
            </Typography>
          ) : summaryData && summaryData.data.length > 0 ? (
            <>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ position: "relative", zIndex: 1, mb: 1 }}
              >
                Product:{" "}
                <span style={{ color: "#0190c3", fontWeight: 600 }}>
                  {summaryData.data[0].product_name || "N/A"}
                </span>
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ position: "relative", zIndex: 1, mb: 1 }}
              >
                CN code:{" "}
                <span style={{ color: "#0190c3", fontWeight: 600 }}>
                  {summaryData.data[0].cn_code || "N/A"}
                </span>
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ position: "relative", zIndex: 1, mb: 1 }}
              >
                SEE (direct):
                <span style={{ color: "#0190c3", fontWeight: 600 }}>
                  {" "}
                  {summaryData.sum[0]?.SEE_direct_sum?.toFixed(6) || "N/A"}{" "}
                </span>
                {summaryData.unit[0]?.SEE_direct_sum || ""}
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ position: "relative", zIndex: 1, mb: 1 }}
              >
                การคำนวณของค่า SEE (direct):
                <span style={{ color: "#0190c3", fontWeight: 600 }}>
                  {" "}
                  {summaryData.sum[0]?.SEE_direct_sum?.toFixed(6) || "N/A"}{" "}
                </span>
                {summaryData.unit[0]?.SEE_direct_sum || ""}
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ position: "relative", zIndex: 1, mb: 1 }}
              >
                SEE (indirect):
                <span style={{ color: "#0190c3", fontWeight: 600 }}>
                  {" "}
                  {summaryData.sum[0]?.SEE_indirect_sum?.toFixed(6) ||
                    "N/A"}{" "}
                </span>
                {summaryData.unit[0]?.SEE_indirect_sum || ""}
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ position: "relative", zIndex: 1, mb: 1 }}
              >
                การคำนวณของค่า SEE (indirect):
                <span style={{ color: "#0190c3", fontWeight: 600 }}>
                  {" "}
                  {summaryData.sum[0]?.SEE_indirect_sum?.toFixed(6) ||
                    "N/A"}{" "}
                </span>
                {summaryData.unit[0]?.SEE_indirect_sum || ""}
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ position: "relative", zIndex: 1 }}
              >
                SEE (total):
                <span style={{ color: "#0190c3", fontWeight: 600 }}>
                  {" "}
                  {summaryData.sum[0]?.SEE_total_sum?.toFixed(6) || "N/A"}{" "}
                </span>
                {summaryData.unit[0]?.SEE_total_sum || ""}
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ position: "relative", zIndex: 1 }}
              >
                การคำนวณของค่า SEE (total):
                <span style={{ color: "#0190c3", fontWeight: 600 }}>
                  {" "}
                  {summaryData.sum[0]?.SEE_total_sum?.toFixed(6) || "N/A"}{" "}
                </span>
                {summaryData.unit[0]?.SEE_total_sum || ""}
              </Typography>
            </>
          ) : (
            <Typography
              color="text.secondary"
              sx={{ position: "relative", zIndex: 1 }}
            >
              No summary data available for this report.
            </Typography>
          )}
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
          {/* Example of action buttons */}
          {summaryData && !isLoading && (
            <>
              <button
                style={{
                  padding: "10px 20px",
                  backgroundColor: theme.palette.primary.main,
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                }}
                onClick={() => {
                  // Example action
                  console.log("Generate PDF for report", reportId);
                  // Implement PDF generation or other actions
                }}
              >
                Generate PDF Report
              </button>

              <button
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#fff",
                  color: theme.palette.primary.main,
                  border: `2px ${theme.palette.primary.main}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
                onClick={() => {
                  // Example action to export data
                  console.log("Export data for report", reportId);
                  // Implement export functionality
                }}
              >
                Export Data
              </button>
            </>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Report;
