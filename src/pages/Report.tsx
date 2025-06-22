import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Grid,
} from "@mui/material";
import Section from "../components/Section";
import LabeledTextField from "../components/LabeledTextField";
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

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `report-tab-${index}`,
    "aria-controls": `report-tabpanel-${index}`,
  };
};

const Report = () => {
  const [tabValue, setTabValue] = useState(0);
  const [formValues, setFormValues] = useState({
    id: "",
    name: "",
    cell: "",
    value: "",
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const renderCommonFields = (title: string) => (
    <>
      <Typography variant="h6" gutterBottom color="primary">
        {title}
      </Typography>

      {/* <Grid container spacing={2}> */}
      <Grid>
        <LabeledTextField
          type="text"
          caption="Name of Installation"
          defination="ชื่อสถานประกอบการ"
          label=""
          name="id"
          value={formValues.id}
          onChange={handleInputChange}
          required
        />
      </Grid>
    </>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        fontWeight="bold"
        color="#1976d2"
      >
        CBAM Reports
      </Typography>
      <Typography
        variant="subtitle1"
        align="center"
        color="text.secondary"
        paragraph
      >
        รายงานข้อมูล CBAM
      </Typography>
      <Typography
        variant="h5"
        gutterBottom
        align="center"
        fontWeight="bold"
        color="#1976d2"
      >
        บริษัท เอบีซี จำกัด
      </Typography>
      <Typography
        variant="subtitle1"
        align="center"
        color="text.secondary"
        paragraph
      >
        ผลิตภัณฑ์:xxxxxxxx  | หมวดหมู่: xxxxxxxxxxx
      </Typography>
      <Typography
        variant="subtitle1"
        align="center"
        color="text.secondary"
        paragraph
      >
        Carbon Footprint: xxxxxxxx tCO₂eq/t | วันที่ส่ง: xxxxxxxx
      </Typography>

      <Paper sx={{ width: "100%", mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="report tabs"
            variant="fullWidth"
          >
            <Tab label="A_InstData Sheet" {...a11yProps(0)} />
            <Tab label="B_EmInst Sheet" {...a11yProps(1)} />
            <Tab label="C_Emissions&Energy Sheet" {...a11yProps(2)} />
            <Tab label="D_Processes Sheet" {...a11yProps(3)} />
            <Tab label="E_PurchPrec Sheet" {...a11yProps(4)} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <TabAInstallationData
            formValues={formValues}
            setFormValues={setFormValues}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <TabBEmissionInstallation
            formValues={formValues}
            setFormValues={setFormValues}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <TabCEnergyEmission
            formValues={formValues}
            setFormValues={setFormValues}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <TabDProcess
            formValues={formValues}
            setFormValues={setFormValues}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <TabEPurchasedPrecursors
            formValues={formValues}
            setFormValues={setFormValues}
          />
        </TabPanel>

      </Paper>
    </Container>
  );
};

export default Report;
