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
  // Get reportId from localStorage (same pattern as other forms)
  const storedReportId = localStorage.getItem("reportId");
  const reportId = storedReportId ? parseInt(storedReportId, 10) : null;

  
  const apiUrl = process.env.REACT_APP_API_URL;
  
  const [existingData, setExistingData] = useState<any>(null);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formMode, setFormMode] = useState<"edit" | "create">("create");
  
  // Initialize form with default values
  const getDefaultFormValues = () => ({
    report_id: reportId || 0,
    name: "",
    goods_category: "",
    routes: [],
    amounts: [],
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

  const [localFormValues, setLocalFormValues] = useState<GoodsFormProps["formValues"]>(
    getDefaultFormValues()
  );
  
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // 📦 Fetch specific goods data (for EDIT mode)
  const fetchGoodsData = async (goodsId: number) => {
    try {
      console.log(`🔍 Fetching goods data for ID: ${goodsId}`);
      
      const response = await fetch(`${apiUrl}/api/cbam/d_goods/${goodsId}`);
      if (!response.ok) {
        throw new Error(`Error fetching goods: ${response.statusText}`);
      }

      const goodsDataResponse = await response.json();
      console.log("📦 Raw goods data from API:", goodsDataResponse);
      
      // Handle both single object and array responses
      const goodsData = Array.isArray(goodsDataResponse) 
        ? goodsDataResponse[0] 
        : goodsDataResponse;

      if (!goodsData) {
        console.warn("⚠️ No goods data found");
        return;
      }

      console.log("✅ Found goods data for EDIT mode:", goodsData);
      
      // Process and update form values
      const processedFormValues = {
        report_id: goodsData.report_id || reportId || 0,
        name: String(goodsData.name || ""),
        goods_category: String(goodsData.goods_category || ""),
        industry_type: String(goodsData.industry_type || ""),
        
        // Handle JSON arrays
        routes: (() => {
          if (!goodsData.routes) return [];
          if (typeof goodsData.routes === "string") {
            try {
              const parsed = JSON.parse(goodsData.routes);
              return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
              console.warn("Failed to parse routes:", goodsData.routes);
              return [];
            }
          }
          return Array.isArray(goodsData.routes) ? goodsData.routes : [];
        })(),
        
        amounts: (() => {
          if (!goodsData.amounts) return [];
          if (typeof goodsData.amounts === "string") {
            try {
              const parsed = JSON.parse(goodsData.amounts);
              return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
              console.warn("Failed to parse amounts:", goodsData.amounts);
              return [];
            }
          }
          return Array.isArray(goodsData.amounts) ? goodsData.amounts : [];
        })(),
        
        // Numeric fields
        total_consumed_within_installation: Number(goodsData.total_consumed_within_installation ?? 0),
        consumed_in_others_amounts: Number(goodsData.consumed_in_others_amounts ?? 0),
        condumed_non_cbam_goods_amounts: Number(goodsData.condumed_non_cbam_goods_amounts ?? 0),
        total_production_amounts: Number(goodsData.total_production_amounts ?? 0),
        produced_for_market_amount: Number(goodsData.produced_for_market_amount ?? 0),
        
        // Boolean fields
        has_heat: (goodsData.has_heat === 1 || goodsData.has_heat === "1" || goodsData.has_heat === true) ? 1 : 0,
        has_waste_gases: (goodsData.has_waste_gases === 1 || goodsData.has_waste_gases === "1" || goodsData.has_waste_gases === true) ? 1 : 0,
        
        // Emissions and energy fields
        direct_emissions: Number(goodsData.direct_emissions ?? 0),
        imported_heat_value: Number(goodsData.imported_heat_value ?? 0),
        exported_heat_value: Number(goodsData.exported_heat_value ?? 0),
                ef_imported_heat: Number(goodsData.ef_imported_heat ?? 0),
        ef_exported_heat: Number(goodsData.ef_exported_heat ?? 0),
        electricity_consumption_value: Number(goodsData.electricity_consumption_value ?? 0),
        ef_electricity: Number(goodsData.ef_electricity ?? 0),
        source_of_ef_electricity: String(goodsData.source_of_ef_electricity ?? ""),
        exported_electricity_value: Number(goodsData.exported_electricity_value ?? 0),
        ef_exported_electricity: Number(goodsData.ef_exported_electricity ?? 0),
        imported_wgases_amount: Number(goodsData.imported_wgases_amount ?? 0),
        ef_imported_wgases: Number(goodsData.ef_imported_wgases ?? 0),
        exported_wgases_amount: Number(goodsData.exported_wgases_amount ?? 0),
        ef_exported_wgases: Number(goodsData.ef_exported_wgases ?? 0),
      };

      console.log("✅ Processed goods data for form:", processedFormValues);
      
      setLocalFormValues(processedFormValues);
      onChange(processedFormValues);
      setFormMode("edit");
      
      return goodsData.id || goodsId;
    } catch (error) {
      console.error("❌ Error fetching goods data:", error);
    }
    
    return null;
  };

  // 🔍 Main data loading logic (same pattern as other forms)
  useEffect(() => {
    const loadGoodsData = async () => {
      setIsLoading(true);
      
      try {
        // Case 1: No reportId - show empty form
        if (!reportId) {
          console.log("⚠️ No reportId found - showing empty form");
          setFormMode("create");
          setLocalFormValues(getDefaultFormValues());
          setIsLoading(false);
          return;
        }

        // Case 2: Fetch report data to check if it has goods_id
        console.log(`🔍 Checking report ${reportId} for existing goods`);
        console.log(`📡 Fetching from: ${apiUrl}/api/cbam/report/${reportId}`);
        
        const reportResponse = await fetch(`${apiUrl}/api/cbam/report/${reportId}`);
        if (!reportResponse.ok) {
          throw new Error(`Failed to fetch report: ${reportResponse.statusText}`);
        }

        const reportData = await reportResponse.json();
        console.log("📋 Report data:", reportData);

        if (reportData && reportData.length > 0) {
          const report = reportData[0];
          setExistingData(report);

          if (report.goods_id) {
            // ✅ SCENARIO 1: EDIT MODE - Report has goods_id
            console.log("🔄 EDIT MODE: Report has goods_id, fetching goods data");
            console.log(`📡 Fetching goods from: ${apiUrl}/api/cbam/d_goods/${report.goods_id}`);
            await fetchGoodsData(report.goods_id);
            
          } else {
            // ✅ SCENARIO 2: CREATE MODE - Report has no goods_id  
            console.log("🆕 CREATE MODE: Report has no goods_id, using default values");
            setFormMode("create");
            const defaultValues = getDefaultFormValues();
            setLocalFormValues(defaultValues);
            onChange(defaultValues);
          }
        } else {
          console.log("⚠️ No report data found - using default values");
          setFormMode("create");
          const defaultValues = getDefaultFormValues();
          setLocalFormValues(defaultValues);
          onChange(defaultValues);
        }

      } catch (error) {
        console.error("❌ Error in main data loading:", error);
        console.log("🔄 Fallback: using default values");
        setFormMode("create");
        const defaultValues = getDefaultFormValues();
        setLocalFormValues(defaultValues);
        onChange(defaultValues);
      } finally {
        setIsLoading(false);
      }
    };

    loadGoodsData();
  }, [apiUrl, reportId]);

  // Load countries
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const result = await fetchCountries();
        setCountries(result.countries);
        console.log(`✅ Loaded ${result.countries.length} countries`);
      } catch (error) {
        console.error("❌ Error loading countries:", error);
      }
    };

    loadCountries();
  }, []);

  // Sync local state with parent props
  useEffect(() => {
    onChange(localFormValues);
  }, [localFormValues, onChange]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle field changes from Section1
  const handleSection1Change = (field: string, value: any) => {
    setLocalFormValues((prev) => {
      const updated = { ...prev, [field]: value };
      console.log(`Field ${field} changed to:`, value);
      return updated;
    });
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // Required fields validation
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form first
    if (!validateForm()) {
      console.warn("❌ Form validation failed:", formErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      console.log(`📤 ${formMode.toUpperCase()} MODE: Saving goods data`);
      
      // Clean the payload
      const cleanPayload = {
        report_id: localFormValues.report_id || reportId,
        name: localFormValues.name,
        goods_category: parseInt(localFormValues.goods_category) || 0,
        industry_type: parseInt(localFormValues.industry_type) || 0,
        
        // Handle arrays - stringify for database
        routes: JSON.stringify(localFormValues.routes || []),
        amounts: JSON.stringify(localFormValues.amounts || []),
        
        // Ensure numeric values are properly typed
        total_consumed_within_installation: Number(localFormValues.total_consumed_within_installation) || 0,
        consumed_in_others_amounts: Number(localFormValues.consumed_in_others_amounts) || 0,
        condumed_non_cbam_goods_amounts: Number(localFormValues.condumed_non_cbam_goods_amounts) || 0,
        
        // Boolean values converted to integers
                has_heat: localFormValues.has_heat ? 1 : 0,
        has_waste_gases: localFormValues.has_waste_gases ? 1 : 0,
        
        // Other numeric fields
        direct_emissions: Number(localFormValues.direct_emissions) || 0,
        imported_heat_value: Number(localFormValues.imported_heat_value) || 0,
        exported_heat_value: Number(localFormValues.exported_heat_value) || 0,
        ef_imported_heat: Number(localFormValues.ef_imported_heat) || 0,
        ef_exported_heat: Number(localFormValues.ef_exported_heat) || 0,
        electricity_consumption_value: Number(localFormValues.electricity_consumption_value) || 0,
        ef_electricity: Number(localFormValues.ef_electricity) || 0,
        source_of_ef_electricity: localFormValues.source_of_ef_electricity,
        exported_electricity_value: Number(localFormValues.exported_electricity_value) || 0,
        ef_exported_electricity: Number(localFormValues.ef_exported_electricity) || 0,
        total_production_amounts: Number(localFormValues.total_production_amounts) || 0,
        produced_for_market_amount: Number(localFormValues.produced_for_market_amount) || 0,
        imported_wgases_amount: Number(localFormValues.imported_wgases_amount) || 0,
        ef_imported_wgases: Number(localFormValues.ef_imported_wgases) || 0,
        exported_wgases_amount: Number(localFormValues.exported_wgases_amount) || 0,
        ef_exported_wgases: Number(localFormValues.ef_exported_wgases) || 0,
      };

      // Remove any keys that are numeric (safety check)
      const filteredPayload = Object.fromEntries(
        Object.entries(cleanPayload).filter(([key]) => isNaN(Number(key)))
      );

      console.log("📤 Payload ready:", filteredPayload);

      let response;
      let newGoodsId;

      if (formMode === "edit" && existingData?.goods_id) {
        // UPDATE existing goods
        console.log(`🔄 Updating goods ID: ${existingData.goods_id}`);
        console.log(`PUT request to: ${apiUrl}/api/cbam/d_goods/${existingData.goods_id}`);
        
        response = await fetch(`${apiUrl}/api/cbam/d_goods/${existingData.goods_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filteredPayload),
        });
        
        newGoodsId = existingData.goods_id;
        
      } else {
        // CREATE new goods
        console.log("🆕 Creating new goods");
        console.log(`POST request to: ${apiUrl}/api/cbam/d_goods`);
        
        response = await fetch(`${apiUrl}/api/cbam/d_goods`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filteredPayload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`❌ Server response error (${response.status}):`, errorData);
        throw new Error(`Server error saving goods data: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log("✅ Goods saved successfully:", result);

      // Get goods ID (for new goods)
      if (formMode !== "edit") {
        newGoodsId = result.id;
      }

      // 3. Update Report with goods_id (if we have reportId)
      if (reportId && newGoodsId) {
        console.log(`🔗 Updating report ${reportId} with goods_id: ${newGoodsId}`);
        
        const reportUpdatePayload = {
          goods_id: newGoodsId,
        };

        const reportUpdateResponse = await fetch(`${apiUrl}/api/cbam/report/${reportId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reportUpdatePayload),
        });

        if (!reportUpdateResponse.ok) {
          const errorText = await reportUpdateResponse.text();
          console.error("❌ Report update error:", errorText);
          
          // Show partial success message
          alert(
            `✅ Goods data saved successfully!\n` +
            `⚠️ But could not update report: ${errorText}\n` +
            `You may need to link the goods manually.`
          );
        } else {
          const reportResult = await reportUpdateResponse.json();
          console.log("✅ Report updated successfully with goods_id:", reportResult);
          
          // Ensure localStorage has the correct reportId
          localStorage.setItem("reportId", String(reportId));
          localStorage.setItem("cbam_report_id", String(reportId));
          
          // Success message
          const modeText = formMode === "edit" ? "updated" : "created";
          alert(
            `✅ Success!\n` +
            `📦 Goods data ${modeText} successfully\n` +
            `🔗 Report #${reportId} linked with goods\n` +
            `📋 Ready for next step`
          );
        }
      }

      // Move to next step
      onNextStep();

    } catch (error: any) {
      console.error("❌ Form submission error:", error);
      alert(`❌ Error: ${error.message}`);
      setFormErrors((prev) => ({
        ...prev,
        submit: error.message || "Failed to save goods data"
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <Container maxWidth="md" style={{ paddingTop: "2rem", textAlign: "center" }}>
        <Typography variant="h6" gutterBottom>
          🔍 Loading goods data...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
      <form onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          {/* Header Section */}
          <Grid size={12}>
            <Typography variant="h4" fontWeight="bold" gutterBottom color="#1976d2">
              Aggregated goods categories and relevant production processes
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              รายละเอียดของกลุ่มสินค้าและกระบวนการผلิต
            </Typography>

            {/* Mode Indicator */}
            <Box mt={2} p={2} sx={{ 
              backgroundColor: formMode === "edit" ? "#fff3e0" : "#e8f5e8", 
              borderRadius: 1,
              border: `1px solid ${formMode === "edit" ? "#ffcc02" : "#4caf50"}`
            }}>
              {formMode === "edit" ? (
                <>
                  <Typography variant="subtitle2" fontWeight="bold" color="#f57c00">
                    🔄 EDIT MODE
                  </Typography>
                  <Typography variant="body2">
                    Editing existing goods data (ID: {existingData?.goods_id})
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="subtitle2" fontWeight="bold" color="#2e7d32">
                    🆕 CREATE MODE  
                  </Typography>
                  <Typography variant="body2">
                    Creating new goods data
                  </Typography>
                </>
              )}
              
              <Typography variant="body2" sx={{ mt: 1 }}>
                                <strong>Report ID:</strong> {reportId || "Not set"}
              </Typography>
              
              {existingData && (
                <Box mt={1}>
                  <Typography variant="body2">
                    <strong>Industry:</strong> {existingData.industry_type_name || "Not specified"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Goods Category:</strong> {existingData.goods_category_name || "Not specified"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: existingData.goods_id ? "green" : "orange" }}
                  >
                    <strong>Goods Status:</strong>{" "}
                    {existingData.goods_id
                      ? `✅ Connected (ID: ${existingData.goods_id})`
                      : "🆕 Not connected - Creating new goods data"}
                  </Typography>
                </Box>
              )}
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
                total_production_amounts: String(localFormValues.total_production_amounts ?? ""),
                consumed_in_others_amounts: String(localFormValues.consumed_in_others_amounts ?? ""),
                produced_for_market_amount: String(localFormValues.produced_for_market_amount ?? ""),
                condumed_non_cbam_goods_amounts: String(localFormValues.condumed_non_cbam_goods_amounts ?? ""),
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
              {/* Show validation errors summary */}
              {Object.keys(formErrors).length > 0 && (
                <Box>
                  <Typography color="error" variant="body2" fontWeight="bold">
                    Please fix the following errors:
                  </Typography>
                  <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
                    {Object.entries(formErrors)
                      .filter(([field]) => field !== "submit")
                      .map(([field, error]) => (
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
                  text={
                    isSubmitting
                      ? "Saving..."
                      : formMode === "edit"
                      ? "Update Goods Data"
                      : "Create Goods Data"
                  }
                  loading={isSubmitting}
                  type="submit"
                />
              </Box>
            </Box>
          </Grid>

          {/* Debug Information - Development Only */}
          {process.env.NODE_ENV === "development" && (
            <Grid size={12}>
              <Box
                mt={4}
                p={2}
                sx={{
                  backgroundColor: "#f5f5f5",
                  borderRadius: 1,
                  fontSize: "0.8rem",
                  border: "1px solid #ddd",
                }}
              >
                <details>
                  <summary style={{ cursor: "pointer", fontWeight: "bold", marginBottom: "1rem" }}>
                    🐛 Debug Information (Development Mode)
                  </summary>
                  
                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <Typography variant="caption" component="div" fontWeight="bold">
                        Mode & IDs:
                      </Typography>
                      <Typography variant="caption" component="div">
                        <strong>Form Mode:</strong> {formMode}
                      </Typography>
                      <Typography variant="caption" component="div">
                        <strong>Report ID (localStorage):</strong> {reportId || "not set"}
                      </Typography>
                      <Typography variant="caption" component="div">
                        <strong>Goods ID:</strong> {existingData?.goods_id || "not set"}
                      </Typography>
                      <Typography variant="caption" component="div">
                        <strong>Loading:</strong> {isLoading ? "Yes" : "No"}
                      </Typography>
                      <Typography variant="caption" component="div">
                        <strong>Submitting:</strong> {isSubmitting ? "Yes" : "No"}
                      </Typography>
                    </Grid>
                    
                    <Grid size={12}>
                      <Typography variant="caption" component="div" fontWeight="bold">
                        Form Status:
                      </Typography>
                      <Typography variant="caption" component="div">
                        <strong>Countries Loaded:</strong> {countries.length}
                      </Typography>
                      <Typography variant="caption" component="div">
                        <strong>Form Errors:</strong> {Object.keys(formErrors).length}
                      </Typography>
                      <Typography variant="caption" component="div" sx={{ 
                        color: formMode === "edit" ? "orange" : "green"
                      }}>
                        <strong>Action:</strong> {
                          formMode === "edit" 
                            ? "Will UPDATE existing goods data" 
                            : "Will CREATE new goods data"
                        }
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box mt={2}>
                    <Typography variant="caption" component="div" fontWeight="bold">
                      API Endpoints:
                    </Typography>
                    <Typography variant="caption" component="div">
                      <strong>Report API:</strong> {apiUrl}/api/cbam/report/{reportId}
                    </Typography>
                    <Typography variant="caption" component="div">
                      <strong>Goods API:</strong> {apiUrl}/api/cbam/d_goods/{existingData?.goods_id || "{new}"}
                    </Typography>
                  </Box>

                  <Box mt={2}>
                    <Typography variant="caption" component="div" fontWeight="bold">
                      Existing Data:
                    </Typography>
                    <Box 
                      component="pre" 
                      sx={{ 
                        fontSize: "10px", 
                        overflow: "auto", 
                        maxHeight: "150px",
                        backgroundColor: "#fff",
                        p: 1,
                        border: "1px solid #ddd",
                        borderRadius: 1,
                        mt: 1
                      }}
                    >
                      {JSON.stringify(existingData, null, 2)}
                    </Box>
                  </Box>

                  <Box mt={2}>
                    <Typography variant="caption" component="div" fontWeight="bold">
                      Current Form Values:
                    </Typography>
                    <Box 
                                            component="pre" 
                      sx={{ 
                        fontSize: "10px", 
                        overflow: "auto", 
                        maxHeight: "200px",
                        backgroundColor: "#fff",
                        p: 1,
                        border: "1px solid #ddd",
                        borderRadius: 1,
                        mt: 1
                      }}
                    >
                      {JSON.stringify(localFormValues, null, 2)}
                    </Box>
                  </Box>

                  {Object.keys(formErrors).length > 0 && (
                    <Box mt={2}>
                      <Typography variant="caption" component="div" fontWeight="bold" color="red">
                        Form Errors ({Object.keys(formErrors).length}):
                      </Typography>
                      <Box 
                        component="pre" 
                        sx={{ 
                          fontSize: "10px", 
                          overflow: "auto", 
                          maxHeight: "100px",
                          backgroundColor: "#fff",
                          p: 1,
                          border: "1px solid #ff9999",
                          borderRadius: 1,
                          mt: 1,
                          color: "red"
                        }}
                      >
                        {JSON.stringify(formErrors, null, 2)}
                      </Box>
                    </Box>
                  )}

                  <Box mt={2} p={1} sx={{ backgroundColor: "#e3f2fd", borderRadius: 1 }}>
                    <Typography variant="caption" component="div" fontWeight="bold">
                      Logic Summary:
                    </Typography>
                    <Typography variant="caption" component="div">
                      1. Get reportId from localStorage: <strong>{reportId}</strong>
                    </Typography>
                    <Typography variant="caption" component="div">
                      2. Check if report has goods_id: <strong>{existingData?.goods_id ? "YES" : "NO"}</strong>
                    </Typography>
                    <Typography variant="caption" component="div">
                      3. Mode determined: <strong>{formMode.toUpperCase()}</strong>
                    </Typography>
                    <Typography variant="caption" component="div">
                      4. Data source: <strong>
                        {formMode === "edit" 
                          ? "Specific goods data from API" 
                          : "Default blank values"}
                      </strong>
                    </Typography>
                    <Typography variant="caption" component="div">
                      5. Will update report #{reportId} with goods_id after saving
                    </Typography>
                  </Box>

                  {/* Debug Buttons */}
                  <Box mt={2} display="flex" gap={1}>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          console.log("=== Debug API Connections ===");
                          
                          // Test report API
                          console.log(`🔍 Testing report API: ${apiUrl}/api/cbam/report/${reportId}`);
                          const reportResponse = await fetch(`${apiUrl}/api/cbam/report/${reportId}`);
                          const reportData = await reportResponse.json();
                          console.log("📋 Report API Response:", reportData);
                          
                          // Test goods API if goods_id exists
                          if (reportData?.length > 0 && reportData[0].goods_id) {
                            console.log(`🔍 Testing goods API: ${apiUrl}/api/cbam/d_goods/${reportData[0].goods_id}`);
                            const goodsResponse = await fetch(`${apiUrl}/api/cbam/d_goods/${reportData[0].goods_id}`);
                            const goodsData = await goodsResponse.json(); 
                            console.log("📦 Goods API Response:", goodsData);
                          }
                          
                          // Log current form state
                          console.log("📝 Current form state:", {
                            localFormValues,
                            formErrors,
                            formMode,
                            isLoading,
                            isSubmitting
                          });
                        } catch (error) {
                          console.error("❌ Debug error:", error);
                        }
                      }}
                      style={{
                        backgroundColor: "#2196f3",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      Debug API Connections
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        console.log("=== Current Form State ===");
                        console.log("Local Form Values:", localFormValues);
                        console.log("Form Errors:", formErrors);
                        console.log("Mode:", formMode);
                        console.log("Existing Data:", existingData);
                        console.log("Countries:", countries);
                      }}
                      style={{
                        backgroundColor: "#4caf50",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      Log Current State
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        console.log("=== Test Form Validation ===");
                        const isValid = validateForm();
                        console.log("Form is valid:", isValid);
                        console.log("Validation errors:", formErrors);
                      }}
                      style={{
                        backgroundColor: "#ff9800",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      Test Validation
                    </button>
                  </Box>
                </details>
              </Box>
            </Grid>
          )}
        </Grid>
      </form>
    </Container>
  );
};

export default GoodsForm;