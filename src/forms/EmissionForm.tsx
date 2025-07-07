import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  Grid,
  Box,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import Section from "../components/Section";
import PGButton from "../components/FormButton";
import Source_sec2 from "./formsections/Source/Source_sec2";

// Define an interface for the expected API response structure
// interface EmissionApiResponse {
//   id?: number;
//   report_id?: number;
//   generatl_info_on_data_quality?: string;
//   justification_for_use_default_values?: string;
//   manual_fuel_balance?: string | number;
//   manual_GHG_emissions_balance?: string | number;
//   info_qty_assurance?: string;
//   [key: string]: any; // Allow other fields
// }

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

  // Get reportId from query parameters, localStorage or use default

  // const reportId = 54 ;
  const reportId = localStorage.getItem("reportId");
  const apiUrl = process.env.REACT_APP_API_URL || "http://178.128.123.212:5000";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState<any>(null);
  const [dataFetched, setDataFetched] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // State สำหรับค่าในฟอร์มที่จะแสดงผล
  const [formValues, setFormValues] = useState({
    reportId: reportId || "", // Convert null to empty string to satisfy type requirements
    manual_fuel_balance: "",
    manual_GHG_emissions_balance: "",
    generatl_info_on_data_quality: "",
    justification_for_use_default_values: "",
    information_quality_ssurance: "", // รับค่า info_qty_assurance จาก API
  });

  const formInitializedRef = useRef(false);

  // ฟังก์ชันดึงข้อมูลจาก API ที่ปรับปรุงแล้ว
  // Fix for fetching and handling the emission data
  const fetchEmissionData = async () => {
    if (!reportId) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/api/cbam/c_emission/report/${reportId}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          setApiData(null);
          return;
        }
        throw new Error(
          `Failed to fetch data: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // Handle the array response - use the most recent entry (last in the array)
      if (Array.isArray(data) && data.length > 0) {
        // Sort by id in descending order to get the most recent entry
        const mostRecentEntry = [...data].sort((a, b) => b.id - a.id)[0];
        setApiData(mostRecentEntry);

        // Update form values with the most recent data
        setFormValues({
          reportId: reportId?.toString() || "", // Ensure string type
          manual_fuel_balance:
            mostRecentEntry.manual_fuel_balance?.toString() || "",
          manual_GHG_emissions_balance:
            mostRecentEntry.manual_GHG_emissions_balance?.toString() || "",
          generatl_info_on_data_quality:
            mostRecentEntry.generatl_info_on_data_quality || "",
          justification_for_use_default_values:
            mostRecentEntry.justification_for_use_default_values || "",
          information_quality_ssurance:
            mostRecentEntry.info_qty_assurance || "",
        });
      } else if (!Array.isArray(data) && data) {
        // Handle case where API returns a single object
        setApiData(data);
        setFormValues({
          reportId: reportId.toString(),
          manual_fuel_balance: data.manual_fuel_balance?.toString() || "",
          manual_GHG_emissions_balance:
            data.manual_GHG_emissions_balance?.toString() || "",
          generatl_info_on_data_quality:
            data.generatl_info_on_data_quality || "",
          justification_for_use_default_values:
            data.justification_for_use_default_values || "",
          information_quality_ssurance: data.info_qty_assurance || "",
        });
      } else {
        setApiData(null);
      }
    } catch (error) {
      console.error("❌ Error fetching emission data:", error);
    } finally {
      setIsLoading(false);
      setDataFetched(true);
    }
  };

  // Effect สำหรับการดึงข้อมูลครั้งแรกเมื่อคอมโพเนนต์โหลด
  useEffect(() => {
    if (!formInitializedRef.current) {
      fetchEmissionData();
      formInitializedRef.current = true;
    }
  }, [reportId]);

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormValues((prev) => ({ ...prev, [name]: value }));

    // Clear any error when field is edited
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Notify parent component if onChange prop is provided
    if (onChange) {
      const updatedValues = { ...formValues, [name]: value };
      const parentValues = {
        generatl_info_on_data_quality:
          updatedValues.generatl_info_on_data_quality,
        justification_for_use_default_values:
          updatedValues.justification_for_use_default_values,
        manual_fuel_balance: updatedValues.manual_fuel_balance,
        manual_GHG_emissions_balance:
          updatedValues.manual_GHG_emissions_balance,
        info_qty_assurance: updatedValues.information_quality_ssurance,
      };
      onChange(parentValues);
    }
  };

  // Function to refresh data from API
  const handleRefreshData = async () => {
    await fetchEmissionData();
  };

  // จัดการ submit ฟอร์ม
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Form validation
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

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    // Prepare data for API
    const payload: any = {
      report_id: reportId,
      generatl_info_on_data_quality: formValues.generatl_info_on_data_quality,
      justification_for_use_default_values:
        formValues.justification_for_use_default_values,
      manual_fuel_balance: parseFloat(formValues.manual_fuel_balance || "0"),
      manual_GHG_emissions_balance: parseFloat(
        formValues.manual_GHG_emissions_balance || "0"
      ),
      info_qty_assurance: formValues.information_quality_ssurance,
      manual_total_indirect_emissions: null,
    };

    // Determine if we're updating an existing record or creating a new one
    const isUpdate = apiData && apiData.id;
    const method = isUpdate ? "PUT" : "POST";
    const url = isUpdate
      ? `${apiUrl}/api/cbam/c_emission/${apiData.id}`
      : `${apiUrl}/api/cbam/c_emission`;

    if (isUpdate) {
      payload.id = apiData.id;
    }

    // Send data to API
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(`API Error (${response.status}): ${text}`);
          });
        }
        return response.json();
      })
      .then((responseData) => {
        setApiData(responseData);
        alert(`✅ Data ${isUpdate ? "updated" : "submitted"} successfully`);

        // Move to next step or navigate to report page
        if (onNextStep) {
          navigate(`/report?reportId=${reportId}`);
        }
      })
      .catch((error) => {
        console.error("❌ Error:", error);
        alert(`❌ Error: ${error.message}`);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <form onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3} alignItems="stretch">
          <Box
            sx={{
              width: "100%",
              mb: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                fontSize="32px"
                variant="h5"
                fontWeight="bold"
                gutterBottom
                color="#1976d2"
              >
                Installation's emission at source stream and emission source
                level
              </Typography>
              <Typography
                fontSize="22px"
                variant="subtitle1"
                color="text.secondary"
                gutterBottom
              >
                การปล่อยก๊าซเรือนกระจกของสถานประกอบการ
              </Typography>

              {isLoading && (
                <Box display="flex" alignItems="center" mt={1}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Loading data...
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* SECTION: Installation-level GHG emissions and energy consumption */}
          <Section
            title="Installation-level GHG emissions and energy consumption"
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
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
              mt: 3,
            }}
          >
            <PGButton />
          </Box>
        </Grid>
      </form>
    </Container>
  );
};

export default EmissionForm;
