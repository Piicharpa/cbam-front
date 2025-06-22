import React, { useState  } from "react";
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
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TableDashboard from "../dashboard/TableDashboard";
import SumupForm from "../dashboard/SumupForm";

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
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "10px 24px",
          boxShadow: "0 4px 10px rgba(1, 144, 195, 0.15)",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 6px 12px rgba(1, 144, 195, 0.25)",
          },
        },
        contained: {
          "&.Mui-disabled": {
            backgroundColor: "#d5d5d5",
            color: "#939393",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.06)",
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
      backgroundImage: `linear-gradient(95deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
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
const ColorlibStepIconRoot = styled("div")<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.grey[300],
  zIndex: 1,
  color: "#fff",
  width: 50,
  height: 50,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  transition: "all 0.2s ease",
  ...(ownerState.active && {
    backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
    boxShadow: "0 4px 10px 0 rgba(1, 144, 195, 0.35)",
    transform: "scale(1.1)",
  }),
  ...(ownerState.completed && {
    backgroundImage: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
  }),
}));

// Step icon component
function ColorlibStepIcon(props: StepIconProps) {
  const { active, completed, className } = props;

  const icons: { [index: string]: React.ReactElement } = {
    1: <BarChartIcon />,
    // 2: <DescriptionIcon />,
  };

  return (
    <ColorlibStepIconRoot
      ownerState={{ completed, active }}
      className={className}
    >
      {completed ? <CheckCircleIcon /> : icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  );
}

// Steps definition
const steps = [
  { label: "CBAM Dashboard", description: "View your carbon emission data" },
  // { label: "Summary Form", description: "Review and submit your information" },
];

const Form: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = () => {
    // Do submit logic here!
    alert("Form submitted!");
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <TableDashboard />;
      // case 1:
      //   return <SumupForm />;
      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            background: "linear-gradient(to right, #f3f7e7, #e7f9cd)",
            borderLeft: "6px solid #74aa15",
          }}
        >
          <Typography variant="h4" color="primary.main" gutterBottom>
            CBAM Declaration
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Complete the steps below to submit your carbon border adjustment
            mechanism declaration
          </Typography>
        </Paper>

        {/* Enhanced Stepper */}
        <Paper elevation={1} sx={{ p: 4, mb: 4, position: "relative" }}>
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
                      color:
                        activeStep === index ? "primary.main" : "text.primary",
                    }}
                  >
                    {step.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      color: "text.secondary",
                    }}
                  >
                    {step.description}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Form content with animation */}
        <Box
          sx={{
            mt: 4,
            mb: 4,
            minHeight: "400px",
            position: "relative",
            animation: "fadeIn 0.4s ease-in-out",
            "@keyframes fadeIn": {
              "0%": {
                opacity: 0,
                transform: "translateY(10px)",
              },
              "100%": {
                opacity: 1,
                transform: "translateY(0)",
              },
            },
          }}
        >
          {/* Content paper with subtle pattern */}
          <Paper
            elevation={1}
            sx={{
              p: 4,
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "6px",
                background: "linear-gradient(90deg, #0190c3, #07b8dd)",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundImage:
                  "radial-gradient(#f3f7e7 1px, transparent 1px)",
                backgroundSize: "20px 20px",
                opacity: 0.3,
                pointerEvents: "none",
              },
            }}
          >
            {renderStepContent(activeStep)}
          </Paper>
        </Box>

        {/* Navigation buttons with enhanced styling */}
        <Box
          mt={4}
          display="flex"
          justifyContent="space-between"
          sx={{
            position: "relative",
            "::before": {
              content: '""',
              position: "absolute",
              top: "-20px",
              left: "20%",
              right: "20%",
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, #d5d5d5, transparent)",
            },
          }}
        >
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
            startIcon={<span>←</span>}
            sx={{
              borderWidth: "2px",
              "&:not(:disabled)": {
                borderColor: "primary.main",
                color: "primary.main",
              },
            }}
          >
            Back
          </Button>

          <Box sx={{ position: "relative" }}>
            {activeStep === steps.length - 1 ? (
              <Button
                onClick={handleSubmit}
                variant="contained"
                color="secondary"
                endIcon={<CheckCircleIcon />}
                sx={{
                  px: 4,
                  background:
                    "linear-gradient(45deg, #74aa15 30%, #6aaa33 90%)",
                  fontWeight: 600,
                  letterSpacing: "0.5px",
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
                  background:
                    "linear-gradient(45deg, #0190c3 30%, #07b8dd 90%)",
                  fontWeight: 600,
                }}
              >
                Continue to Next Step
              </Button>
            )}

            {/* Decorative dots around the main button */}
            <Box
              sx={{
                position: "absolute",
                width: "140%",
                height: "140%",
                top: "-20%",
                left: "-20%",
                pointerEvents: "none",
                opacity: 0.5,
                zIndex: -1,
                "&::before, &::after": {
                  content: '""',
                  position: "absolute",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background:
                    activeStep === steps.length - 1 ? "#74aa15" : "#0190c3",
                  opacity: 0.3,
                },
                "&::before": { top: "10%", right: "5%" },
                "&::after": { bottom: "10%", left: "5%" },
              }}
            />
          </Box>
        </Box>

        {/* Progress indicator */}
        <Box mt={4} sx={{ textAlign: "center" }}>
          <Typography
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
            <Box
              component="span"
              sx={{
                display: "inline-block",
                width: "50px",
                height: "4px",
                borderRadius: "2px",
                backgroundColor: "#d5d5d5",
                position: "relative",
                overflow: "hidden",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: `${((activeStep + 1) / steps.length) * 100}%`,
                  backgroundColor:
                    activeStep === steps.length - 1 ? "#74aa15" : "#0190c3",
                  borderRadius: "2px",
                  transition: "width 0.3s ease",
                },
              }}
            />
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Form;
