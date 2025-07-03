import React, { useState, useEffect, useRef } from "react";
import { Container, Typography, Grid } from "@mui/material";
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
  const reportId = 54;

  // State management
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [goodsData, setGoodsData] = useState<IndustryGroup[]>([]);
  const [precursorsCount, setPrecursorsCount] = useState<number>(0);
  const [existingPrecursorId, setExistingPrecursorId] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [percursorId, setpercursortId] = useState<string | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;

  // Use values from props or localStorage
  const [industryTypeId, setIndustryTypeId] = useState<number | undefined>(
    formValues.industry_type
  );
  const [goodsId, setGoodsId] = useState<number | undefined>(
    formValues.goods_category
  );
  const [localFormValues, setLocalFormValues] = useState<{
    [key: string]: string | number;
  }>(() => {
    // Initialize with all required fields to prevent undefined issues
    const initialValues: { [key: string]: string | number } = {
      purchased_precursors_1: formValues.route_1 || "",
      amount_1: formValues.route_1_amounts
        ? String(formValues.route_1_amounts)
        : "",
      purchased_precursors_2: formValues.route_2 || "",
      amount_2: formValues.route_2_amounts
        ? String(formValues.route_2_amounts)
        : "",
      purchased_precursors_3: formValues.route_3 || "",
      amount_3: formValues.route_3_amounts
        ? String(formValues.route_3_amounts)
        : "",
      purchased_precursors_4: formValues.route_4 || "",
      amount_4: formValues.route_4_amounts
        ? String(formValues.route_4_amounts)
        : "",
      purchased_precursors_5: formValues.route_5 || "",
      amount_5: formValues.route_5_amounts
        ? String(formValues.route_5_amounts)
        : "",
    };

    // Initialize country codes
    for (let i = 1; i <= 5; i++) {
      initialValues[`country_code_${i}`] = "";
    }

    return initialValues;
  });

  // Fetch existing precursor data
  const fetchExistingPrecursorData = async () => {
    setIsLoading(true);
    try {
      let response;
      let existingData = null;

      // Method 1: Try to get by report ID
      try {
        response = await fetch(
          `${apiUrl}/api/cbam/e_precursors/report/${reportId}`
        );
        if (response.ok) {
          existingData = await response.json();
          console.log("📦 Found data by report ID:", existingData);
        }
      } catch (error) {
        console.log(
          "Report-specific endpoint not available, trying general endpoint"
        );
      }

      // Method 2: If report-specific endpoint doesn't work, get all and filter
      if (!existingData) {
        try {
          response = await fetch(`${apiUrl}/api/cbam/e_precursors`);
          if (response.ok) {
            const allData = await response.json();
            console.log("📦 All precursor data:", allData);

            existingData = Array.isArray(allData)
              ? allData.filter((item) => item.report_id == reportId)
              : allData.report_id == reportId
              ? [allData]
              : null;

            if (existingData && existingData.length > 0) {
              console.log("📦 Found matching data for report:", existingData);
            }
          }
        } catch (error) {
          console.error("Failed to fetch all precursors:", error);
        }
      }

      if (existingData && existingData.length > 0) {
        const sortedData = Array.isArray(existingData)
          ? existingData.sort((a, b) => b.id - a.id)
          : [existingData];
        const precursorData = sortedData[0];

        if (precursorData && precursorData.id) {
          setExistingPrecursorId(precursorData.id);
          console.log("🎯 Setting existing precursor ID:", precursorData.id);
          console.log("🔍 Raw precursor data:", precursorData);

          // FIXED: Load data according to actual database schema
          const loadedFormValues: { [key: string]: string | number } = {};

          // Load routes and amounts - Convert database values to form values
          for (let i = 1; i <= 5; i++) {
            const routeKey = `route_${i}`;
            const amountKey = `route_${i}_amounts`;

            // Load route
            loadedFormValues[`purchased_precursors_${i}`] =
              precursorData[routeKey] || "";

            // Load amount - handle numeric values properly
            const amountValue = precursorData[amountKey];
            if (amountValue !== null && amountValue !== undefined) {
              loadedFormValues[`amount_${i}`] = String(amountValue); // Convert to string for form input
              console.log(
                `💰 Loading amount_${i}:`,
                amountValue,
                "→",
                String(amountValue)
              );
            } else {
              loadedFormValues[`amount_${i}`] = "";
            }
          }

          // FIXED: Handle single country_code field from database
          // Set the same country for all precursor fields in the form
          if (precursorData.country_code) {
            for (let i = 1; i <= 5; i++) {
              loadedFormValues[`country_code_${i}`] =
                precursorData.country_code;
            }
            console.log("🌏 Loading country code:", precursorData.country_code);
          } else {
            // Set default country to Thailand
            const defaultCountry = countries.find(
              (c) => c.abbreviation === "TH" || c.label === "Thailand"
            );
            if (defaultCountry) {
              for (let i = 1; i <= 5; i++) {
                loadedFormValues[`country_code_${i}`] =
                  defaultCountry.abbreviation || "";
              }
              console.log(
                "🌏 Setting default country:",
                defaultCountry.abbreviation
              );
            }
          }

          // Load other single fields if they exist
          const singleFields = [
            "embedded_direct_emissions_value",
            "source_embedded_direct_emissions",
            "embedded_indirection_emissions_value",
            "source_embedded_indirect_emissions",
            "justification_for_use_default_values",
            "consumed_in_production_amounts",
            "consumed_non_cbam_goods_amounts",
            "total_consumed_within_installation",
            "total_consumed_within_installation_amounts",
          ];

          singleFields.forEach((field) => {
            if (
              precursorData[field] !== null &&
              precursorData[field] !== undefined
            ) {
              loadedFormValues[field] = precursorData[field];
            }
          });

          console.log("📝 Final loaded values:", loadedFormValues);

          // Update form values
          setLocalFormValues((prev) => {
            const updated = { ...prev, ...loadedFormValues };
            console.log("🔄 Updated form state:", updated);
            return updated;
          });

          setDataLoaded(true);
        }
      } else {
        console.log(
          "ℹ️ No existing precursor data found for report ID:",
          reportId
        );
        setExistingPrecursorId(null);
      }
    } catch (error) {
      console.error("❌ Error fetching existing precursor data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Manual refresh function for debugging
  const refreshExistingData = async () => {
    console.log("🔄 Manually refreshing precursor data...");
    await fetchExistingPrecursorData();
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
  // Process precursor options when industry_type and goods_category are available
  useEffect(() => {
    if (!industryTypeId || !goodsId || !goodsData.length || !countries.length)
      return;

    const precursors =
      getPrecursorsOptions(goodsData, industryTypeId, goodsId) || [];
    const limitedPrecursors = precursors.slice(0, 6);

    setPrecursorsCount(limitedPrecursors.length);

    // ONLY set default values if we haven't loaded existing data
    if (!dataLoaded && !existingPrecursorId) {
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
          formValues[amountField]?.toString() || "";
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
              defaultCountry.abbreviation ?? "";
          }
        });
      }

      // Update the form values
      setLocalFormValues((prev) => ({
        ...prev,
        ...updatedValues,
      }));
    } else if (dataLoaded) {
      console.log("📋 Existing data already loaded, skipping default values");
    }
  }, [
    industryTypeId,
    goodsId,
    goodsData,
    countries,
    dataLoaded,
    existingPrecursorId,
    formValues,
    localFormValues,
  ]);

  // Add a ref to track previous form values for comparison
  const formValuesPrevRef = React.useRef<string>("");

  useEffect(() => {
    // Skip if necessary conditions aren't met
    if (!onChange || precursorsCount <= 0) return;

    // Use a ref to prevent calling onChange unnecessarily
    const currentFormValues = JSON.stringify({
      industry_type: industryTypeId,
      goods_category: goodsId,
      route_1: localFormValues["purchased_precursors_1"],
      route_1_amounts: localFormValues["amount_1"],
      route_2: localFormValues["purchased_precursors_2"],
      route_2_amounts: localFormValues["amount_2"],
      route_3: localFormValues["purchased_precursors_3"],
      route_3_amounts: localFormValues["amount_3"],
      route_4: localFormValues["purchased_precursors_4"],
      route_4_amounts: localFormValues["amount_4"],
      route_5: localFormValues["purchased_precursors_5"],
      route_5_amounts: localFormValues["amount_5"],
    });

    if (currentFormValues !== formValuesPrevRef.current) {
      formValuesPrevRef.current = currentFormValues;
      // Create the updated form values to pass up
      const updatedFormValues = {
        ...formValues,
        industry_type: industryTypeId,
        goods_category: goodsId,
        route_1: localFormValues["purchased_precursors_1"]?.toString() || "",
        route_1_amounts: parseFloat(
          localFormValues["amount_1"]?.toString() || "0"
        ),
        route_2: localFormValues["purchased_precursors_2"]?.toString() || "",
        route_2_amounts: parseFloat(
          localFormValues["amount_2"]?.toString() || "0"
        ),
        route_3: localFormValues["purchased_precursors_3"]?.toString() || "",
        route_3_amounts: parseFloat(
          localFormValues["amount_3"]?.toString() || "0"
        ),
        route_4: localFormValues["purchased_precursors_4"]?.toString() || "",
        route_4_amounts: parseFloat(
          localFormValues["amount_4"]?.toString() || "0"
        ),
        route_5_amounts: parseFloat(
          localFormValues["amount_5"]?.toString() || "0"
        ),
      };
      // Notify parent
      onChange(updatedFormValues);
    }
  }, [
    onChange,
    precursorsCount,
    industryTypeId,
    goodsId,
    localFormValues,
    formValues,
  ]);

  // Add a ref to track previous values
  const previousValuesRef = useRef<{ [key: string]: string | number }>({});

  // Update handleChange to prevent unnecessary updates
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

    console.log(`🔄 Field ${name} changing to:`, newValue, typeof newValue);

    // Only update if the value has changed
    if (previousValuesRef.current[name] !== newValue) {
      previousValuesRef.current[name] = newValue;

      setLocalFormValues((prev) => {
        const updated = {
          ...prev,
          [name]: newValue,
        };
        console.log(`📝 Updated localFormValues:`, updated);
        return updated;
      });

      // Clear errors for this field
      if (formErrors[name]) {
        setFormErrors((prev) => ({ ...prev, [name]: "" }));
      }

      // Update parent component if needed
      if (
        (onChange && name.startsWith("purchased_precursors_")) ||
        name.startsWith("amount_") ||
        name.startsWith("country_code_")
      ) {
        const updatedFormValues = createUpdatedFormValues();
        onChange(updatedFormValues);
      }
    }
  };

  // Helper function to create updated form values
  const createUpdatedFormValues = () => {
    return {
      ...formValues,
      industry_type: industryTypeId,
      goods_category: goodsId,
      route_1: localFormValues["purchased_precursors_1"]?.toString() || "",
      route_1_amounts: parseFloat(
        localFormValues["amount_1"]?.toString() || "0"
      ),
      route_2: localFormValues["purchased_precursors_2"]?.toString() || "",
      route_2_amounts: parseFloat(
        localFormValues["amount_2"]?.toString() || "0"
      ),
      route_3: localFormValues["purchased_precursors_3"]?.toString() || "",
      route_3_amounts: parseFloat(
        localFormValues["amount_3"]?.toString() || "0"
      ),
      route_4: localFormValues["purchased_precursors_4"]?.toString() || "",
      route_4_amounts: parseFloat(
        localFormValues["amount_4"]?.toString() || "0"
      ),
      route_5: localFormValues["purchased_precursors_5"]?.toString() || "",
      route_5_amounts: parseFloat(
        localFormValues["amount_5"]?.toString() || "0"
      ),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission

    // Validate form fields
    const newErrors: { [key: string]: string } = {};
    for (let i = 1; i <= precursorsCount; i++) {
        if (!localFormValues[`purchased_precursors_${i}`]) {
            newErrors[`purchased_precursors_${i}`] = "กรุณากรอกข้อมูล";
        }

        if (!localFormValues[`country_code_${i}`]) {
            newErrors[`country_code_${i}`] = "กรุณาเลือกประเทศ";
        }

        const amountValue = localFormValues[`amount_${i}`];
        if (amountValue === "" || amountValue === null || amountValue === undefined) {
            newErrors[`amount_${i}`] = "กรุณาระบุจำนวน";
        } else {
            const numValue = parseFloat(String(amountValue));
            if (isNaN(numValue) || numValue < 0) {
                newErrors[`amount_${i}`] = "กรุณาระบุจำนวนที่ถูกต้อง";
            }
        }
    }

    // Update form errors state
    setFormErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
        const firstErrorField = Object.keys(newErrors)[0];
        const errorElement = document.getElementsByName(firstErrorField)[0];
        if (errorElement) errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        return; // Exit if there are validation errors
    }

    // Create payload to match your database schema
    const payload: Record<string, any> = {
        report_id: reportId,
        name: localFormValues.name || "", // Include other fields as needed
        total_consumed_within_installation: localFormValues.total_consumed_within_installation || 0,
        consumed_in_production_amounts: localFormValues.consumed_in_production_amounts || 0,
        consumed_non_cbam_goods_amounts: localFormValues.consumed_non_cbam_goods_amounts || 0,
        embedded_direct_emissions_value: localFormValues.embedded_direct_emissions_value || 0,
        source_embedded_direct_emissions: localFormValues.source_embedded_direct_emissions || "",
        embedded_indirectional_emissions_value: localFormValues.embedded_indirection_emissions_value || 0,
        source_embedded_indirect_emissions: localFormValues.source_embedded_indirect_emissions || "",
        justification_for_use_default_values: localFormValues.justification_for_use_default_values || "",
    };

    // Add routes and their corresponding amounts
    for (let i = 1; i <= 5; i++) {
        const routeKey = `purchased_precursors_${i}`;
        const amountKey = `amount_${i}`;
        payload[`route_${i}`] = localFormValues[routeKey] || "";
        payload[`route_${i}_amounts`] = parseFloat(localFormValues[amountKey]?.toString() || "0");
    }

    // Log payload structure for debugging
    console.log("Sending payload:", JSON.stringify(payload, null, 2));

    // Hide errors before submitting
    setFormErrors({});

    try {
        const method = existingPrecursorId ? "PUT" : "POST"; // Determine method
        const url = existingPrecursorId 
            ? `${apiUrl}/api/cbam/e_precursors/${existingPrecursorId}` 
            : `${apiUrl}/api/cbam/e_precursors`;

        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${errorText}`);
        }

        const data = await response.json();
        console.log("Success response:", data);
        onChange(localFormValues);
        onNextStep && onNextStep();

    } catch (err) {
        const errorMessage = (err instanceof Error) ? err.message : 'Unknown error occurred.';
        console.error("POST/PUT error:", errorMessage);
        alert(`บันทึกข้อมูลไม่สำเร็จ: ${errorMessage}`);
    }
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

      {/* Enhanced debug section to show payload structure */}
      {process.env.NODE_ENV === "development" && (
        <div
          style={{
            padding: "10px",
            margin: "10px 0",
            backgroundColor: "#e3f2fd",
            borderRadius: "4px",
            fontSize: "11px",
          }}
        >
          <Typography variant="subtitle2">🔧 Payload Preview:</Typography>
          <button
            type="button"
            onClick={() => {
              const testPayload = {
                report_id: reportId,
                name: "",
                route_1: localFormValues["purchased_precursors_1"] || "",
                route_1_amounts: parseFloat(
                  String(localFormValues["amount_1"]) || "0"
                ),
                route_2: localFormValues["purchased_precursors_2"] || "",
                route_2_amounts: parseFloat(
                  String(localFormValues["amount_2"]) || "0"
                ),
                route_3: localFormValues["purchased_precursors_3"] || "",
                route_3_amounts: parseFloat(
                  String(localFormValues["amount_3"]) || "0"
                ),
                route_4: localFormValues["purchased_precursors_4"] || "",
                route_4_amounts: parseFloat(
                  String(localFormValues["amount_4"]) || "0"
                ),
                route_5: localFormValues["purchased_precursors_5"] || "",
                route_5_amounts: parseFloat(
                  String(localFormValues["amount_5"]) || "0"
                ),
                country_code: localFormValues["country_code_1"] || "TH",
                total_consumed_within_installation: 0,
                consumed_in_production_amounts: 0,
                consumed_non_cbam_goods_amounts: 0,
                total_consumed_within_installation_amounts: 0,
                embedded_direct_emissions_value: 0,
                source_embedded_direct_emissions: "",
                embedded_indirection_emissions_value: 0,
                source_embedded_indirect_emissions: "",
                justification_for_use_default_values: "",
              };
              console.log("🚀 Test Payload:", testPayload);
            }}
            style={{
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              padding: "4px 8px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            🚀 Preview Payload
          </button>
        </div>
      )}

      {/* Error display */}
      {Object.keys(formErrors).length > 0 && (
        <div
          style={{
            padding: "10px",
            margin: "10px 0",
            backgroundColor: "#ffebee",
            border: "1px solid #f44336",
            borderRadius: "4px",
          }}
        >
          <Typography color="error" variant="body2">
            <strong>⚠️ Please fix the following errors:</strong>
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
        </div>
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
                variant="h4"
              >
                ไม่มีรายการวัตถุดิบสำหรับผลิตภัณฑ์นี้ <br />
                กรุณากดปุ่ม continue to next step เพื่อกรอกแบบฟอร์มถัดไป
              </Typography>
            ) : (
              Array.from({ length: precursorsCount }).map((_, idx) => {
                // Get the fixed precursor value from localFormValues
                const fixedPrecursorValue = String(
                  localFormValues[`purchased_precursors_${idx + 1}`] ?? ""
                );
                return (
                  <PrecursorFields
                    key={idx + 1}
                    index={idx + 1}
                    formValues={localFormValues}
                    formErrors={formErrors}
                    countries={countries}
                    onChange={handleChange}
                    precursorValue={fixedPrecursorValue}
                    routeValue=""
                    industryTypeId={industryTypeId}
                    goodsId={goodsId}
                  />
                );
              })
            )}
          </Section>

          {/* Submit Button */}
          <Grid size={12}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "2rem",
              }}
            >
              <PGButton
                type="submit"
                disabled={isLoading}
                style={{
                  minWidth: "200px",
                  padding: "12px 24px",
                }}
              >
                {isLoading
                  ? "💾 Saving..."
                  : existingPrecursorId
                  ? "🔄 Update Precursor Data"
                  : "💾 Save Precursor Data"}
              </PGButton>
            </div>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default PrecursorsForm;
