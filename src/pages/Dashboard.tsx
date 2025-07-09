import React, { useState } from "react";
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
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import WarningIcon from "@mui/icons-material/Warning";
import { useNavigate } from "react-router-dom";
import TableDashboard from "../dashboard/TableDashboard";
import SumupForm from "../forms/SumupForm";

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
      light: "#ffebee",
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
// const steps = [
//   { label: "CBAM Dashboard", description: "View your carbon emission data" },
// ];

const Form: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | number | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  // Function to handle editing a specific report
  const handleEditReport = (reportId: string | number) => {
    navigate(`/cbam/formdev?reportId=${reportId}`);
  };

  // Function to handle creating a new report
 const handleCreateNewReport = () => {
  // ✅ Clear CBAM form data เมื่อสร้าง report ใหม่
  const cbamKeys = [
    "reportId",
    "cbamFormData",
    "amountFormData", 
    "goodsFormData",
    "precursorData",
    "precursorId",
    "selectedCnCode",
    "selectedGoods",
    "selectedIndustry",
    "activeTable",
    "selectedCctvIds",
    "selectedNodeIds",
    "searchFilters"
  ];
  
  cbamKeys.forEach((key) => localStorage.removeItem(key));
  
  // Navigate to form page
  navigate("/cbam/formdev");
};

  // Function to initiate delete process
  const handleDeleteReport = (reportId: string | number) => {
    setReportToDelete(reportId);
    setDeleteDialogOpen(true);
  };

  // ✅ Updated delete function with correct API endpoint
  const handleConfirmDelete = async () => {
    if (!reportToDelete) return;

    setIsDeleting(true);

    try {
      // ✅ Updated API endpoint as requested
      const response = await fetch(
        `${apiUrl}/api/cbam/report/del/${reportToDelete}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Delete failed (${response.status}):`, errorText);
        throw new Error(`Failed to delete report: ${errorText}`);
      }

      // Try to parse response as JSON, but don't fail if it's not JSON
      let responseData;
      try {
        const responseText = await response.text();
        if (responseText) {
          responseData = JSON.parse(responseText);
        } else {
        }
      } catch (parseError) {
      }
      // Show success message
      setSnackbarMessage(
        `Report #${reportToDelete} has been deleted successfully`
      );
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      // Close dialog immediately
      setDeleteDialogOpen(false);
      setReportToDelete(null);

      // Refresh the table after a short delay to show the success message
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error("❌ Delete error:", error);
      setSnackbarMessage(`Failed to delete report: ${error.message}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);

      // Keep dialog open on error so user can try again
    } finally {
      setIsDeleting(false);
    }
  };

  // Function to cancel delete
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setReportToDelete(null);
  };

  // Function to close snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

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
        return (
          <TableDashboard
            onEditReport={handleEditReport}
            onDeleteReport={handleDeleteReport}
          />
        );
      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ py: 5 }}>
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
          {renderStepContent(activeStep)}
          {/* </Paper> */}
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
          ></Typography>
        </Box>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={!isDeleting ? handleCancelDelete : undefined} // Prevent closing while deleting
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 1,
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              color: "error.main",
              fontWeight: 600,
            }}
          >
            <WarningIcon fontSize="large" />
            Confirm Delete Report
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ fontSize: "14px", lineHeight: 1.6 }}>
              Are you sure you want to delete{" "}
              <strong>Report #{reportToDelete}</strong>?
            </DialogContentText>
            <Box
              mt={2}
              p={2}
              sx={{
                backgroundColor: "error.light",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "error.main",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "error.main",
                  fontWeight: 500,
                }}
              >
                <DeleteForeverIcon fontSize="large" />
                This action cannot be undone. All data associated with this
                report will be permanently deleted.
              </Typography>
            </Box>

            {/* Show API endpoint being used (for debugging) */}
            {/* {process.env.NODE_ENV === "development" && (
              <Box
                mt={2}
                p={2}
                sx={{
                  backgroundColor: "#f5f5f5",
                  borderRadius: 1,
                  border: "1px solid #ddd",
                }}
              >
                <Typography variant="caption" component="div" fontWeight="bold">
                  🔗 API Endpoint (Development):
                </Typography>
                <Typography
                  variant="caption"
                  component="div"
                  fontFamily="monospace"
                >
                  DELETE {apiUrl}/api/cbam/report/del/{reportToDelete}
                </Typography>
              </Box>
            )} */}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button
              onClick={handleCancelDelete}
              variant="outlined"
              disabled={isDeleting} // Disable during deletion
              sx={{
                borderWidth: 2,
                fontWeight: 600,
                "&:hover": {
                  borderWidth: 2,
                },
                "&:disabled": {
                  borderColor: "#d5d5d5",
                  color: "#939393",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              variant="contained"
              color="error"
              disabled={isDeleting}
              startIcon={isDeleting ? undefined : <DeleteIcon />}
              sx={{
                fontWeight: 600,
                minWidth: 140,
                background: "linear-gradient(45deg, #c72121 30%, #d32f2f 90%)",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #b71c1c 30%, #c72121 90%)",
                },
                "&:disabled": {
                  background: "#d5d5d5",
                  color: "#939393",
                },
              }}
            >
              {isDeleting ? (
                <span
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span>🔄</span> Deleting...
                </span>
              ) : (
                "Delete Report"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success/Error Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbarSeverity}
            variant="filled"
            sx={{
              width: "100%",
              fontWeight: 500,
              borderRadius: 2,
              boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
              "& .MuiAlert-icon": {
                fontSize: "14px",
              },
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>   
      </Container>
    </ThemeProvider>
  );
};

export default Form;
