import React, { useState, useRef } from "react";
import {
  Container,
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Typography,
  ThemeProvider,
  Fade,
} from "@mui/material";
import theme from "../components/pages/form/Theme";
import {
  ColorlibConnector,
  ColorlibStepIcon,
  steps,
} from "../components/pages/form/Stepper";
import {
  HeaderPatternBox,
  HeaderBanner,
  StepperContainer,
  TopRightCircle,
  BottomLeftCircle,
  ContentPaper,
  NavigationContainer,
  ButtonDecoration,
} from "../components/pages/form/Style";
import styled from "@emotion/styled";
import InstallationForm from "../forms/installationForm";
import VerifierForm from "../forms/VerifierForm";
import GoodsForm from "../forms/GoodsForm";
import PrecursorsForm from "../forms/PrecursorsForm";
import SourceForm from "../forms/SourceForm";
// import EmissionForm from "../forms/SourceForm";
import SumupForm from "../forms/SumupForm";

import { Theme } from "@mui/material/styles";
import EmissionForm from "../forms/EmissionForm";

const StyledBox = styled(Box)(({ theme }: { theme: Theme }) => ({
  width: "100%",
  height: "4px",
  backgroundColor: theme.palette.divider,
  transition: "background-color 0.3s ease",
}));

const Formdev: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  // Form refs for submitting
  const SumupFormRef = useRef<any>(null);
  const installationFormRef = useRef<any>(null);
  const verifierFormRef = useRef<any>(null);
  const goodsFormRef = useRef<any>(null);
  const precursorsFormRef = useRef<any>(null);
  // const amountFormRef = useRef<any>(null);
  const sourceFormRef = useRef<any>(null);
  const emissionFormRef = useRef<any>(null);

  // Form data states
  const [sumupData, setsumupData] = useState({
    industry_id: "",
    goods_id: "",
    cn_id: "",
  });
  const [installationData, setInstallationData] = useState({
    name: "",
    name_specific: "",
    eco_activity: "",
    address: "",
    city: "",
    country_id: "",
    post_code: "",
    po_box: "",
    latitude: "",
    longitude: "",
    author_represent: "",
    email: "",
    tel: "",
    unlocode: "",
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
    report_id: 0,
    name: "",
    goods_category: "",
    routes: {},
    amounts: {},
    total_consumed_within_installation: 0,
    consumed_in_others_amounts: 0,
    condumed_non_cbam_goods_amounts: 0,
    has_heat: 0,
    has_waste_gases: 0,
    direct_emissions: 0,
    imported_heat_value: 0,
    exported_heat_value: 0,
    ef_imported_heat: 0,
    ef_exported_heat: 0,
    electricity_consumption_value: 0,
    ef_electricity: 0,
    source_of_ef_electricity: "",
    exported_electricity_value: 0,
    ef_exported_electricity: 0,
    produced_for_market_amount: 0,
    imported_wgases_amount: 0,
    ef_imported_wgases: 0,
    exported_wgases_amount: 0,
    ef_exported_wgases: 0,
    industry_type: "",
    total_production_amounts: 0,
  });
  const [precursorsData, setPrecursorsData] = useState({
    name: "",
    route_1: "",
    route_1_amounts: 0,
    route_2: "",
    route_2_amounts: 0,
    route_3: "",
    route_3_amounts: 0,
    route_4: "",
    route_4_amounts: 0,
    route_5: "",
    route_5_amounts: 0,
    total_consumed_within_installation: 0,
    consumed_in_production_amounts: 0,
    consumed_non_cbam_goods_amounts: 0,
    total_consumed_within_installation_amounts: 0,
    embedded_direct_emissions_value: 0,
    source_embedded_direct_emissions: "",
    embedded_indirection_emissions_value: 0,
    source_embedded_indirect_emissions: "",
    justification_for_use_default_values: "",
  });
  const [sourceData, setSourceData] = useState({
    p_method: "",
    p_source_stream_name: "",
    p_activity_data: "",
    p_ad_unit: "",
    p_net_calorific_value: "",
    p_ncv_unit: "",
    p_emission_factor: "",
    p_ef_unit: "",
    p_oxidation_factor: "",
    p_biomass_content: "",
    p_co2e_fossil: "",
    p_co2e_bio: "",
    p_energy_content_fossil: "",
    p_energy_content_bio: "",
    generatl_info_on_data_quality: "",
    justification_for_use_default_values: "",
    manual_fuel_balance: "",
    manual_GHG_emissions_balance: "",
    info_qty_assurance: "",
  });
  const [emissionData, setEmissionData] = useState({
    generatl_info_on_data_quality: "",
    justification_for_use_default_values: "",
    manual_fuel_balance: "",
    manual_GHG_emissions_balance: "",
    info_qty_assurance: "",
  });

  // Handle form navigation with animations
  const handleNext = async () => {
    let canProceed = true;
    try {
      switch (activeStep) {
        case 0:
          if (SumupFormRef.current?.submit) {
            canProceed = await SumupFormRef.current.submit();
          }
          break;
        case 1:
          if (installationFormRef.current?.submit) {
            canProceed = await installationFormRef.current.submit();
          }
          break;
        case 2:
          if (verifierFormRef.current?.submit) {
            canProceed = await verifierFormRef.current.submit();
          }
          break;
        case 3:
          if (goodsFormRef.current?.submit) {
            canProceed = await goodsFormRef.current.submit();
          }
          break;
        case 4:
          if (precursorsFormRef.current?.submit) {
            canProceed = await precursorsFormRef.current.submit();
          }
          break;
        case 5:
          if (sourceFormRef.current?.submit) {
            canProceed = await sourceFormRef.current.submit();
          }
          break;
        case 6:
          if (emissionFormRef.current?.submit) {
            canProceed = await emissionFormRef.current.submit();
          }
          break;
      }
    } catch (error) {
      console.error("Form validation failed:", error);
      canProceed = false;
    }
    if (canProceed) {
      setFadeIn(false);
      setTimeout(() => {
        setActiveStep((prevStep) => prevStep + 1);
        setFadeIn(true);
      }, 300);
    }
  };

  const handleBack = () => {
    setFadeIn(false);
    setTimeout(() => {
      setActiveStep((prevStep) => prevStep - 1);
      setFadeIn(true);
    }, 300);
  };

  const handleSubmit = async () => {
    if (sourceFormRef.current?.submit) {
      const isValid = await sourceFormRef.current.submit();
      if (!isValid) return;
    }
    const allData = {
      sumupData,
      installationData,
      verifierData,
      goodsData,
      precursorsData,
      // amountData,
      sourceData,
    };
    setFadeIn(false);
    setTimeout(() => {
      alert("✅ Form submitted successfully!");
      setFadeIn(true);
    }, 300);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <SumupForm
            data={sumupData}
            onChange={setsumupData}
            onNextStep={handleNext}
          />
        );
      case 1:
        return (
          <InstallationForm
            data={installationData}
            onChange={setInstallationData}
            onNextStep={handleNext}
          />
        );
      case 2:
        return (
          <VerifierForm
            data={verifierData}
            onChange={setVerifierData}
            onNextStep={handleNext}
          />
        );
      case 3:
        return (
          <GoodsForm
            formValues={goodsData}
            onChange={setGoodsData}
            onNextStep={handleNext}
          />
        );
      case 4:
        return (
          <PrecursorsForm
            formValues={precursorsData}
            onChange={(formValues) =>
              setPrecursorsData((prev) => ({
                ...prev,
                ...Object.fromEntries(
                  Object.entries(formValues).map(([k, v]) => [k, v ?? (typeof prev[k as keyof typeof prev] === "number" ? 0 : "")])
                ),
              }))
            }
            onNextStep={handleNext}
          />
        );
      case 5:
        return (
          <SourceForm
            formValues={sourceData}
            onChange={(formValues) =>
              setSourceData((prev) => ({
                ...prev,
                ...Object.fromEntries(
                  Object.entries(formValues).map(([k, v]) => [k, v ?? ""])
                ),
              }))
            }
            onNextStep={handleNext}
          />
        );
      case 6:
        return (
          <EmissionForm
            formValues={sourceData}
            onChange={(formValues) =>
              setSourceData((prev) => ({
                ...prev,
                ...Object.fromEntries(
                  Object.entries(formValues).map(([k, v]) => [k, v ?? ""])
                ),
              }))
            }
            onNextStep={handleNext}
          />
        );
      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  const progress = ((activeStep + 1) / steps.length) * 100;
  const isLastStep = activeStep === steps.length - 1;

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <HeaderBanner elevation={0}>
          <HeaderPatternBox />
          <Typography
            variant="h4"
            color="primary.main"
            gutterBottom
            sx={{ position: "relative", zIndex: 1 }}
          >
            CBAM Declaration Form
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ position: "relative", zIndex: 1 }}
          >
            Complete all steps to submit your declaration for the Carbon Border
            Adjustment Mechanism
          </Typography>
        </HeaderBanner>
        <StepperContainer elevation={1} progress={progress}>
          <Stepper
            alternativeLabel
            activeStep={activeStep}
            connector={<ColorlibConnector />}
          >
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel StepIconComponent={ColorlibStepIcon}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: activeStep === index ? 600 : 400,
                      fontSize: 15,
                      color:
                        activeStep === index
                          ? "primary.main"
                          : index < activeStep
                          ? "secondary.main"
                          : "text.primary",
                    }}
                  >
                    {step.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      color: "text.secondary",
                      fontSize: 12,
                    }}
                  >
                    {step.description}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </StepperContainer>
        <Fade in={fadeIn} timeout={500}>
          <Box sx={{ minHeight: "450px", position: "relative" }}>
            <TopRightCircle />
            <BottomLeftCircle />
            <ContentPaper elevation={1}>
              {renderStepContent(activeStep)}
            </ContentPaper>
          </Box>
        </Fade>
        <NavigationContainer>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          <Box sx={{ position: "relative" }}>
            {activeStep < steps.length - 1 && (
              <Button
                onClick={handleNext}
                variant="contained"
                color="primary"
                endIcon={<span>→</span>}
                sx={{
                  background: "linear-gradient(45deg, #0190c3 30%, #07b8dd 90%)",
                  fontWeight: 600,
                }}
              >
                Continue to Next Step
              </Button>
            )}
            {/* <ButtonDecoration isLastStep={false} /> หยุดส่ง isLastStep ตรงนี้ */}
          </Box>
        </NavigationContainer>
        <Box mt={4} sx={{ textAlign: "center" }}>
          <Typography
            component="div" // เปลี่ยน <p> เป็น <div>
            variant="body2"
            color="text.secondary"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <span>
              Step {activeStep + 1} of {steps.length}
            </span>
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              mt: 1,
              fontStyle: "italic",
            }}
          >
            {isLastStep
              ? "Final step - Review your information before submission"
              : `Currently in ${steps[activeStep].label} stage - ${steps[activeStep].description}`}
          </Typography>
        </Box>
        <Box mt={3} sx={{ textAlign: "center" }}>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.grey[500],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
            }}
          >
            <span>Need help?</span>
            <Box
              component="a"
              href="#"
              sx={{
                color: theme.palette.primary.main,
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Contact support
            </Box>
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
};
export default Formdev;