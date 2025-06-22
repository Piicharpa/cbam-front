import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Grid,
  ThemeProvider,
  createTheme,
  styled,
  alpha,
  Fade,
} from "@mui/material";
import Section from "../components/Section";
import LabeledTextField from "../components/LabeledTextField";
// Icons for tabs
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

const a11yProps = (index: number) => {
  return {
    id: `report-tab-${index}`,
    "aria-controls": `report-tabpanel-${index}`,
  };
};

// // เครื่องมือช่วยสร้าง Component สำหรับแสดง Summary Box
// const SummaryBox = ({ data, title }: { data: any; title: string }) => {
//   return (
//     <Box
//       sx={{
//         mt: 4,
//         p: 3,
//         borderRadius: 2,
//         backgroundColor: alpha(theme.palette.secondary.light, 0.5),
//         border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
//         position: "relative",
//         overflow: "hidden",
//       }}
//     >
//       <Typography
//         variant="subtitle1"
//         color="secondary.dark"
//         fontWeight={600}
//         gutterBottom
//       >
//         {title}
//       </Typography>

//       <Grid container spacing={2}>
//         <Grid size={12}>
//           <Typography variant="body2" color="text.secondary">
//             <strong>Name of Installation:</strong> {data.installationName || "-"}
//           </Typography>
//           <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
//             <strong>Product:</strong> {data.product || "-"}
//           </Typography>
//         </Grid>
//         <Grid size={12}>
//           <Typography variant="body2" color="text.secondary">
//             <strong>Carbon Footprint:</strong> {data.carbonFootprint || "-"}
//           </Typography>
//           <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
//             <strong>Date:</strong> {data.date || "-"}
//           </Typography>
//         </Grid>
//       </Grid>

//       {/* Decorative elements */}
//       <Box
//         sx={{
//           position: "absolute",
//           bottom: -15,
//           right: -15,
//           width: 80,
//           height: 80,
//           borderRadius: "50%",
//           background: `radial-gradient(circle, ${alpha(
//             "#74aa15",
//             0.1
//           )} 0%, transparent 70%)`,
//           zIndex: 0,
//         }}
//       />
//     </Box>
//   );
// };

// Interface สำหรับ Form Fields Pattern
interface FormFieldsData {
  installationName: string;
  product: string;
  carbonFootprint: string;
  date: string;
  [key: string]: string; // สำหรับฟิลด์พิเศษที่อาจมีเพิ่มในแต่ละแท็บ
}

const Report = () => {
  const [tabValue, setTabValue] = useState(0);

  // แยก state สำหรับแต่ละแท็บ
  const [tabAData, setTabAData] = useState<{
    id: string;
    name: string;
    cell: string;
    value: string;
  }>({
    id: "",
    name: "",
    cell: "",
    value: "",
  });

  const [tabBData, setTabBData] = useState<{
    id: string;
    name: string;
    cell: string;
    value: string;
  }>({
    id: "",
    name: "",
    cell: "",
    value: "",
  });

  const [tabCData, setTabCData] = useState<{
    id: string;
    name: string;
    cell: string;
    value: string;
  }>({
    id: "",
    name: "",
    cell: "",
    value: "",
  });

  const [tabDData, setTabDData] = useState<{
    id: string;
    name: string;
    cell: string;
    value: string;
  }>({
    id: "",
    name: "",
    cell: "",
    value: "",
  });

  const [tabEData, setTabEData] = useState<{
    id: string;
    name: string;
    cell: string;
    value: string;
  }>({
    id: "",
    name: "",
    cell: "",
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

  // เปลี่ยนจาก renderCommonFields เป็น renderFieldsForTab ที่สามารถรองรับฟิลด์เพิ่มเติมได้
  // const renderFieldsForTab = (
  //   title: string,
  //   data: FormFieldsData,
  //   handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  //   additionalFields?: Array<{
  //     name: string;
  //     caption: string;
  //     defination: string;
  //   }>
  // ) => (
  //   <Box
  //     sx={{
  //       position: "relative",
  //       "&::before": {
  //         content: '""',
  //         position: "absolute",
  //         right: -20,
  //         top: 20,
  //         width: 150,
  //         height: 150,
  //         borderRadius: "50%",
  //         background: `radial-gradient(circle, ${alpha(
  //           "#f3f7e7",
  //           0.7
  //         )} 0%, ${alpha("#e7f9cd", 0.3)} 50%, transparent 70%)`,
  //         zIndex: 0,
  //         pointerEvents: "none",
  //       },
  //     }}
  //   >
  //     <Typography
  //       variant="h5"
  //       gutterBottom
  //       color="primary.main"
  //       sx={{
  //         position: "relative",
  //         pb: 1,
  //         "&::after": {
  //           content: '""',
  //           position: "absolute",
  //           bottom: 0,
  //           left: 0,
  //           width: "60px",
  //           height: "3px",
  //           borderRadius: "2px",
  //           background: theme.palette.primary.main,
  //         },
  //       }}
  //     >
  //       {title}
  //     </Typography>

  //     <Grid
  //       container
  //       spacing={3}
  //       sx={{ mt: 2, position: "relative", zIndex: 1 }}
  //     >
  //       <Grid size={12}>
  //         <LabeledTextField
  //           type="text"
  //           caption="Name of Installation"
  //           defination="ชื่อสถานประกอบการ"
  //           label=""
  //           name="installationName"
  //           value={data.installationName}
  //           onChange={handleChange}
  //           required
  //         />
  //       </Grid>

  //       <Grid size={12}>
  //         <LabeledTextField
  //           type="text"
  //           caption="Product"
  //           defination="ผลิตภัณฑ์"
  //           label=""
  //           name="product"
  //           value={data.product}
  //           onChange={handleChange}
  //           required
  //         />
  //       </Grid>

  //       <Grid size={12}>
  //         <LabeledTextField
  //           type="text"
  //           caption="Carbon Footprint"
  //           defination="คาร์บอนฟุตพริ้นท์"
  //           label=""
  //           name="carbonFootprint"
  //           value={data.carbonFootprint}
  //           onChange={handleChange}
  //           required
  //         />
  //       </Grid>

  //       <Grid size={12}>
  //         <LabeledTextField
  //           type="date"
  //           caption="Date"
  //           defination="วันที่"
  //           label=""
  //           name="date"
  //           value={data.date}
  //           onChange={handleChange}
  //           required
  //         />
  //       </Grid>

  //       {/* แสดงฟิลด์เพิ่มเติมตามที่กำหนด */}
  //       {additionalFields &&
  //         additionalFields.map((field) => (
  //           <Grid size={12} key={field.name}>
  //             <LabeledTextField
  //               type="text"
  //               caption={field.caption}
  //               defination={field.defination}
  //               label=""
  //               name={field.name}
  //               value={data[field.name] || ""}
  //               onChange={handleChange}
  //             />
  //           </Grid>
  //         ))}
  //     </Grid>

  {
    /* Summary Box */
  }
  {
    /* <SummaryBox data={data} title="Summary Information" /> */
  }
  //   </Box>
  // );

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
                borderRight: {
                  xs: "none",
                  md: `1px solid ${theme.palette.grey[300]}`,
                },
                borderBottom: {
                  xs: `1px solid ${theme.palette.grey[300]}`,
                  md: "none",
                },
                backgroundColor: alpha(theme.palette.grey[200], 0.4),
                position: "relative",
                zIndex: 1,
              }}
            >
              <Tabs
                orientation={isDesktop ? "vertical" : "horizontal"}
                variant="scrollable"
                value={tabValue}
                onChange={handleTabChange}
                aria-label="report tabs"
                sx={{
                  minHeight: "100%",
                  borderRight: 0,
                  "& .MuiTabs-indicator": {
                    ...(isDesktop
                      ? {
                          right: "auto",
                          left: 0,
                          width: "4px",
                          borderRadius: "0 4px 4px 0",
                        }
                      : {}),
                  },
                }}
              >
                <StyledTab
                  icon={<FactoryIcon />}
                  label="A. Installation Data"
                  {...a11yProps(0)}
                />
                <StyledTab
                  icon={<LocalFireDepartmentIcon />}
                  label="B. Emission Installation"
                  {...a11yProps(1)}
                />
                <StyledTab
                  icon={<BoltIcon />}
                  label="C. Emission of Energy"
                  {...a11yProps(2)}
                />
                <StyledTab
                  icon={<SettingsIcon />}
                  label="D. Process"
                  {...a11yProps(3)}
                />
                <StyledTab
                  icon={<ShoppingCartIcon />}
                  label="E. Purchased Precursors"
                  {...a11yProps(4)}
                />
              </Tabs>
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
                    formValues={tabAData}
                    setFormValues={setTabAData}
                  />
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                  <TabBEmissionInstallation
                    formValues={tabBData}
                    setFormValues={setTabBData}
                  />
                </TabPanel>
                <TabPanel value={tabValue} index={2}>
                  <TabCEnergyEmission
                    formValues={tabCData}
                    setFormValues={setTabCData}
                  />
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                  <TabDProcess
                    formValues={tabDData}
                    setFormValues={setTabDData}
                  />
                </TabPanel>

                <TabPanel value={tabValue} index={4}>
                  <TabEPurchasedPrecursors
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
          {/* ปุ่มบันทึกข้อมูล */}
          <Box>
            <button
              onClick={() => {
                // รวบรวมข้อมูลทั้งหมดเพื่อบันทึก
                const allData = {
                  installationData: tabAData,
                  emissionInstallation: tabBData,
                  energyEmission: tabCData,
                  process: tabDData,
                  purchasedPrecursors: tabEData,
                };

                console.log("บันทึกข้อมูลรายงานทั้งหมด:", allData);
                alert("บันทึกข้อมูลเรียบร้อยแล้ว");
              }}
              style={{
                backgroundColor: theme.palette.primary.main,
                color: "#fff",
                padding: "10px 20px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                transition: "all 0.2s ease-in-out",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: `0 4px 8px ${alpha("#0190c3", 0.25)}`,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor =
                  theme.palette.primary.dark;
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 6px 12px ${alpha(
                  "#0190c3",
                  0.3
                )}`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor =
                  theme.palette.primary.main;
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 4px 8px ${alpha(
                  "#0190c3",
                  0.25
                )}`;
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>💾</span> บันทึกข้อมูลรายงาน
            </button>
          </Box>

          {/* Helpful options section */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary">
                Need help with your report?{" "}
                <Box
                  component="a"
                  href="#"
                  sx={{
                    color: theme.palette.primary.main,
                    textDecoration: "none",
                    fontWeight: 500,
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Contact support
                </Box>
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 3,
                flexWrap: "wrap",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.grey[600],
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  cursor: "pointer",
                  "&:hover": {
                    color: theme.palette.primary.main,
                  },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    fontSize: "1.2rem",
                    lineHeight: 1,
                  }}
                >
                  ↓
                </Box>
                Download Report
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.grey[600],
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  cursor: "pointer",
                  "&:hover": {
                    color: theme.palette.primary.main,
                  },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    fontSize: "1.2rem",
                    lineHeight: 1,
                  }}
                >
                  ⟳
                </Box>
                Refresh Data
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.grey[600],
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  cursor: "pointer",
                  "&:hover": {
                    color: theme.palette.primary.main,
                  },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    fontSize: "1.2rem",
                    lineHeight: 1,
                  }}
                >
                  ☆
                </Box>
                Save as Favorite
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Report;
