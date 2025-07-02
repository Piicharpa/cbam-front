import React, { useState, useEffect } from "react";
import { Container, Typography, Grid, Box } from "@mui/material";
import Section from "../components/Section";
import PGButton from "../components/FormButton";
import {
  fetchCountries,
  CountryOption,
} from "../components/dropdown/contriesmap";
import Section1 from "./formsections/Goods/Goods_sec1";
import Section2 from "./formsections/Goods/Goods_sec2";
import Section3 from "./formsections/Goods/Goods_sec3";

interface GoodsFormProps {
  formValues: {
    report_id: number;
    name: string;
    goods_category: string;
    routes: string[];
    amounts: string[];
    total_consumed_within_installation: number;
    consumed_in_others_amounts: number;
    condumed_non_cbam_goods_amounts: number;
    has_heat: number;
    has_waste_gases: number;
    direct_emissions: number;
    imported_heat_value: number;
    exported_heat_value: number;
    ef_imported_heat: number;
    ef_exported_heat: number;
    electricity_consumption_value: number;
    ef_electricity: number;
    source_of_ef_electricity: string;
    exported_electricity_value: number;
    ef_exported_electricity: number;
    produced_for_market_amount: number;
    imported_wgases_amount: number;
    ef_imported_wgases: number;
    exported_wgases_amount: number;
    ef_exported_wgases: number;
    industry_type: string;
    total_production_amounts: number;
  };
  onChange: (formValues: GoodsFormProps["formValues"]) => void;
  onNextStep: () => void;
}

const GoodsForm: React.FC<GoodsFormProps> = ({
  formValues,
  onChange,
  onNextStep,
}) => {
  const reportId = 54;
  const apiUrl = process.env.REACT_APP_API_URL;

  // State for local form values
  const [localFormValues, setLocalFormValues] = useState<
    GoodsFormProps["formValues"]
  >({
    report_id: formValues.report_id || reportId,
    name: formValues.name || "",
    goods_category: formValues.goods_category || "",
    routes: formValues.routes || [],
    amounts: formValues.amounts || [],
    total_consumed_within_installation:
      formValues.total_consumed_within_installation || 0,
    consumed_in_others_amounts: formValues.consumed_in_others_amounts || 0,
    condumed_non_cbam_goods_amounts:
      formValues.condumed_non_cbam_goods_amounts || 0,
    has_heat: formValues.has_heat || 0,
    has_waste_gases: formValues.has_waste_gases || 0,
    direct_emissions: formValues.direct_emissions || 0,
    imported_heat_value: formValues.imported_heat_value || 0,
    exported_heat_value: formValues.exported_heat_value || 0,
    ef_imported_heat: formValues.ef_imported_heat || 0,
    ef_exported_heat: formValues.ef_exported_heat || 0,
    electricity_consumption_value:
      formValues.electricity_consumption_value || 0,
    ef_electricity: formValues.ef_electricity || 0,
    source_of_ef_electricity: formValues.source_of_ef_electricity || "",
    exported_electricity_value: formValues.exported_electricity_value || 0,
    ef_exported_electricity: formValues.ef_exported_electricity || 0,
    produced_for_market_amount: formValues.produced_for_market_amount || 0,
    imported_wgases_amount: formValues.imported_wgases_amount || 0,
    ef_imported_wgases: formValues.ef_imported_wgases || 0,
    exported_wgases_amount: formValues.exported_wgases_amount || 0,
    ef_exported_wgases: formValues.ef_exported_wgases || 0,
    industry_type: formValues.industry_type || "",
    total_production_amounts: formValues.total_production_amounts || 0,
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadCountries = async () => {
    try {
      const fetched = await fetchCountries();
      setCountries(fetched.countries);
    } catch (error) {
      console.error("Error loading countries:", error);
    }
  };

  // Add this function to debug what data structure you're getting
  const debugApiStructure = async () => {
    try {
      // Check report structure
      const reportResponse = await fetch(
        `${apiUrl}/api/cbam/report/${reportId}`
      );
      const reportData = await reportResponse.json();
      console.log("🔍 Report API Response:", reportData);

      // If you have goods_id, check goods structure
      if (reportData.length > 0 && reportData[0].goods_id) {
        const goodsResponse = await fetch(
          `${apiUrl}/api/cbam/d_goods/${reportData[0].goods_id}`
        );
        const goodsData = await goodsResponse.json();
        console.log("🔍 Goods API Response:", goodsData);
      }
    } catch (error) {
      console.error("Debug API Error:", error);
    }
  };

  const fetchGoodsData = async (goodsId: number) => {
    try {
      console.log(`📡 Fetching goods data for ID: ${goodsId}`);
      const response = await fetch(`${apiUrl}/api/cbam/d_goods/${goodsId}`);

      if (response.ok) {
        const goodsData = await response.json();
        console.log("📦 Raw goods data from API:", goodsData);

        // Handle both single object and array responses
        const dataToProcess = Array.isArray(goodsData)
          ? goodsData[0]
          : goodsData;

        if (!dataToProcess) {
          console.warn("⚠️ No goods data found");
          return;
        }

        // Enhanced data processing with better error handling
        const processedData = {
          // Basic identifiers
          report_id: dataToProcess.report_id || reportId,
          name: String(dataToProcess.name || ""),

          // Category and type fields - handle both string and number from DB
          goods_category: String(dataToProcess.goods_category || ""),
          industry_type: String(dataToProcess.industry_type || ""),

          // Array fields - handle multiple possible formats
          routes: (() => {
            if (!dataToProcess.routes) return [];
            if (typeof dataToProcess.routes === "string") {
              try {
                const parsed = JSON.parse(dataToProcess.routes);
                return Array.isArray(parsed) ? parsed : [];
              } catch (e) {
                console.warn("Failed to parse routes:", dataToProcess.routes);
                return [];
              }
            }
            return Array.isArray(dataToProcess.routes)
              ? dataToProcess.routes
              : [];
          })(),

          amounts: (() => {
            if (!dataToProcess.amounts) return [];
            if (typeof dataToProcess.amounts === "string") {
              try {
                const parsed = JSON.parse(dataToProcess.amounts);
                return Array.isArray(parsed) ? parsed : [];
              } catch (e) {
                console.warn("Failed to parse amounts:", dataToProcess.amounts);
                return [];
              }
            }
            return Array.isArray(dataToProcess.amounts)
              ? dataToProcess.amounts
              : [];
          })(),

          // Production and consumption amounts - handle null/undefined
          total_consumed_within_installation: Number(
            dataToProcess.total_consumed_within_installation ?? 0
          ),
          consumed_in_others_amounts: Number(
            dataToProcess.consumed_in_others_amounts ?? 0
          ),
          condumed_non_cbam_goods_amounts: Number(
            dataToProcess.condumed_non_cbam_goods_amounts ?? 0
          ),
          total_production_amounts: Number(
            dataToProcess.total_production_amounts ?? 0
          ),
          produced_for_market_amount: Number(
            dataToProcess.produced_for_market_amount ?? 0
          ),

          // Boolean fields - handle various truthy values
          has_heat:
            dataToProcess.has_heat === 1 ||
            dataToProcess.has_heat === "1" ||
            dataToProcess.has_heat === true
              ? 1
              : 0,
          has_waste_gases:
            dataToProcess.has_waste_gases === 1 ||
            dataToProcess.has_waste_gases === "1" ||
            dataToProcess.has_waste_gases === true
              ? 1
              : 0,

          // Direct emissions
          direct_emissions: Number(dataToProcess.direct_emissions ?? 0),

          // Heat-related fields
          imported_heat_value: Number(dataToProcess.imported_heat_value ?? 0),
          exported_heat_value: Number(dataToProcess.exported_heat_value ?? 0),
          ef_imported_heat: Number(dataToProcess.ef_imported_heat ?? 0),
          ef_exported_heat: Number(dataToProcess.ef_exported_heat ?? 0),

          // Electricity-related fields
          electricity_consumption_value: Number(
            dataToProcess.electricity_consumption_value ?? 0
          ),
          ef_electricity: Number(dataToProcess.ef_electricity ?? 0),
          source_of_ef_electricity: String(
            dataToProcess.source_of_ef_electricity ?? ""
          ),
          exported_electricity_value: Number(
            dataToProcess.exported_electricity_value ?? 0
          ),
          ef_exported_electricity: Number(
            dataToProcess.ef_exported_electricity ?? 0
          ),

          // Waste gases fields
          imported_wgases_amount: Number(
            dataToProcess.imported_wgases_amount ?? 0
          ),
          ef_imported_wgases: Number(dataToProcess.ef_imported_wgases ?? 0),
          exported_wgases_amount: Number(
            dataToProcess.exported_wgases_amount ?? 0
          ),
          ef_exported_wgases: Number(dataToProcess.ef_exported_wgases ?? 0),
        };

        console.log("✅ Processed goods data for form:", processedData);

        // Update form with processed data
        setLocalFormValues((prev) => {
          const updated = { ...prev, ...processedData };
          console.log("📝 Form values updated:", updated);
          return updated;
        });
      } else {
        console.error(`❌ Failed to fetch goods data: ${response.status}`);
        const errorText = await response.text();
        console.error("Error response:", errorText);
      }
    } catch (error) {
      console.error("❌ Error fetching goods data:", error);
    }
  };

  useEffect(() => {
  loadCountries();
  
  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      console.log(`📡 Fetching report data for ID: ${reportId}`);
      const response = await fetch(`${apiUrl}/api/cbam/report/${reportId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log("📋 Report data loaded:", data);
        
        // Handle different response structures
        const reportDetails = Array.isArray(data) ? data[0] : data;
        
        if (reportDetails) {
          const goodsId = reportDetails.goods_id || reportDetails.id;
          console.log("🎯 Found goods_id:", goodsId);
          
          if (goodsId) {
            setEditingId(goodsId);
            await fetchGoodsData(goodsId);
          } else {
            console.log("ℹ️ No existing goods data found, using defaults");
            // Set default form values for new entry
            setLocalFormValues(prev => ({
              ...prev,
              report_id: reportId
            }));
          }
        }
      } else {
        console.error(`❌ Failed to fetch report data: ${response.status}`);
        const errorText = await response.text();
        console.error("Response:", errorText);
              }
    } catch (error) {
      console.error("❌ Error fetching report data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchReportData();
}, [reportId, apiUrl]);





  // Sync local state with parent props
  useEffect(() => {
    onChange(localFormValues);
  }, [localFormValues, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const requiredFields = [
    "industry_type",
    "goods_category",
    "source_of_ef_electricity",
    "name",
    "total_production_amounts",
    "consumed_in_others_amounts",
    "produced_for_market_amount",
    "condumed_non_cbam_goods_amounts",
  ];

  // Validation function
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    requiredFields.forEach((field) => {
      const value = localFormValues[field as keyof typeof localFormValues];
      if (!value && value !== 0) {
        errors[field] = `${field.replace(/_/g, " ")} is required`;
      }
    });

    // Additional validation for routes
    if (
      localFormValues.routes.length === 0 ||
      localFormValues.routes.every((route) => !route)
    ) {
      errors.routes = "At least one route is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fixed handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form first
    if (!validateForm()) {
      console.warn("Form validation failed:", formErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Clean the payload using localFormValues instead of formValues
      const cleanPayload = {
        report_id: localFormValues.report_id || reportId,
        name: localFormValues.name,
        goods_category: parseInt(localFormValues.goods_category) || 0,
        industry_type: parseInt(localFormValues.industry_type) || 0,

        // Handle routes and amounts as arrays
        routes: JSON.stringify(localFormValues.routes || []),
        amounts: JSON.stringify(localFormValues.amounts || []),

        // Ensure numeric values are properly typed
        total_consumed_within_installation:
          Number(localFormValues.total_consumed_within_installation) || 0,
        consumed_in_others_amounts:
          Number(localFormValues.consumed_in_others_amounts) || 0,
        condumed_non_cbam_goods_amounts:
          Number(localFormValues.condumed_non_cbam_goods_amounts) || 0,

        // Boolean values converted to integers
        has_heat: localFormValues.has_heat ? 1 : 0,
        has_waste_gases: localFormValues.has_waste_gases ? 1 : 0,

        // Other numeric fields
        direct_emissions: Number(localFormValues.direct_emissions) || 0,
        imported_heat_value: Number(localFormValues.imported_heat_value) || 0,
        exported_heat_value: Number(localFormValues.exported_heat_value) || 0,
        ef_imported_heat: Number(localFormValues.ef_imported_heat) || 0,
        ef_exported_heat: Number(localFormValues.ef_exported_heat) || 0,
        electricity_consumption_value:
          Number(localFormValues.electricity_consumption_value) || 0,
        ef_electricity: Number(localFormValues.ef_electricity) || 0,
        source_of_ef_electricity: localFormValues.source_of_ef_electricity,
        exported_electricity_value:
          Number(localFormValues.exported_electricity_value) || 0,
        ef_exported_electricity:
          Number(localFormValues.ef_exported_electricity) || 0,
        total_production_amounts:
          Number(localFormValues.total_production_amounts) || 0,
        produced_for_market_amount:
          Number(localFormValues.produced_for_market_amount) || 0,
        imported_wgases_amount:
          Number(localFormValues.imported_wgases_amount) || 0,
        ef_imported_wgases: Number(localFormValues.ef_imported_wgases) || 0,
        exported_wgases_amount:
          Number(localFormValues.exported_wgases_amount) || 0,
        ef_exported_wgases: Number(localFormValues.ef_exported_wgases) || 0,
      };

      // Remove any keys that are numeric (like "0", "1", etc.) - safety check
      const filteredPayload = Object.fromEntries(
        Object.entries(cleanPayload).filter(([key]) => isNaN(Number(key)))
      );

      console.log("Payload ready:", filteredPayload);

      let response;

      if (editingId) {
        console.log(`Updating existing goods with ID ${editingId}`);
        console.log(`PUT request to: ${apiUrl}/api/cbam/d_goods/${editingId}`);
        console.log("With payload:", filteredPayload);

        response = await fetch(`${apiUrl}/api/cbam/d_goods/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(filteredPayload),
        });
      } else {
        console.log("Creating new goods");
        console.log(`POST request to: ${apiUrl}/api/cbam/d_goods`);
        console.log("With payload:", filteredPayload);

        response = await fetch(`${apiUrl}/api/cbam/d_goods`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(filteredPayload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Server response error (${response.status}):`, errorData);
        throw new Error(
          `Server error saving goods data: ${JSON.stringify(errorData)}`
        );
      }

      const result = await response.json();
      console.log("✅ Success:", result);

      // Update editing ID if this was a new record
      if (!editingId && result.id) {
        setEditingId(result.id);
      }

      // Call parent's onNextStep or show success message
      if (onNextStep) {
        onNextStep();
      }
    } catch (error) {
      // console.error("❌ POST/PUT error:", error.message);
      setFormErrors((prev) => ({
        ...prev,
        // submit: error.message || "Failed to save goods data"
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle field changes from Section1
  const handleSection1Change = (field: string, value: any) => {
    setLocalFormValues((prev) => {
      const updated = { ...prev, [field]: value };
      console.log(`Field ${field} changed to:`, value);
      console.log("Updated formValues:", updated);
      return updated;
    });
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  if (isLoading) {
    return (
      <Container
        maxWidth="md"
        style={{ paddingTop: "2rem", textAlign: "center" }}
      >
        <Typography>Loading goods data...</Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="md"
      style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
    >
      <form onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3} alignItems="stretch">
          {/* Debug section - only in development */}
          {process.env.NODE_ENV === "development" && (
            <Grid size={12}>
              <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
                <Typography variant="h6" gutterBottom>
                  Debug Information
                </Typography>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const reportResponse = await fetch(
                        `${apiUrl}/api/cbam/report/${reportId}`
                      );
                      const reportData = await reportResponse.json();
                      console.log("Report data:", reportData);

                      console.log("Current localFormValues:", localFormValues);
                      console.log("Current formErrors:", formErrors);
                      console.log("Editing ID:", editingId);

                      // Show current payload structure
                      const testPayload = {
                        ...localFormValues,
                        report_id: reportId,
                        routes: JSON.stringify(localFormValues.routes),
                        amounts: JSON.stringify(localFormValues.amounts),
                      };
                      console.log("Test payload structure:", testPayload);
                    } catch (error) {
                      console.error("Debug error:", error);
                    }
                  }}
                  style={{
                    backgroundColor: "#2196f3",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginRight: "8px",
                  }}
                >
                  Debug API Connections
                </button>
                <button
                  type="button"
                  onClick={() => {
                    console.log("Current form state:", {
                      localFormValues,
                      formErrors,
                      editingId,
                      isLoading,
                    });
                  }}
                  style={{
                    backgroundColor: "#4caf50",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Log Current State
                </button>
              </Box>
            </Grid>
          )}

          {/* Main form header */}
          <Grid size={12}>
            <Box mb={3}>
              <Typography
                variant="h4"
                fontWeight="bold"
                gutterBottom
                color="#1976d2"
              >
                Aggregated goods categories and relevant production processes
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                gutterBottom
              >
                รายละเอียดของกลุ่มสินค้าและกระบวนการผลิต
              </Typography>
            </Box>
          </Grid>

          {/* Show form-level errors */}
          {formErrors.submit && (
            <Grid size={12}>
              <Box
                p={2}
                bgcolor="#ffebee"
                border="1px solid #f44336"
                borderRadius={1}
                mb={2}
              >
                <Typography color="error" variant="body2">
                  {formErrors.submit}
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Section 1 - Industry Type, Goods Category, Routes */}
          <Grid size={12}>
            <Section1
              values={localFormValues}
              errors={formErrors}
              onChange={handleSection1Change}
            />
          </Grid>

          {/* Section 2 - Production Amounts */}
          <Grid size={12}>
            <Section2
              values={{
                total_production_amounts: String(
                  localFormValues.total_production_amounts ?? ""
                ),
                consumed_in_others_amounts: String(
                  localFormValues.consumed_in_others_amounts ?? ""
                ),
                produced_for_market_amount: String(
                  localFormValues.produced_for_market_amount ?? ""
                ),
                condumed_non_cbam_goods_amounts: String(
                  localFormValues.condumed_non_cbam_goods_amounts ?? ""
                ),
              }}
              errors={formErrors}
              onChange={handleInputChange}
            />
          </Grid>

          {/* Section 3 - Heat, Electricity, Waste Gases */}
          <Grid size={12}>
            <Section3
              values={localFormValues}
              errors={formErrors}
              onChange={handleInputChange}
              setValues={setLocalFormValues}
              countries={countries}
            />
          </Grid>

          {/* Form submission button */}
          <Grid size={12}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={3}
            >
              {/* Show validation errors summary */}
              {Object.keys(formErrors).length > 0 && (
                <Box>
                  <Typography color="error" variant="body2">
                    Please fix the following errors:
                  </Typography>
                  <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
                    {Object.entries(formErrors).map(([field, error]) => (
                      <li key={field}>
                        <Typography color="error" variant="body2">
                          {error}
                        </Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}

              <Box ml="auto">
                <PGButton
                  type="submit"
                  disabled={isLoading}
                  // variant={editingId ? "contained" : "outlined"}
                  color="primary"
                >
                  {isLoading
                    ? "Saving..."
                    : editingId
                    ? "Update Goods Data"
                    : "Save Goods Data"}
                </PGButton>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default GoodsForm;
