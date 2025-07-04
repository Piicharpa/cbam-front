import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // เพิ่ม useNavigate
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

// ตรวจสอบว่า steps มีค่าหรือไม่ และสร้าง fallback steps หากไม่มี
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
  const navigate = useNavigate(); // เพิ่มการใช้ useNavigate
  const [activeStep, setActiveStep] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  // สร้างตัวแปรเพื่อเก็บ reportId จาก local storage หรือกำหนดค่าเริ่มต้น
  const [reportId, setReportId] = useState<number | null>(null);

  // ใช้ useEffect เพื่อโหลด reportId จาก localStorage และเก็บไว้ในสเตท
  useEffect(() => {
    const storedReportId = localStorage.getItem('cbam_report_id');
    if (storedReportId) {
      setReportId(parseInt(storedReportId, 10));
    } else {
      // ถ้าไม่มี reportId ใน localStorage กำหนดค่าเริ่มต้น
      setReportId(54); // หรือค่าที่เหมาะสมกับแอปของคุณ
    }
  }, []);

  // ตรวจสอบ steps ก่อนใช้งาน
  const [safeSteps, setSafeSteps] = useState(fallbackSteps);
  
  useEffect(() => {
    // ตรวจสอบว่า steps ที่นำเข้ามามีค่าหรือไม่
    if (steps && Array.isArray(steps) && steps.length > 0) {
      console.log("Using imported steps", steps);
      setSafeSteps(steps);
    } else {
      console.warn("Imported steps is invalid or empty, using fallback steps");
      setSafeSteps(fallbackSteps);
    }
  }, []);

  // Form refs for submitting
  const SumupFormRef = useRef<any>(null);
  const installationFormRef = useRef<any>(null);
  const verifierFormRef = useRef<any>(null);
  const goodsFormRef = useRef<any>(null);
  const precursorsFormRef = useRef<any>(null);
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
            
            // ถ้านี่เป็นขั้นตอนสุดท้ายและดำเนินการสำเร็จ นำทางไปยังหน้า report
            if (canProceed && reportId) {
              navigate(`/cbam/report?reportId=${reportId}`);
              return;
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
    
    const allData = {
      sumupData,
      installationData,
      verifierData,
      goodsData,
      precursorsData,
      sourceData,
      emissionData
    };
    
    setFadeIn(false);
    setTimeout(() => {
      alert("✅ Form submitted successfully!");
      setFadeIn(true);
      
      // หลังจากส่งฟอร์มสำเร็จ นำทางไปยังหน้า report ถ้ามี reportId
      if (reportId) {
        navigate(`/report?reportId=${reportId}`);
      }
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
            // ref={SumupFormRef}
          />
        );
      case 1:
        return (
          <InstallationForm
            data={installationData}
            onChange={setInstallationData}
            onNextStep={handleNext}
            // ref={installationFormRef}
          />
        );
      case 2:
        return (
          <VerifierForm
            data={verifierData}
            onChange={setVerifierData}
            onNextStep={handleNext}
            // ref={verifierFormRef}
          />
        );
      case 3:
        return (
          <GoodsForm
            formValues={goodsData}
            onChange={setGoodsData}
            onNextStep={handleNext}
            // ref={goodsFormRef}
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
            // ref={precursorsFormRef}
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
            // ref={sourceFormRef}
          />
        );
      case 6:
        return (
          <EmissionForm
            formValues={emissionData} // แก้ไขให้ใช้ emissionData แทน sourceData
            onChange={(formValues) =>
              setEmissionData((prev) => ({
                ...prev,
                ...Object.fromEntries(
                  Object.entries(formValues).map(([k, v]) => [k, v ?? ""])
                ),
              }))
            }
            onNextStep={handleNext}
            // ref={emissionFormRef}
          />
        );
        //     default:
        // return <Typography>Unknown step</Typography>;
    }
  };

  // คำนวณความคืบหน้าโดยใช้ safeSteps แทน steps เพื่อป้องกัน error
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
          
          {reportId && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ position: "relative", zIndex: 1, display: 'block', mt: 1 }}
            >
              Report ID: {reportId}
            </Typography>
          )}
        </HeaderBanner>

        <StepperContainer elevation={1} progress={progress}>
          <Stepper
            alternativeLabel
            activeStep={activeStep}
            connector={<ColorlibConnector />}
          >
            {/* ใช้ safeSteps ที่ตรวจสอบแล้วว่าไม่เป็น undefined และใช้ optional chaining */}
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
                    {/* ใช้ optional chaining เพื่อป้องกัน undefined */}
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
                    {/* ใช้ optional chaining เพื่อป้องกัน undefined */}
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
                  background: "linear-gradient(45deg, #0190c3 30%, #07b8dd 90%)",
                  fontWeight: 600,
                }}
              >
                Continue to Next Step
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                variant="contained"
                color="primary"
                sx={{
                  background: "linear-gradient(45deg, #0190c3 30%, #07b8dd 90%)",
                  fontWeight: 600,
                }}
              >
                Submit Final Form
              </Button>
            )}
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
            {/* ใช้ optional chaining เพื่อป้องกัน undefined */}
            {isLastStep
              ? "Final step - Review your information before submission"
              : `Currently in ${safeSteps[activeStep]?.label || `Step ${activeStep + 1}`} stage - ${safeSteps[activeStep]?.description || ""}`}
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

        {/* ส่วนแสดงข้อมูลเพื่อการดีบัก (เฉพาะโหมดพัฒนา) */}
        {process.env.NODE_ENV === 'development' && (
          <Box mt={4} p={2} sx={{ backgroundColor: '#f5f5f5', borderRadius: 2, fontSize: '0.75rem' }}>
            <Typography variant="subtitle2" gutterBottom>Debug Information</Typography>
            <Box>
              <Typography variant="body2">Active Step: {activeStep}</Typography>
              <Typography variant="body2">Report ID: {reportId}</Typography>
              <Typography variant="body2">Steps Count: {safeSteps.length}</Typography>
              <Typography variant="body2">Progress: {progress.toFixed(1)}%</Typography>
            </Box>
            <Box mt={1}>
              <details>
                <summary>Steps Structure</summary>
                <pre style={{ overflow: 'auto', maxHeight: '200px' }}>
                  {JSON.stringify(safeSteps, null, 2)}
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