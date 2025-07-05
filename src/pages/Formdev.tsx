import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
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
import SumupForm from "../forms/SumupForm";
import { Theme } from "@mui/material/styles";
import EmissionForm from "../forms/EmissionForm";

const StyledBox = styled(Box)(({ theme }: { theme: Theme }) => ({
  width: "100%",
  height: "4px",
  backgroundColor: theme.palette.divider,
  transition: "background-color 0.3s ease",
}));

// Fallback steps if imported steps aren't available
const fallbackSteps = [
  { label: "Summary", description: "สรุปข้อมูล" },
  { label: "Installation", description: "รายละเอียดสถานที่ติดตั้ง" },
  { label: "Verifier", description: "ข้อมูลผู้ตรวจสอบ" },
  { label: "Goods", description: "ข้อมูลสินค้า" },
  { label: "Precursors", description: "วัตถุดิบตั้งต้น" },
  { label: "Source", description: "แหล่งที่มา" },
  { label: "Emission", description: "การปล่อยมลพิษ" },
];

const Formdev: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [activeStep, setActiveStep] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  // State for tracking reportId and edit mode
  const [reportId, setReportId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Safe steps state
  const [safeSteps, setSafeSteps] = useState(fallbackSteps);

  // Check for reportId in URL query parameter and update localStorage
  useEffect(() => {
    // Get reportId from URL query params if present
    const queryReportId = searchParams.get("reportId");

    if (queryReportId) {
      // If reportId is in URL, store it in localStorage
      const parsedId = parseInt(queryReportId, 10);
      localStorage.setItem("cbam_report_id", queryReportId);
      setReportId(parsedId);
      setIsEditMode(true);
      console.log(
        `⚡ Edit mode activated for report ID: ${parsedId}, stored in localStorage`
      );
    } else {
      // If not in URL, check localStorage
      const storedReportId = localStorage.getItem("cbam_report_id");
      if (storedReportId) {
        setReportId(parseInt(storedReportId, 10));
        setIsEditMode(true);
        console.log(`📋 Using report ID from localStorage: ${storedReportId}`);
      } else {
        // No reportId available - we're in create mode
        localStorage.removeItem("cbam_report_id"); // Clear any previous value
        setReportId(null);
        setIsEditMode(false);
        console.log("✨ Create mode - no report ID available");
      }
    }
  }, [searchParams]);

  // Initialize steps
  useEffect(() => {
    // Check if imported steps are valid
    if (steps && Array.isArray(steps) && steps.length > 0) {
      console.log("Using imported steps", steps);
      setSafeSteps(steps);
    } else {
      console.warn("Imported steps is invalid or empty, using fallback steps");
      setSafeSteps(fallbackSteps);
    }
  }, []);

  // Form refs for submitting
  const sumupFormRef = useRef<any>(null);
  const installationFormRef = useRef<any>(null);
  const verifierFormRef = useRef<any>(null);
  const goodsFormRef = useRef<any>(null);
  const precursorsFormRef = useRef<any>(null);
  const sourceFormRef = useRef<any>(null);
  const emissionFormRef = useRef<any>(null);

  // Form data states
  const [sumupData, setSumupData] = useState({
    // reportId: 0,
    industry_id: "",
    goods_id: "",
    cn_id: "",
  });

  const [installationData, setInstallationData] = useState({
    reportId: 0,
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
    reportId: 0,
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
    routes: [] as string[],
    amounts: [] as string[],
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
    reportId: 0,
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
    reportId: 0,
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
    reportId: 0,
    generatl_info_on_data_quality: "",
    justification_for_use_default_values: "",
    manual_fuel_balance: "",
    manual_GHG_emissions_balance: "",
    info_qty_assurance: "",
  });

  // Update form data with reportId when it changes
  useEffect(() => {
    if (reportId) {
      console.log(`Updating form data states with reportId: ${reportId}`);
      setSumupData((prev) => ({ ...prev, reportId }));
      setInstallationData((prev) => ({ ...prev, reportId }));
      setVerifierData((prev) => ({ ...prev, reportId }));
      setGoodsData((prev) => ({ ...prev, report_id: reportId }));
      setPrecursorsData((prev) => ({ ...prev, reportId }));
      setSourceData((prev) => ({ ...prev, reportId }));
      setEmissionData((prev) => ({ ...prev, reportId }));
    }
  }, [reportId]);

  // Handle form navigation with animations
  const handleNext = async () => {
    let canProceed = true;
    try {
      switch (activeStep) {
        case 0:
          if (sumupFormRef.current?.submit) {
            canProceed = await sumupFormRef.current.submit();
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

            // If this is the last step and submission is successful, navigate to report
            if (canProceed) {
              const currentReportId = localStorage.getItem("cbam_report_id");
              if (currentReportId) {
                navigate(`/cbam/report?reportId=${currentReportId}`);
                return;
              }
            }
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

    setFadeIn(false);
    setTimeout(() => {
      alert("✅ Form submitted successfully!");
      setFadeIn(true);

      // After successful form submission, navigate to report page
      const currentReportId = localStorage.getItem("cbam_report_id");
      if (currentReportId) {
        navigate(`/cbam/report?reportId=${currentReportId}`);
      }
    }, 300);
  };

  // Render the current step content without passing reportId as prop
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <SumupForm
            data={{
              // reportId: 0, // Note: Will actually use reportId from localStorage
              industry_id: sumupData.industry_id,
              goods_id: sumupData.goods_id,
              cn_id: sumupData.cn_id,
            }}
            onChange={setSumupData}
            onNextStep={handleNext}
            // Not passing reportId - component will get from localStorage
            // ref={sumupFormRef}
          />
        );
      case 1:
        return (
          <InstallationForm
            data={installationData} // Just pass the entire object as is
            onChange={setInstallationData}
            onNextStep={handleNext}
            // Not passing reportId - component will get from localStorage
            // ref={installationFormRef}
          />
        );
      case 2:
        return (
          <VerifierForm
            data={{
              // reportId: 0, // Note: Will actually use reportId from localStorage
              ...verifierData,
            }}
            onChange={setVerifierData}
            onNextStep={handleNext}
            // Not passing reportId - component will get from localStorage
            // ref={verifierFormRef}
          />
        );
      case 3:
        return (
          <GoodsForm
            formValues={{
              // reportId: 0, // Note: Will actually use reportId from localStorage
              ...goodsData,
            }}
            onChange={setGoodsData}
            onNextStep={handleNext}
            // Not passing reportId - component will get from localStorage
            // ref={goodsFormRef}
          />
        );
      case 4:
        return (
          <PrecursorsForm
            formValues={{
              // reportId: 0, // Note: Will actually use reportId from localStorage
              ...precursorsData,
            }}
            onChange={(formValues) =>
              setPrecursorsData((prev) => ({
                ...prev,
                ...Object.fromEntries(
                  Object.entries(formValues).map(([k, v]) => [
                    k,
                    v ??
                      (typeof prev[k as keyof typeof prev] === "number"
                        ? 0
                        : ""),
                  ])
                ),
              }))
            }
            onNextStep={handleNext}
            // Not passing reportId - component will get from localStorage
            // ref={precursorsFormRef}
          />
        );
      case 5:
        return (
          <SourceForm
            formValues={{
              // reportId: 0, // Note: Will actually use reportId from localStorage
              ...sourceData,
            }}
            onChange={(formValues) =>
              setSourceData((prev) => ({
                ...prev,
                ...Object.fromEntries(
                  Object.entries(formValues).map(([k, v]) => [k, v ?? ""])
                ),
              }))
            }
            onNextStep={handleNext}
            // Not passing reportId - component will get from localStorage
            // ref={sourceFormRef}
          />
        );
      case 6:
        return (
          <EmissionForm
            formValues={{
              // reportId: 0, // Note: Will actually use reportId from localStorage
              ...emissionData,
            }}
            onChange={(formValues) =>
              setEmissionData((prev) => ({
                ...prev,
                ...Object.fromEntries(
                  Object.entries(formValues).map(([k, v]) => [k, v ?? ""])
                ),
              }))
            }
            onNextStep={handleNext}
            // Not passing reportId - component will get from localStorage
            // ref={emissionFormRef}
          />
        );
      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  // Calculate progress based on active step
  const progress = ((activeStep + 1) / safeSteps.length) * 100;
  const isLastStep = activeStep === safeSteps.length - 1;

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
            {isEditMode ? "Edit CBAM Report" : "CBAM Declaration Form"}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ position: "relative", zIndex: 1 }}
          >
            {isEditMode
              ? "Make changes to your Carbon Border Adjustment Mechanism declaration"
              : "Complete all steps to submit your declaration for the Carbon Border Adjustment Mechanism"}
          </Typography>

          {reportId && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ position: "relative", zIndex: 1, display: "block", mt: 1 }}
            >
              Report ID: {reportId} {isEditMode ? "(Edit Mode)" : ""}
            </Typography>
          )}
        </HeaderBanner>

        <StepperContainer elevation={1} progress={progress}>
          <Stepper
            alternativeLabel
            activeStep={activeStep}
            connector={<ColorlibConnector />}
          >
            {safeSteps.map((step, index) => (
              <Step key={step?.label ? step.label : `step-${index}`}>
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
                    {step?.label || `Step ${index + 1}`}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      color: "text.secondary",
                      fontSize: 12,
                    }}
                  >
                    {step?.description || ""}
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
            {activeStep < safeSteps.length - 1 ? (
              <Button
                onClick={handleNext}
                variant="contained"
                color="primary"
                endIcon={<span>→</span>}
                sx={{
                  background:
                    "linear-gradient(45deg, #0190c3 30%, #07b8dd 90%)",
                  fontWeight: 600,
                }}
              >
                Continue to Next Step
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                variant="contained"
                color="secondary"
                endIcon={<span>✓</span>}
                sx={{
                  background:
                    "linear-gradient(45deg, #74aa15 30%, #6aaa33 90%)",
                  fontWeight: 600,
                }}
              >
                {isEditMode ? "Update Report" : "Submit Report"}
              </Button>
            )}
             <ButtonDecoration isLastStep={isLastStep} />
          </Box>
        </NavigationContainer>

        <Box mt={4} sx={{ textAlign: "center" }}>
          <Typography
            component="div"
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
              Step {activeStep + 1} of {safeSteps.length}
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
              : `Currently in ${
                  safeSteps[activeStep]?.label || `Step ${activeStep + 1}`
                } stage - ${safeSteps[activeStep]?.description || ""}`}
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

        {/* Cancel editing button - only show in edit mode */}
        {isEditMode && (
          <Box mt={2} sx={{ textAlign: "center" }}>
            <Button
              variant="text"
              color="error"
              onClick={() => {
                // Clear localStorage and redirect to form
                localStorage.removeItem("cbam_report_id");
                navigate("/cbam/formdev");
              }}
              sx={{ fontSize: "0.8rem" }}
            >
              Cancel editing
            </Button>
          </Box>
        )}

        {/* Debug information - only in development */}
        {process.env.NODE_ENV === "development" && (
          <Box
            mt={4}
            p={2}
            sx={{
              backgroundColor: "#f5f5f5",
              borderRadius: 2,
              fontSize: "0.75rem",
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Debug Information
            </Typography>
            <Box>
              <Typography variant="body2">Active Step: {activeStep}</Typography>
              <Typography variant="body2">Report ID: {reportId}</Typography>
              <Typography variant="body2">
                Is Edit Mode: {isEditMode ? "Yes" : "No"}
              </Typography>
              <Typography variant="body2">
                LocalStorage Report ID:{" "}
                {localStorage.getItem("cbam_report_id") || "not set"}
              </Typography>
              <Typography variant="body2">
                Steps Count: {safeSteps.length}
              </Typography>
              <Typography variant="body2">
                Progress: {progress.toFixed(1)}%
              </Typography>
            </Box>

            <Box mt={1}>
              <details>
                <summary>Steps Structure</summary>
                <pre style={{ overflow: "auto", maxHeight: "200px" }}>
                  {JSON.stringify(safeSteps, null, 2)}
                </pre>
              </details>
            </Box>

            <Box mt={1}>
              <details>
                <summary>Form Data</summary>
                <pre style={{ overflow: "auto", maxHeight: "200px" }}>
                  {JSON.stringify(
                    {
                      sumupData,
                      installationData,
                      verifierData,
                      goodsData,
                      precursorsData,
                      sourceData,
                      emissionData,
                    },
                    null,
                    2
                  )}
                </pre>
              </details>
            </Box>
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default Formdev;
