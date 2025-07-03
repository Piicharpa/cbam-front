import React, { useState, useEffect, useRef } from "react";
import { Container, Typography, Grid, Button, Box, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PGButton from "../components/FormButton";
import Section from "../components/Section";
import PrecursorFields from "./formsections/Precursors_sec1";
import {
  fetchCountries,
  CountryOption,
} from "../components/dropdown/contriesmap";
import {
  fetchGoodsData,
  getPrecursorsOptions,
  IndustryGroup,
} from "../components/dropdown/goods";

interface PrecursorsFormProps {
  formValues: {
    report_id?: number;
    name?: string;
    country_id?: string;
    route_1?: string;
    route_1_amounts?: number;
    route_2?: string;
    route_2_amounts?: number;
    route_3?: string;
    route_3_amounts?: number;
    route_4?: string;
    route_4_amounts?: number;
    route_5?: string;
    route_5_amounts?: number;
    total_consumed_within_installation?: number;
    consumed_in_production_amounts?: number;
    consumed_non_cbam_goods_amounts?: number;
    total_consumed_within_installation_amounts?: number;
    embedded_direct_emissions_value?: number;
    source_embedded_direct_emissions?: string;
    embedded_indirection_emissions_value?: number;
    source_embedded_indirect_emissions?: string;
    justification_for_use_default_values?: string;
    industry_type?: number;
    goods_category?: number;
  };
  onChange: (formValues: PrecursorsFormProps["formValues"]) => void;
  onNextStep?: () => void;
}

export interface PrecursorSubmitData {
  id?: number;
  report_id?: string | number;
  name?: string;
  route?: string;
  amount?: number;
  country_code?: string;
  embedded_direct_emissions_value?: number;
  source_embedded_direct_emissions?: string;
  embedded_indirect_emissions_value?: number;
  source_embedded_indirect_emissions?: string;
  justification_for_use_default_values?: string;
}

const PrecursorsForm: React.FC<PrecursorsFormProps> = ({
  formValues = {},
  onChange,
  onNextStep,
}) => {
  const navigate = useNavigate();
  const reportId = 54; // Your report ID - replace with dynamic value if needed
  
  // State management
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [goodsData, setGoodsData] = useState<IndustryGroup[]>([]);
  const [precursorsCount, setPrecursorsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [industryTypeId, setIndustryTypeId] = useState<number | undefined>(
    formValues.industry_type
  );
  const [goodsId, setGoodsId] = useState<number | undefined>(
    formValues.goods_category
  );
  
  // States for API responses visualization
  const [apiResponses, setApiResponses] = useState<{
    getResponse: any;
    postResponse: any;
    putResponse: any;
  }>({
    getResponse: null,
    postResponse: null,
    putResponse: null
  });
  
  const [precursorFieldsData, setPrecursorFieldsData] = useState<Array<PrecursorSubmitData>>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const apiUrl = process.env.REACT_APP_API_URL;
  
  // Initial form values
  const [localFormValues, setLocalFormValues] = useState<{
    [key: string]: string | number;
  }>(() => {
    // Initialize with all required fields to prevent undefined issues
    const initialValues: { [key: string]: string | number } = {};
    
    // Initialize for up to 5 precursors
    for (let i = 1; i <= 5; i++) {
      initialValues[`purchased_precursors_${i}`] = formValues[`route_${i}` as keyof typeof formValues] || "";
      initialValues[`amount_${i}`] = formValues[`route_${i}_amounts` as keyof typeof formValues] 
        ? String(formValues[`route_${i}_amounts` as keyof typeof formValues])
        : "";
      initialValues[`country_code_${i}`] = "";
      initialValues[`embedded_direct_emissions_value_${i}`] = 0;
      initialValues[`source_embedded_direct_emissions_${i}`] = "";
      initialValues[`embedded_indirection_emissions_value_${i}`] = 0;
      initialValues[`source_embedded_indirect_emissions_${i}`] = "";
      initialValues[`justification_for_use_default_values_${i}`] = "";
    }
    
    return initialValues;
  });
  
  // Fetch existing precursor data
  const fetchExistingPrecursorData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/cbam/e_precursors/report/${reportId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log("📦 Precursor data from API:", data);
        
        // Store the GET response for display
        setApiResponses(prev => ({
          ...prev,
          getResponse: data
        }));
        
        // Handle both array and single object responses
        const precursorsArray = Array.isArray(data) ? data : data ? [data] : [];
        
        // Create a new local form values object to populate with API data
        const updatedFormValues: {[key: string]: string | number} = {...localFormValues};
        
        // Map the API data to our form fields
        if (precursorsArray.length > 0) {
          precursorsArray.forEach((precursor, index) => {
            const i = index + 1;
            if (i > 5) return; // Only handle up to 5 precursors
            
            updatedFormValues[`purchased_precursors_${i}`] = precursor.route_1 || "";
            updatedFormValues[`amount_${i}`] = precursor.route_1_amounts || 0;
            updatedFormValues[`country_code_${i}`] = precursor.country_code || "TH"; // Default to Thailand
            updatedFormValues[`embedded_direct_emissions_value_${i}`] = precursor.embedded_direct_emissions_value || 0;
            updatedFormValues[`source_embedded_direct_emissions_${i}`] = precursor.source_embedded_direct_emissions || "";
            updatedFormValues[`embedded_indirection_emissions_value_${i}`] = precursor.embedded_indirection_emissions_value || 0;
            updatedFormValues[`source_embedded_indirect_emissions_${i}`] = precursor.source_embedded_indirect_emissions || "";
            updatedFormValues[`justification_for_use_default_values_${i}`] = precursor.justification_for_use_default_values || "";
          });
          
                    setLocalFormValues(updatedFormValues);
          setPrecursorsCount(Math.max(precursorsCount, precursorsArray.length));
        }
        
        setDataLoaded(true);
      } else {
        console.log("No precursor data found or error in response");
      }
    } catch (error) {
      console.error("❌ Error fetching precursor data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Process form data into API submission format
  const prepareFormDataForSubmission = () => {
    // Create an array of precursor objects to submit
    const precursorSubmissions: Array<any> = [];
    
    // Get available precursor options
    const precursorOptions = industryTypeId && goodsId ? 
      getPrecursorsOptions(goodsData, industryTypeId, goodsId) || [] : [];
    
    // Process each precursor field
    for (let i = 1; i <= precursorsCount; i++) {
      const precursorName = localFormValues[`purchased_precursors_${i}`];
      
      // Skip empty precursors
      if (!precursorName) continue;
      
      const amountValue = localFormValues[`amount_${i}`];
      const amount = typeof amountValue === 'string' ? parseFloat(amountValue) : amountValue;
      
      // Skip if required fields are missing
      if (!precursorName || isNaN(amount as number)) continue;
      
      precursorSubmissions.push({
        report_id: reportId,
        route_1: precursorName,
        route_1_amounts: amount,
        country_code: localFormValues[`country_code_${i}`] || 'TH',
        embedded_direct_emissions_value: localFormValues[`embedded_direct_emissions_value_${i}`] || 0,
        source_embedded_direct_emissions: localFormValues[`source_embedded_direct_emissions_${i}`] || '',
        embedded_indirection_emissions_value: localFormValues[`embedded_indirection_emissions_value_${i}`] || 0,
        source_embedded_indirect_emissions: localFormValues[`source_embedded_indirect_emissions_${i}`] || '',
        justification_for_use_default_values: localFormValues[`justification_for_use_default_values_${i}`] || '',
        // Set other route fields to empty/zero values
        route_2: '',
        route_2_amounts: 0,
        route_3: '',
        route_3_amounts: 0,
        route_4: '',
        route_4_amounts: 0,
        route_5: '',
        route_5_amounts: 0
      });
    }
    
    return precursorSubmissions;
  };
  
  // Handle form submission - save all precursors at once
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      // Get current data for this report from API
      const fetchResponse = await fetch(`${apiUrl}/api/cbam/e_precursors/report/${reportId}`);
      const existingData = fetchResponse.ok ? await fetchResponse.json() : null;
      
      // Array of existing records to update
      const existingPrecursors = Array.isArray(existingData) ? existingData : existingData ? [existingData] : [];
      
      // Prepare submissions from form data
      const precursorSubmissions = prepareFormDataForSubmission();
      
      // Track successful operations
      const results = {
        created: 0,
        updated: 0,
        errors: 0
      };
      
      // Store API responses
      const postResponses: any[] = [];
      const putResponses: any[] = [];
      
      // Process each submission
      for (const submission of precursorSubmissions) {
        // Check if this precursor already exists (by route_1/name)
        const existingPrecursor = existingPrecursors.find(p => p.route_1 === submission.route_1);
        
        try {
          if (existingPrecursor) {
            // Update existing precursor
            const updateResponse = await fetch(`${apiUrl}/api/cbam/e_precursors/${existingPrecursor.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(submission)
            });
            
            if (updateResponse.ok) {
              const responseData = await updateResponse.json();
              putResponses.push(responseData);
              results.updated++;
            } else {
              results.errors++;
            }
          } else {
            // Create new precursor
            const createResponse = await fetch(`${apiUrl}/api/cbam/e_precursors`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(submission)
            });
            
            if (createResponse.ok) {
              const responseData = await createResponse.json();
              postResponses.push(responseData);
              results.created++;
            } else {
              results.errors++;
            }
          }
        } catch (error) {
          console.error('Error processing precursor:', submission, error);
          results.errors++;
        }
      }
      
      // Update API response state for display
      setApiResponses(prev => ({
        ...prev,
        postResponse: postResponses.length > 0 ? postResponses : null,
        putResponse: putResponses.length > 0 ? putResponses : null
      }));
      
      // Set success message
      setSuccessMessage(`Successfully saved precursors: ${results.created} created, ${results.updated} updated`);
      
      // If there were errors, also show error message
      if (results.errors > 0) {
        setErrorMessage(`Failed to save ${results.errors} precursors. Please check the console for details.`);
      }
      
      // Proceed to next step if no errors
      if (results.errors === 0 && onNextStep) {
        // Wait a moment to show the success message before moving on
        setTimeout(() => {
          onNextStep();
        }, 1500);
      }
      
    } catch (error) {
      console.error("❌ Error submitting precursor data:", error);
      setErrorMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initialization useEffect - runs only once on mount
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        // Load data sources
        const [countriesResult, goodsDataResult] = await Promise.all([
          fetchCountries(),
          fetchGoodsData(),
        ]);
        
        setCountries(countriesResult.countries);
        setGoodsData(goodsDataResult);
        
        // Initialize from localStorage or props
        const initFromData = () => {
          // Try to load from goodsFormData first (most recent)
          const goodsFormData = localStorage.getItem("goodsFormData");
          if (goodsFormData) {
            try {
              const parsed = JSON.parse(goodsFormData);
              const industry_type = Number(parsed.industry_type);
              const goods_category = Number(parsed.goods_category);
              setIndustryTypeId(industry_type);
              setGoodsId(goods_category);
              console.log(
                "Loaded from goodsFormData:",
                industry_type,
                goods_category
              );
              return true;
            } catch (error) {
              console.error("Error parsing goodsFormData:", error);
            }
          }
          
          // Use props if provided
                    // Use props if provided
          if (formValues.industry_type) {
            setIndustryTypeId(formValues.industry_type);
            setGoodsId(formValues.goods_category);
            console.log(
              "Using prop values:",
              formValues.industry_type,
              formValues.goods_category
            );
            return true;
          }
          
          return false;
        };
        
        if (initFromData()) {
          setInitialized(true);
          // Try to load existing precursor data
          await fetchExistingPrecursorData();
        }
      } catch (error) {
        console.error("❌ Error during initialization:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeData();
  }, []); // Empty dependency array: run only once on mount
  
  // Handle props changes for industry_type and goods_category
  useEffect(() => {
    if (
      formValues.industry_type !== industryTypeId &&
      formValues.industry_type !== undefined
    ) {
      setIndustryTypeId(formValues.industry_type);
    }
    if (
      formValues.goods_category !== goodsId &&
      formValues.goods_category !== undefined
    ) {
      setGoodsId(formValues.goods_category);
    }
  }, [
    formValues.industry_type,
    formValues.goods_category,
    industryTypeId,
    goodsId,
  ]);
  
  // Process precursor options when industry_type and goods_category are available
  useEffect(() => {
    if (!industryTypeId || !goodsId || !goodsData.length || !countries.length)
      return;
    
    const precursors =
      getPrecursorsOptions(goodsData, industryTypeId, goodsId) || [];
    const limitedPrecursors = precursors.slice(0, 5); // Limit to 5 precursors
    
    // Set precursors count
    setPrecursorsCount(limitedPrecursors.length);
    
    // Prepare data for precursor fields
    const precursorData = limitedPrecursors.map((precursor, index) => ({
      id: index + 1,
      name: precursor.label,
      route: String(precursor.value || ""),
      amount: 0,
      country_code: "TH", // Default to Thailand
      embedded_direct_emissions_value: 0,
      source_embedded_direct_emissions: "",
      embedded_indirect_emissions_value: 0,
      source_embedded_indirect_emissions: "",
      justification_for_use_default_values: ""
    }));
    
    setPrecursorFieldsData(precursorData);
    
    // Only set default values if we haven't loaded existing data
    if (!dataLoaded) {
      console.log("📋 Setting default precursor values (no existing data)");
      const updatedValues: { [key: string]: string | number } = {};
      
      // Process each precursor
      limitedPrecursors.forEach((precursor, index) => {
        const routeField = `route_${index + 1}` as keyof typeof formValues;
        const amountField = `route_${
          index + 1
        }_amounts` as keyof typeof formValues;
        
        // Use form values if available, otherwise use defaults
        updatedValues[`purchased_precursors_${index + 1}`] =
          formValues[routeField]?.toString() || String(precursor.value || "");
        updatedValues[`amount_${index + 1}`] =
          formValues[amountField]?.toString() || "0";
      });
      
      // Set default country to Thailand
      const defaultCountry = countries.find(
        (c) => c.abbreviation === "TH" || c.label === "Thailand"
      );
      if (defaultCountry) {
        limitedPrecursors.forEach((_, index) => {
          // Only set country if not already set
          if (!localFormValues[`country_code_${index + 1}`]) {
            updatedValues[`country_code_${index + 1}`] =
              defaultCountry.abbreviation ?? "TH";
          }
        });
      }
      
      // Update the form values
      setLocalFormValues((prev) => ({
        ...prev,
        ...updatedValues,
      }));
    } else {
      console.log("📋 Existing data already loaded, skipping default values");
    }
  }, [
    industryTypeId,
    goodsId,
    goodsData,
    countries,
    dataLoaded,
    formValues,
    localFormValues,
  ]);
  
  // Update handleChange to modify form values
  const handleChange = (
    name: string,
    value: string | number | (string | number)[]
  ) => {
    let newValue: string | number;
    if (Array.isArray(value)) {
      newValue = value.join(",");
    } else {
      newValue = value;
    }
    
    console.log(`🔄 Field ${name} changing to:`, newValue);
    
    setLocalFormValues((prev) => {
      const updated = {
        ...prev,
        [name]: newValue,
      };
      return updated;
    });
    
    // Clear errors for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  
  // Validate the full form before submission
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    // Check each precursor field
    for (let i = 1; i <= precursorsCount; i++) {
      // Check required fields
      if (!localFormValues[`purchased_precursors_${i}`]) {
        newErrors[`purchased_precursors_${i}`] = "Precursor name is required";
      }
      
      // Check country code
      if (!localFormValues[`country_code_${i}`]) {
        newErrors[`country_code_${i}`] = "Country is required";
      }
      
      // Check amount is a valid number
      const amountValue = localFormValues[`amount_${i}`];
      if (amountValue === undefined || amountValue === null || amountValue === "") {
        newErrors[`amount_${i}`] = "Amount is required";
      } else {
        const numValue = typeof amountValue === 'number' ? amountValue : parseFloat(String(amountValue));
        if (isNaN(numValue)) {
          newErrors[`amount_${i}`] = "Amount must be a number";
        } else if (numValue < 0) {
          newErrors[`amount_${i}`] = "Amount cannot be negative";
        }
      }
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Debug: Log JSON visualization
  const logJsonData = () => {
    console.log("Current Form Values:", localFormValues);
    console.log("API Responses:", apiResponses);
    console.log("Form Submission Data:", prepareFormDataForSubmission());
  };
  
  // Loading state check
  if (isLoading && !dataLoaded && !initialized) {
    return (
      <Container
        maxWidth="md"
        style={{ paddingTop: "2rem", textAlign: "center" }}
      >
        <Typography>Loading precursor data...</Typography>
      </Container>
    );
  }
  
  return (
    <Container
      maxWidth="md"
      style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
    >
      <Typography variant="h5" fontWeight="bold" gutterBottom color="#1976d2">
        Purchased precursors
                <Typography
          variant="body2"
          component="span"
          style={{ display: "block", color: "#666" }}
        >
          รายละเอียดของวัตถุดิบที่ซื้อเข้ามาใช้ในกระบวนการผลิต
        </Typography>
      </Typography>
      
      {/* Success/Error Messages */}
      {successMessage && (
        <div 
          style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '10px 15px',
            borderRadius: '4px',
            marginBottom: '15px',
            border: '1px solid #c3e6cb',
          }}
        >
          ✅ {successMessage}
        </div>
      )}

      {errorMessage && (
        <div 
          style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '10px 15px',
            borderRadius: '4px',
            marginBottom: '15px',
            border: '1px solid #f5c6cb',
          }}
        >
          ❌ {errorMessage}
        </div>
      )}
      
      {/* Debug Panel - only in dev mode */}
      {process.env.NODE_ENV === "development" && (
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Debug Tools</Typography>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={logJsonData}
            sx={{ mr: 1 }}
          >
            Log JSON Data
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={fetchExistingPrecursorData}
          >
            Refresh Data
          </Button>
        </Box>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Section
            defaultExpanded
            title="(a) List of purchased precursors"
            subtitle="รายการวัตถุดิบ"
            hasError={Object.keys(formErrors).length > 0}
          >
            {precursorsCount === 0 ? (
              <Typography
                color="#1976d2"
                sx={{ mt: 2, textAlign: "center" }}
                variant="h6"
              >
                ไม่มีรายการวัตถุดิบสำหรับผลิตภัณฑ์นี้ <br />
                กรุณากดปุ่ม continue to next step เพื่อกรอกแบบฟอร์มถัดไป
              </Typography>
            ) : (
              <>
                {/* Show available precursors */}
                {Array.from({ length: precursorsCount }).map((_, idx) => {
                  const index = idx + 1;
                  // Find the appropriate precursor from our data
                  const precursorOptions = industryTypeId && goodsId ? 
                    getPrecursorsOptions(goodsData, industryTypeId, goodsId) || [] : [];
                  
                  // Get the precursor value for this field
                  const precursorValue = precursorOptions[idx]?.value?.toString() || '';
                  
                  return (
                    <PrecursorFields
                      key={`precursor-${index}`}
                      index={index}
                      formValues={localFormValues}
                      formErrors={formErrors}
                      countries={countries}
                      onChange={handleChange}
                      precursorValue={precursorValue}
                      // precursorName={precursorOptions[idx]?.label || ''}
                      industryTypeId={industryTypeId}
                      goodsId={goodsId}
                      // readOnly={true}
                    />
                  );
                })}
              </>
            )}
          </Section>
          
          {/* JSON Data Visualization Box (collapsible) */}
          {process.env.NODE_ENV === "development" && (
            <Grid size={12}>
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 2, 
                  mb: 3, 
                  overflow: 'auto', 
                  maxHeight: '300px',
                  bgcolor: '#f5f5f5'
                }}
              >
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                  API Interaction Data
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0277bd' }}>
                    GET Response:
                  </Typography>
                  <pre style={{ margin: 0, fontSize: '0.8rem' }}>
                    {apiResponses.getResponse 
                      ? JSON.stringify(apiResponses.getResponse, null, 2) 
                      : "No data fetched yet"}
                  </pre>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                    POST Response:
                  </Typography>
                  <pre style={{ margin: 0, fontSize: '0.8rem' }}>
                    {apiResponses.postResponse 
                      ? JSON.stringify(apiResponses.postResponse, null, 2) 
                      : "No data posted yet"}
                  </pre>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#ed6c02' }}>
                    PUT Response:
                  </Typography>
                  <pre style={{ margin: 0, fontSize: '0.8rem' }}>
                    {apiResponses.putResponse 
                      ? JSON.stringify(apiResponses.putResponse, null, 2) 
                      : "No data updated yet"}
                  </pre>
                </Box>
              </Paper>
            </Grid>
          )}
          
        
     
        
        </Grid>
      </form>
    </Container>
  );
};

export default PrecursorsForm;