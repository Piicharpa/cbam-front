import React, { useState, useRef } from "react";
import {
  Container,
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Typography,
  Paper,
  ThemeProvider,
  createTheme,
  StepConnector,
  stepConnectorClasses,
  styled,
  StepIconProps,
  alpha,
  Fade
} from '@mui/material';
import FactoryIcon from '@mui/icons-material/Factory';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CategoryIcon from '@mui/icons-material/Category';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import CalculateIcon from '@mui/icons-material/Calculate';
import WavesIcon from '@mui/icons-material/Waves';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import InstallationForm from "../forms/installationForm";
import VerifierForm from "../forms/VerifierForm";
import GoodsForm from "../forms/GoodsForm";
import PrecursorsForm from "../forms/PrecursorsForm";
import AmountForm from "../forms/AmountForm";
import SourceForm from "../forms/SourceForm";

// Custom theme based on provided colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#0190c3',
      light: '#07b8dd',
      dark: '#0290c4',
    },
    secondary: {
      light: '#f3f7e7',
      main: '#74aa15',
      dark: '#6aaa33',
    },
    error: {
      main: '#c72121',
    },
    warning: {
      main: '#eb810f',
    },
    success: {
      main: '#6aaa33',
    },
    text: {
      primary: '#313837',
      secondary: '#6f6f6f',
    },
    grey: {
      200: '#f7f7f7',
      300: '#d5d5d5',
      500: '#939393',
      700: '#5f5f5f',
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', 'Arial', sans-serif",
    h4: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          boxShadow: '0 4px 10px rgba(1, 144, 195, 0.15)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 12px rgba(1, 144, 195, 0.25)',
          },
        },
        contained: {
          '&.Mui-disabled': {
            backgroundColor: '#d5d5d5',
            color: '#939393',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
});

// Custom connector for stepper
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: `linear-gradient(95deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: `linear-gradient(95deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 4,
    border: 0,
    backgroundColor: theme.palette.grey[300],
    borderRadius: 2,
  },
}));

// Custom step icon
const ColorlibStepIconRoot = styled('div')<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.grey[300],
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'all 0.3s ease',
  ...(ownerState.active && {
    backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
    boxShadow: '0 4px 10px 0 rgba(1, 144, 195, 0.35)',
    transform: 'scale(1.1)',
  }),
  ...(ownerState.completed && {
    backgroundImage: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
  }),
}));

// Step icon component
function ColorlibStepIcon(props: StepIconProps) {
  const { active, completed, className } = props;

  const icons: { [index: string]: React.ReactElement } = {
    1: <FactoryIcon />,
    2: <VerifiedUserIcon />,
    3: <CategoryIcon />,
    4: <SyncAltIcon />,
    5: <CalculateIcon />,
    6: <WavesIcon />,
  };

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {completed ? <CheckCircleIcon /> : icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  );
}

// Steps definition with descriptions
const steps = [
  { label: "Installation", description: "Add installation details" },
  { label: "Verifier", description: "Verification information" },
  { label: "Goods", description: "Product information" },
  { label: "Precursors", description: "Precursor materials" },
  { label: "Amount", description: "Quantity details" },
  { label: "Source", description: "Emission sources" },
];

const Formdev: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  
  // Form refs for submitting
  const installationFormRef = useRef<any>(null);
  const verifierFormRef = useRef<any>(null);
  const goodsFormRef = useRef<any>(null);
  const precursorsFormRef = useRef<any>(null);
  const amountFormRef = useRef<any>(null);
  const sourceFormRef = useRef<any>(null);
  
  // Form data states
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
    total_consumed_within_installation: 0,
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
    produced_for_market_amount: "",
    imported_wgases_amount: "",
    ef_imported_wgases: "",
    exported_wgases_amount: "",
    ef_exported_wgases: "",
    industry_type: "",
    total_production_amounts: ""
  });

  const [precursorsData, setPrecursorsData] = useState({});
  const [amountData, setAmountData] = useState({});
  const [sourceData, setSourceData] = useState({});
  
  // Handle form navigation with animations
  const handleNext = async () => {
    // Attempt to validate current step if needed
    let canProceed = true;
    
    try {
      switch(activeStep) {
        case 0:
          if (installationFormRef.current?.submit) {
            canProceed = await installationFormRef.current.submit();
          }
          break;
        case 1:
          if (verifierFormRef.current?.submit) {
            canProceed = await verifierFormRef.current.submit();
          }
          break;
        case 2:
          if (goodsFormRef.current?.submit) {
            canProceed = await goodsFormRef.current.submit();
          }
          break;
        case 3:
          if (precursorsFormRef.current?.submit) {
            canProceed = await precursorsFormRef.current.submit();
          }
          break;
        case 4:
          if (amountFormRef.current?.submit) {
            canProceed = await amountFormRef.current.submit();
          }
          break;
        case 5:
          if (sourceFormRef.current?.submit) {
            canProceed = await sourceFormRef.current.submit();
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
    // Try to validate the last form first
    if (sourceFormRef.current?.submit) {
      const isValid = await sourceFormRef.current.submit();
      if (!isValid) return;
    }
    
    const allData = {
      installationData,
      verifierData,
      goodsData,
      precursorsData,
      amountData,
      sourceData,
    };
    
    console.log('📦 Submitting all form data:', allData);
    
    // Show success message with animation
    setFadeIn(false);
    setTimeout(() => {
      alert('✅ Form submitted successfully!');
      setFadeIn(true);
    }, 300);
  };
  
  // Get the current step's form ref
  const getCurrentRef = () => {
    switch(activeStep) {
      case 0: return installationFormRef;
      case 1: return verifierFormRef;
      case 2: return goodsFormRef;
      case 3: return precursorsFormRef;
      case 4: return amountFormRef;
      case 5: return sourceFormRef;
      default: return null;
    }
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
  
  // Calculate overall progress
  const progress = ((activeStep + 1) / steps.length) * 100;
  
  return (

     <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        {/* Header Banner */}
        <Paper elevation={0} sx={{ 
          p: 4, 
          mb: 4, 
          background: 'linear-gradient(to right, #f3f7e7, #e7f9cd)',
          borderLeft: '6px solid #74aa15',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{
            position: 'absolute',
            top: '-15px',
            right: '-15px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(7,184,221,0.1) 0%, rgba(1,144,195,0) 70%)',
            zIndex: 0
          }} />
          
          <Typography variant="h4" color="primary.main" gutterBottom sx={{ position: 'relative', zIndex: 1 }}>
            CBAM Declaration Form
          </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ position: 'relative', zIndex: 1 }}>
            Complete all steps to submit your declaration for the Carbon Border Adjustment Mechanism
          </Typography>
        </Paper>
        
        {/* Enhanced Stepper */}
        <Paper elevation={1} sx={{ 
          p: 4, 
          mb: 4, 
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '10%',
            right: '10%',
            height: '4px',
            background: `linear-gradient(to right, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} ${progress}%, ${theme.palette.grey[300]} ${progress}%, ${theme.palette.grey[300]} 100%)`,
            borderRadius: '2px',
            transition: 'all 0.4s ease'
          }
        }}>
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
                      color: activeStep === index 
                        ? 'primary.main' 
                        : index < activeStep 
                          ? 'secondary.main' 
                          : 'text.primary'
                    }}
                  >
                    {step.label}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block',
                      color: 'text.secondary'
                    }}
                  >
                    {step.description}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

      {/* 🟢 Form content */}
      <Fade in={fadeIn} timeout={500}>
          <Box sx={{ minHeight: '450px', position: 'relative' }}>
            {/* Decorative elements */}
            <Box sx={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(231,249,205,0.5) 0%, rgba(243,247,231,0) 70%)',
              zIndex: 0
            }} />
            
            <Box sx={{
              position: 'absolute',
              bottom: '30px',
              left: '10px',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(7,184,221,0.1) 0%, rgba(1,144,195,0) 70%)',
              zIndex: 0
            }} />
            
            {/* Content paper with subtle pattern */}
            <Paper 
              elevation={1} 
              sx={{
                p: 4,
                position: 'relative',
                overflow: 'hidden',
                minHeight: '450px',
                zIndex: 1,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '6px',
                  background: 'linear-gradient(90deg, #0190c3, #07b8dd)'
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundImage: 'radial-gradient(#f3f7e7 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                  opacity: 0.3,
                  pointerEvents: 'none',
                  zIndex: 0
                }
              }}
            >
              {renderStepContent(activeStep)}
            </Paper>
          </Box>
        </Fade>

      {/* 🔘 Navigation buttons */}
       <Box 
          mt={4} 
          display="flex" 
          justifyContent="space-between"
          sx={{
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-20px',
              left: '20%',
              right: '20%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, #d5d5d5, transparent)'
            }
          }}
        >
        <React.Fragment>
          <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined">
            Back
          </Button>
          <Box sx={{ position: 'relative' }}>
            {activeStep === steps.length - 1 ? (
              <Button 
                onClick={handleSubmit} 
                variant="contained" 
                color="secondary"
                endIcon={<CheckCircleIcon />}
                sx={{ 
                  px: 4,
                  background: 'linear-gradient(45deg, #74aa15 30%, #6aaa33 90%)',
                  fontWeight: 600,
                  letterSpacing: '0.5px'
                }}
              >
                Submit Declaration
              </Button>
            ) : (
              <Button 
                onClick={handleNext} 
                variant="contained" 
                color="primary"
                endIcon={<span>→</span>}
                sx={{ 
                  background: 'linear-gradient(45deg, #0190c3 30%, #07b8dd 90%)',
                  fontWeight: 600
                }}
              >
                Continue to Next Step
              </Button>
            )}
            
            {/* Decorative dots around the main button */}
            <Box 
              sx={{
                position: 'absolute',
                width: '140%',
                height: '140%',
                top: '-20%',
                left: '-20%',
                pointerEvents: 'none',
                opacity: 0.5,
                zIndex: -1,
                '&::before, &::after': {
                  content: '""',
                  position: 'absolute',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: activeStep === steps.length - 1 ? '#74aa15' : '#0190c3',
                  opacity: 0.3
                },
                '&::before': { top: '10%', right: '5%' },
                '&::after': { bottom: '10%', left: '5%' }
              }}
            />
          </Box>
        </React.Fragment>
        </Box>
        
        {/* Progress indicator */}
        <Box mt={4} sx={{ textAlign: 'center' }}>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1
            }}
          >
            <span>Step {activeStep + 1} of {steps.length}</span>
            <Box 
              component="span" 
              sx={{ 
                display: 'inline-block',
                                width: '50px', 
                height: '4px', 
                borderRadius: '2px',
                backgroundColor: '#d5d5d5',
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${(activeStep + 1) / steps.length * 100}%`,
                  backgroundColor: activeStep === steps.length - 1 ? '#74aa15' : '#0190c3',
                  borderRadius: '2px',
                  transition: 'width 0.3s ease'
                }
              }}
            />
          </Typography>
          
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ 
              display: 'block',
              mt: 1,
              fontStyle: 'italic'
            }}
          >
            {activeStep === steps.length - 1 ? 
              "Final step - Review your information before submission" : 
              `Currently in ${steps[activeStep].label} stage - ${steps[activeStep].description}`
            }
          </Typography>
        </Box>

        {/* Help text */}
        <Box mt={3} sx={{ textAlign: 'center' }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.grey[500],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5
            }}
          >
            <span>Need help?</span>
            <Box 
              component="a" 
              href="#" 
              sx={{ 
                color: theme.palette.primary.main,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
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