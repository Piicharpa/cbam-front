import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Section from "../components/Section";
import PrecursorFields1 from "./formsections/Precursors_sec1(a)";
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
    route_6?: string;
    route_6_amounts?: number;
    route_7?: string;
    route_7_amounts?: number;
    route_8?: string;
    route_8_amounts?: number;
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
  const reportId = localStorage.getItem("reportId");

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

  // Add state for selected precursor
  const [selectedPrecursorIndex, setSelectedPrecursorIndex] = useState<
    number | null
  >(null);

  // States for API responses visualization
  const [apiResponses, setApiResponses] = useState<{
    getResponse: any;
    postResponse: any;
    putResponse: any;
  }>({
    getResponse: null,
    postResponse: null,
    putResponse: null,
  });

  const [precursorFieldsData, setPrecursorFieldsData] = useState<
    Array<PrecursorSubmitData>
  >([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const apiUrl = process.env.REACT_APP_API_URL;

  // Initial form values
  const [localFormValues, setLocalFormValues] = useState<{
    [key: string]: string | number;
  }>(() => {
    // Initialize with all required fields to prevent undefined issues
    const initialValues: { [key: string]: string | number } = {};

    // Initialize for up to 8 precursors
    for (let i = 1; i <= 8; i++) {
      initialValues[`purchased_precursors_${i}`] =
        formValues[`route_${i}` as keyof typeof formValues] || "";
      initialValues[`amount_${i}`] = formValues[
        `route_${i}_amounts` as keyof typeof formValues
      ]
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
      const response = await fetch(
        `${apiUrl}/api/cbam/e_precursors/report/${reportId}`
      );
      if (response.ok) {
        const data = await response.json();
        setApiResponses((prev) => ({
          ...prev,
          getResponse: data,
        }));

        // Handle both array and single object responses
        const precursorsArray = Array.isArray(data) ? data : data ? [data] : [];

        // Create a new local form values object to populate with API data
        const updatedFormValues: { [key: string]: string | number } = {
          ...localFormValues,
        };

        // Map the API data to our form fields
        if (precursorsArray.length > 0) {
          precursorsArray.forEach((precursor, index) => {
            const i = index + 1;
            if (i > 8) return; // Only handle up to 8 precursors
            updatedFormValues[`purchased_precursors_${i}`] =
              precursor.route_1 || "";
            updatedFormValues[`amount_${i}`] = precursor.route_1_amounts || 0;
            updatedFormValues[`country_code_${i}`] =
              precursor.country_code || "TH"; // Default to Thailand
            updatedFormValues[`embedded_direct_emissions_value_${i}`] =
              precursor.embedded_direct_emissions_value || 0;
            updatedFormValues[`source_embedded_direct_emissions_${i}`] =
              precursor.source_embedded_direct_emissions || "";
            updatedFormValues[`embedded_indirection_emissions_value_${i}`] =
              precursor.embedded_indirection_emissions_value || 0;
            updatedFormValues[`source_embedded_indirect_emissions_${i}`] =
              precursor.source_embedded_indirect_emissions || "";
            updatedFormValues[`justification_for_use_default_values_${i}`] =
              precursor.justification_for_use_default_values || "";
          });

          setLocalFormValues(updatedFormValues);
          setPrecursorsCount(Math.max(precursorsCount, precursorsArray.length));
        }
        setDataLoaded(true);
      } else {
        console.error("Failed to fetch precursor data:", response.status);
      }
    } catch (error) {
      console.error("❌ Error fetching precursor data:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Modified handleSubmit to only save the selected precursor
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPrecursorIndex === null) {
      setErrorMessage("กรุณาเลือกวัตถุดิบที่ต้องการบันทึก");
      return;
    }
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      // Get current data for this report from API
      const fetchResponse = await fetch(
        `${apiUrl}/api/cbam/e_precursors/report/${reportId}`
      );
      const existingData = fetchResponse.ok ? await fetchResponse.json() : null;

      // Array of existing records to update
      const existingPrecursors = Array.isArray(existingData)
        ? existingData
        : existingData
        ? [existingData]
        : [];

      // Prepare submission data for the selected precursor only
      const precursorOptions =
        industryTypeId && goodsId
          ? getPrecursorsOptions(goodsData, industryTypeId, goodsId) || []
          : [];

      const selectedPrecursor = precursorOptions[selectedPrecursorIndex - 1];
      if (!selectedPrecursor) {
        throw new Error(
          `ไม่พบข้อมูลวัตถุดิบที่เลือก (ลำดับที่ ${selectedPrecursorIndex})`
        );
      }

      const precursorName = selectedPrecursor.value.toString();
      const amountValue = localFormValues[`amount_${selectedPrecursorIndex}`];
      const amount =
        typeof amountValue === "string" ? parseFloat(amountValue) : amountValue;

      // Skip if required fields are missing
      if (!precursorName || isNaN(amount as number)) {
        setErrorMessage("กรุณากรอกข้อมูลชื่อวัตถุดิบและจำนวนให้ถูกต้อง");
        setIsLoading(false);
        return;
      }

      // Fixed submission object with proper field names
      const submission = {
        // Basic info
        report_id: reportId,
        name: precursorName, // Include name field
        precursors: precursorName, // Match precursors field in API response

        // Routes data
        route_1: precursorName,
        route_1_amounts: amount,
        route_2: "",
        route_2_amounts: 0,
        route_3: "",
        route_3_amounts: 0,
        route_4: "",
        route_4_amounts: 0,
        route_5: "",
        route_5_amounts: 0,
        route_6: "",
        route_6_amounts: 0,
        route_7: "",
        route_7_amounts: 0,
        route_8: "",
        route_8_amounts: 0,

        // Country data
        country_code:
          localFormValues[`country_code_${selectedPrecursorIndex}`] || "TH",

        // Emissions data
        embedded_direct_emissions_value:
          localFormValues[
            `embedded_direct_emissions_value_${selectedPrecursorIndex}`
          ] || 0,
        source_embedded_direct_emissions:
          localFormValues[
            `source_embedded_direct_emissions_${selectedPrecursorIndex}`
          ] || "",

        // Match field name as per API response
        embedded_indirection_emissions_value:
          localFormValues[
            `embedded_indirection_emissions_value_${selectedPrecursorIndex}`
          ] || 0,
        source_embedded_indirect_emissions:
          localFormValues[
            `source_embedded_indirect_emissions_${selectedPrecursorIndex}`
          ] || "",

        // Additional fields needed by API
        total_consumed_within_installation: amount, // Set to same as amount
        consumed_in_production_amounts: 0,
        consumed_non_cbam_goods_amounts: 0,
        total_consumed_within_installation_amounts: amount, // Set to same as amount

        justification_for_use_default_values:
          localFormValues[
            `justification_for_use_default_values_${selectedPrecursorIndex}`
          ] || "",
      };

      // Track successful operations
      const results = {
        created: 0,
        updated: 0,
        errors: 0,
      };

      // Store API responses
      const postResponses: any[] = [];
      const putResponses: any[] = [];

      // Check if this precursor already exists (by route_1/name)
      const existingPrecursor = existingPrecursors.find(
        (p) => p.route_1 === precursorName
      );

      try {
        if (existingPrecursor) {
          // Update existing precursor
          const updateResponse = await fetch(
            `${apiUrl}/api/cbam/e_precursors/${existingPrecursor.id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(submission),
            }
          );

          if (updateResponse.ok) {
            const responseData = await updateResponse.json();
            putResponses.push(responseData);
            results.updated++;
            console.log("Update successful:", responseData);
          } else {
            const errorText = await updateResponse.text();
            console.error(
              `Update failed (${updateResponse.status}):`,
              errorText
            );
            results.errors++;
          }
        } else {
          // Create new precursor
          const createResponse = await fetch(
            `${apiUrl}/api/cbam/e_precursors`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(submission),
            }
          );

          if (createResponse.ok) {
            const responseData = await createResponse.json();
            postResponses.push(responseData);
            results.created++;
            console.log("Create successful:", responseData);
          } else {
            const errorText = await createResponse.text();
            console.error(
              `Create failed (${createResponse.status}):`,
              errorText
            );
            results.errors++;
          }
        }
      } catch (error) {
        console.error("Error processing precursor:", submission, error);
        results.errors++;
      }

      // Update API response state for display
      setApiResponses((prev) => ({
        ...prev,
        postResponse: postResponses.length > 0 ? postResponses : null,
        putResponse: putResponses.length > 0 ? putResponses : null,
      }));

      // Set success message
      setSuccessMessage(
        `บันทึกข้อมูลวัตถุดิบสำเร็จ ${
          results.created > 0 ? "(สร้างใหม่)" : "(อัพเดทข้อมูล)"
        }`
      );

      // If there were errors, also show error message
      if (results.errors > 0) {
        setErrorMessage(
          `ไม่สามารถบันทึกข้อมูลวัตถุดิบได้ กรุณาตรวจสอบข้อมูลและลองอีกครั้ง`
        );
      }

      // Refresh the precursor data to show updated information
      await fetchExistingPrecursorData();
    } catch (error) {
      console.error("❌ Error submitting precursor data:", error);
      setErrorMessage(
        `เกิดข้อผิดพลาด: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`
      );
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
              return true;
            } catch (error) {
              console.error("Error parsing goodsFormData:", error);
            }
          }

          // Use props if provided
          if (formValues.industry_type) {
            setIndustryTypeId(formValues.industry_type);
            setGoodsId(formValues.goods_category);
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
    const limitedPrecursors = precursors.slice(0, 8); // Limit to 8 precursors

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
      justification_for_use_default_values: "",
    }));
    setPrecursorFieldsData(precursorData);

    // Only set default values if we haven't loaded existing data
    if (!dataLoaded) {
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

  // Auto-select first precursor with data when data is loaded
  useEffect(() => {
    if (
      dataLoaded &&
      precursorFieldsData.length > 0 &&
      selectedPrecursorIndex === null
    ) {
      // Find first precursor with amount > 0
      for (let i = 1; i <= precursorsCount; i++) {
        const amount = parseFloat(
          String(localFormValues[`amount_${i}`] || "0")
        );
        if (amount > 0) {
          setSelectedPrecursorIndex(i);
          break;
        }
      }

      // If none has amount > 0, select the first one
      if (selectedPrecursorIndex === null && precursorsCount > 0) {
        setSelectedPrecursorIndex(1);
      }
    }
  }, [
    dataLoaded,
    precursorFieldsData,
    precursorsCount,
    localFormValues,
    selectedPrecursorIndex,
  ]);

  // Loading state check
  if (isLoading && !dataLoaded && !initialized) {
    return (
      <Container
        maxWidth="md"
        style={{ paddingTop: "2rem", textAlign: "center" }}
      >
        <CircularProgress size={40} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          กำลังโหลดข้อมูลวัตถุดิบ...
        </Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="md"
      style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
    >
      <Typography
        variant="h5"
        fontSize="32px"
        fontWeight="bold"
        gutterBottom
        color="#1976d2"
      >
        Purchased precursors
        <Typography
          fontSize="22px"
          variant="body2"
          component="span"
          style={{ display: "block", color: "#666" }}
        >
          รายละเอียดของวัตถุดิบที่ซื้อเข้ามาใช้ในกระบวนการผลิต
        </Typography>
      </Typography>

      {/* Success/Error Messages */}
      {successMessage && (
        <Box
          sx={{
            backgroundColor: "#d4edda",
            color: "#155724",
            padding: "10px 15px",
            borderRadius: "4px",
            marginBottom: "15px",
            border: "1px solid #c3e6cb",
          }}
        >
          ✅ {successMessage}
        </Box>
      )}

      {errorMessage && (
        <Box
          sx={{
            backgroundColor: "#f8d7da",
            color: "#721c24",
            padding: "10px 15px",
            borderRadius: "4px",
            marginBottom: "15px",
            border: "1px solid #f5c6cb",
          }}
        >
          ❌ {errorMessage}
        </Box>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {precursorsCount === 0 ? (
            <Grid size={12}>
              <Section
                title="List of purchased precursors"
                subtitle="รายการวัตถุดิบ"
                hasError={false}
              >
                <Typography
                  color="#1976d2"
                  sx={{ mt: 2, textAlign: "center" }}
                  variant="h6"
                >
                  ไม่มีรายการวัตถุดิบสำหรับผลิตภัณฑ์นี้ <br />
                  กรุณากดปุ่ม continue to next step เพื่อกรอกแบบฟอร์มถัดไป
                </Typography>
              </Section>
            </Grid>
          ) : (
            <>
              <Grid size={12}>
                <Section
                  defaultExpanded
                  title="เลือกวัตถุดิบที่ต้องการใช้งาน:"
                  subtitle="รายการวัตถุดิบ (เลือกเพียง 1 รายการ)"
                  hasError={false}
                >
                  {/* Precursor selection list */}
                  <Box sx={{ mb: 3 }}>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      {precursorFieldsData.map((precursor, idx) => {
                        const index = idx + 1;
                        const precursorOptions =
                          industryTypeId && goodsId
                            ? getPrecursorsOptions(
                                goodsData,
                                industryTypeId,
                                goodsId
                              ) || []
                            : [];
                        const precursorData = precursorOptions[idx];
                        const precursorName =
                          precursorData?.label || `Precursor ${index}`;
                        const amount = parseFloat(
                          String(localFormValues[`amount_${index}`] || "0")
                        );
                        return (
                          <Paper
                            key={`precursor-option-${index}`}
                            onClick={() => setSelectedPrecursorIndex(index)}
                            elevation={selectedPrecursorIndex === index ? 3 : 1}
                            sx={{
                              p: 2,
                              border:
                                selectedPrecursorIndex === index
                                  ? "2px solid #1976d2"
                                  : "1px solid #e0e0e0",
                              borderRadius: "4px",
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              backgroundColor:
                                selectedPrecursorIndex === index
                                  ? "#f5f9ff"
                                  : "white",
                              "&:hover": {
                                backgroundColor:
                                  selectedPrecursorIndex === index
                                    ? "#f5f9ff"
                                    : "#f8f9fa",
                              },
                            }}
                          >
                            <div>
                              <Typography fontWeight="bold">
                                {precursorName}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {precursorData?.value
                                  ? `Code: ${precursorData.value}`
                                  : ""}
                              </Typography>
                            </div>
                            {amount > 0 && (
                              <Box
                                sx={{
                                  bgcolor: "#e8f5e9",
                                  color: "#2e7d32",
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: "4px",
                                  fontSize: "0.875rem",
                                }}
                              >
                                มีข้อมูล
                              </Box>
                            )}
                          </Paper>
                        );
                      })}
                    </Box>
                  </Box>
                </Section>

                <Section
                  title="List of purchased precursors"
                  subtitle="รายการวัตถุดิบ (เลือกเพียง 1 รายการ)"
                  hasError={false}
                >
                  {/* Selected precursor form */}
                  {selectedPrecursorIndex !== null && (
                    <Box>
                      <div
                        style={{
                          textAlign: "left",
                          marginBottom: "1.5rem",
                          fontSize: "20px",
                        }}
                      >
                        <strong>
                          {(() => {
                            const precursorOptions =
                              industryTypeId && goodsId
                                ? getPrecursorsOptions(
                                    goodsData,
                                    industryTypeId,
                                    goodsId
                                  ) || []
                                : [];
                            const precursor =
                              precursorOptions[selectedPrecursorIndex - 1];
                            return (
                              precursor?.label ||
                              `Precursor ${selectedPrecursorIndex}`
                            );
                          })()}
                        </strong>
                      </div>

                      <PrecursorFields1
                        index={selectedPrecursorIndex}
                        formValues={localFormValues}
                        formErrors={formErrors}
                        countries={countries}
                        onChange={handleChange}
                        precursorValue={(() => {
                          const precursorOptions =
                            industryTypeId && goodsId
                              ? getPrecursorsOptions(
                                  goodsData,
                                  industryTypeId,
                                  goodsId
                                ) || []
                              : [];
                          const precursor =
                            precursorOptions[selectedPrecursorIndex - 1];
                          return precursor?.value?.toString() || "";
                        })()}
                        industryTypeId={industryTypeId}
                        goodsId={goodsId}
                        onNextStep={onNextStep}
                      />
                    </Box>
                  )}
                </Section>
              </Grid>

              {/* Show next step button if at least one precursor has been saved */}
              {successMessage && (
                <Grid
                  size={12}
                  sx={{ display: "flex", justifyContent: "center", mt: 2 }}
                >
                  <button
                    onClick={onNextStep}
                    type="button"
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "16px",
                      cursor: "pointer",
                    }}
                  >
                    Continue to Next Step
                  </button>
                </Grid>
              )}
            </>
          )}

          {/* ✅ Instructions for user */}
          <Grid size={12}>
            <div
              style={{
                textAlign: "center",
                color: "#666",
                fontSize: "0.9rem",
                marginTop: "1rem",
              }}
            >
              💡 After saving, use "Continue to Next Step" button to proceed to
              Installation details
            </div>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default PrecursorsForm;
