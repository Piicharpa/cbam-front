import React, { useState } from "react";
import {
  Container,
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Typography,
} from '@mui/material';

import InstallationForm from "../forms/installationForm";
import VerifierForm from "../forms/VerifierForm";
import GoodsForm from "../forms/GoodsForm";
import PrecursorsForm from "../forms/PrecursorsForm";
import AmountForm from "../forms/AmountForm";
import SourceForm from "../forms/SourceForm";

const steps = [
  "Installation",
  "Verifier",
  "Goods",
  "Precursors",
  "Amount",
  "Source",
];

const Formdev: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  // Keep previous data
  const [installationData, setInstallationData] = useState({
    name: '',
    name_specific: '',
    eco_activity: '',
    address: '',
    city: '',
    country_id: '',
    post_code: '',
    po_box: '',
    latitude: '',
    longitude: '',
    author_represent: '',
    email: '',
    tel: '',
    unlocode: '',
    reporting_period_start: new Date(),
    reporting_period_end: new Date(),
  });

  const [verifierData, setVerifierData] = useState({
    installation_name: "",
    address: "",
    city: "",
    country_id: "",
    post_code: "",
    authorized_rep_id: "",
    accreditation_state: "",
    accreditation_national_body: "",
    registration_no: "",
    name: "",
    email: "",
    phone: "",
    fax: "",
  });

  const [goodsData, setGoodsData] = useState({
    report_id: "",
    name: "",
    goods_category: "",
    routes: {},
    amounts: {},
    total_consumed_within_installation: "",
    consumed_in_others_amounts: "",
    condumed_non_cbam_goods_amounts: "",
    has_heat: "",
    has_waste_gases: "",
    direct_emissions: "",
    imported_heat_value: "",
    exported_heat_value: "",
    ef_imported_heat: "",
    ef_exported_heat: "",
    electricity_consumption_value: "",
    ef_electricity: "",
    source_of_ef_electricity: "",
    exported_electricity_value: "",
    ef_exported_electricity: "",
    total_production_amounts: "",
    produced_for_market_amount: "",
    imported_wgases_amount: "",
    ef_imported_wgases: "",
    exported_wgases_amount: "",
    ef_exported_wgases: "",
    industry_type: ""
  });

  const [precursorsData, setPrecursorsData] = useState({});
  const [amountData, setAmountData] = useState({});

  const handleNext = () => setActiveStep((prevStep) => prevStep + 1);
  const handleBack = () => setActiveStep((prevStep) => prevStep - 1);

  const handleSubmit = () => {
    const allData = {
      installationData,
      verifierData,
      goodsData,
      precursorsData,
      amountData,
    };
    console.log('📦 Submitting all form data:', allData);
    alert('✅ Form submitted!');
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <InstallationForm data={installationData} onChange={setInstallationData} onNextStep={handleNext} />
      case 1:
        return <VerifierForm data={verifierData} onChange={setVerifierData} onNextStep={handleNext} />;
      case 2:
        return <GoodsForm formValues={goodsData} onChange={setGoodsData} onNextStep={handleNext} />
      case 3:
        return <PrecursorsForm onNextStep={handleNext} />;
      case 4:
        return <AmountForm onNextStep={handleNext} />;
      case 5:
        return <SourceForm />;
      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  return (
    <Container maxWidth="md" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
      {/* 🟡 Status bar */}
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* 🟢 Form content */}
      <Box mt={6}>{renderStepContent(activeStep)}</Box>

      {/* 🔘 Navigation buttons */}
      <Box mt={6} display="flex" justifyContent="space-between">
        <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined">
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Submit
          </Button>
        ) : (
          <Button onClick={handleNext} variant="contained" color="primary">
            Next
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default Formdev;
