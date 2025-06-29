import React, { useState, useEffect } from "react";
import { Container, Typography, Grid, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import Section from "../components/Section";
import PGButton from "../components/FormButton";
import Source_sec1, { ProcessEmissionSection } from "./formsections/Source/Source_sec1";
import Source_sec2 from "./formsections/Source/Source_sec2";

interface EmissionFormProps {
  formValues: {
    generatl_info_on_data_quality?: string;
    justification_for_use_default_values?: string;
    manual_fuel_balance?: string;
    manual_GHG_emissions_balance?: string;
    info_qty_assurance?: string;
  };
  onChange?: (formValues: EmissionFormProps["formValues"]) => void;
  onNextStep?: () => void;
}

const EmissionForm: React.FC<EmissionFormProps> = ({
  formValues: externalFormValues = {},
  onChange,
  onNextStep,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const reportId = 1; // Placeholder for demonstration
  const apiUrl = process.env.REACT_APP_API_URL;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState({
    // Initialize form values
    reportId: "",
    manual_fuel_balance: externalFormValues.manual_fuel_balance || "",
    manual_GHG_emissions_balance: externalFormValues.manual_GHG_emissions_balance || "",
    generatl_info_on_data_quality: externalFormValues.generatl_info_on_data_quality || "",
    justification_for_use_default_values: externalFormValues.justification_for_use_default_values || "",
    information_quality_ssurance: externalFormValues.info_qty_assurance || "",
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Effect to check for missing reportId
  useEffect(() => {
    if (!reportId) {
      console.error("Missing reportId");
      alert("Please select a report first.");
    }
  }, [reportId]);

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Form validation function
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    const requiredFields = [
      "manual_fuel_balance",
      "manual_GHG_emissions_balance",
      "generatl_info_on_data_quality",
      "justification_for_use_default_values",
      "information_quality_ssurance",
    ];

    requiredFields.forEach((field) => {
      if (!formValues[field as keyof typeof formValues]) {
        newErrors[field] = "This field is required";
      }
    });

    // If there are validation errors, set the errors and return false
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return false;
    }
    
    return true;
  };

  // Prepare the payload
  const constructPayload = () => {
    return {
      report_id: reportId,
      generatl_info_on_data_quality: formValues.generatl_info_on_data_quality,
      justification_for_use_default_values: formValues.justification_for_use_default_values,
      manual_fuel_balance: formValues.manual_fuel_balance,
      manual_GHG_emissions_balance: formValues.manual_GHG_emissions_balance,
      info_qty_assurance: formValues.information_quality_ssurance,
    };
  };

  // API submission function
  const submitData = async (payload: any) => {
    const response = await fetch(`${apiUrl}/api/cbam/c_emission`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Submission error: ${errorText}`);
    }
    return response.json(); // Return response if needed
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent multiple submissions

    setIsSubmitting(true);

    // Validate form before submitting
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    const payload = constructPayload();

    try {
      await submitData(payload);
      alert("✅ Data submitted successfully");
      navigate(`/report?reportId=${reportId}`);
    } catch (error: any) {
      console.error("Submission error:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <form onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3} alignItems="stretch">
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="#1976d2">
              Installation's emission at source stream and emission source level
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              การปล่อยก๊าซเรือนกระจกของสถานประกอบการ
            </Typography>
          </Box>

          {/* SECTION 2: Installation-level GHG emissions and energy consumption */}
          <Section
            title="(d) Installation-level GHG emissions and energy consumption"
            subtitle="การปล่อยก๊าซเรือนกระจกและการใช้พลังงานของสถานประกอบการ"
            defaultExpanded
          >
            <Source_sec2
              formValues={formValues}
              formErrors={formErrors}
              handleInputChange={handleInputChange}
              setFormValues={setFormValues}
              setFormErrors={setFormErrors}
            />
          </Section>

          {/* Submit Button */}
          <PGButton />
        </Grid>
      </form>
    </Container>
  );
};

export default EmissionForm;