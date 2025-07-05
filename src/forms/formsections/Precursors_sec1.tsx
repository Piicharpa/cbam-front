import React, { useState, useEffect } from "react";
import { Button, IconButton, Box, CircularProgress } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import LabeledTextField from "../../components/LabeledTextField";
import LabeledAutocomplete from "../../components/LabeledAutoComplete";
import LabeledAutocompleteMap from "../../components/LabeledAutoCompleteMap";
import { CountryOption } from "../../components/dropdown/contriesmap";
import {
  fetchGoodsData,
  getRoutesOptions,
  OptionType,
} from "../../components/dropdown/goods";
import { justification } from "../../components/dropdown/justification";

// Updated PrecursorSubmitData interface that matches the database structure
export interface PrecursorSubmitData {
  id?: number;
  report_id?: string | number;
  precursors?: string | null;
  name?: string;
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
  country_code?: string;
  total_consumed_within_installation?: number;
  consumed_in_production_amounts?: number;
  consumed_non_cbam_goods_amounts?: number;
  total_consumed_within_installation_amounts?: number;
  embedded_direct_emissions_value?: number;
  source_embedded_direct_emissions?: string;
  embedded_indirection_emissions_value?: number;
  source_embedded_indirect_emissions?: string;
  justification_for_use_default_values?: string;
  created_at?: string;
  updated_at?: string;
  // Legacy fields for backward compatibility
  route?: string;
  amount?: number;
}

interface PrecursorFieldsProps {
  index: number;
  formValues: { [key: string]: string | number | undefined };
  formErrors: { [key: string]: string | undefined };
  countries: CountryOption[];
  onChange: (
    name: string,
    value: string | number | (string | number)[]
  ) => void;
  precursorValue?: string;
  routeValue?: string;
  industryTypeId?: number;
  goodsId?: number;
  onSave?: (data: PrecursorSubmitData) => Promise<any>;
  onDelete?: () => Promise<void>;
  isSaved?: boolean;
  precursorId?: number;
  reportId?: number; // Prop for report ID
}

interface PrecursorApiData {
  id?: number;
  report_id?: number;
  precursors?: string | null;
  name?: string;
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
  country_code?: string;
  total_consumed_within_installation?: number;
  consumed_in_production_amounts?: number;
  consumed_non_cbam_goods_amounts?: number;
  total_consumed_within_installation_amounts?: number;
  embedded_direct_emissions_value?: number;
  source_embedded_direct_emissions?: string;
  embedded_indirection_emissions_value?: number;
  source_embedded_indirect_emissions?: string;
  justification_for_use_default_values?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any; // Allow any other fields
}

const PrecursorFields: React.FC<PrecursorFieldsProps> = ({
  index,
  formValues,
  formErrors,
  countries,
  onChange,
  precursorValue = "",
  routeValue = "",
  industryTypeId,
  goodsId,
  onSave,
  onDelete,
  isSaved = false,
  precursorId,
  reportId: propsReportId,
}) => {
  const [routeOptions, setRouteOptions] = useState<OptionType[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState<boolean>(false);
  const [routeCount, setRouteCount] = useState<number>(1);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [fieldValues, setFieldValues] = useState<{
    [key: string]: string | number;
  }>({});
  const [previousData, setPreviousData] = useState<PrecursorApiData | null>(
    null
  );
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [existingData, setExistingData] = useState<PrecursorApiData | null>(
    null
  );

  const apiUrl = process.env.REACT_APP_API_URL || "http://178.128.123.212:5000";
  // Use report ID from props if available, otherwise use default
  const reportId = propsReportId;
  // const reportId = 23;

  // Fetch existing data for this precursor based on report ID and index
  // Fetch existing data for this precursor based on report ID and index
  const fetchExistingData = async () => {
    if (!reportId) return;
    setIsLoadingData(true);
    try {
      const response = await fetch(
        `${apiUrl}/api/cbam/e_precursors/report/${reportId}`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch data: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
      console.log(`📊 Fetched precursor data for report #${reportId}:`, data);

      // Store the raw API response
      setApiResponse(data);

      // Handle both array and single object responses
      const precursorsArray = Array.isArray(data) ? data : data ? [data] : [];

      // If no precursors were found, we will later allow saving new data
      if (precursorsArray.length === 0) {
        console.log("ℹ️ No existing precursors found.");
        return; // Early return, no need to process further
      }

      // Find the precursor that matches our index based on route_1 matching precursorValue
      // or by checking for previously saved precursor with same ID
      const matchingPrecursor = precursorsArray.find(
        (p) =>
          (precursorValue && p.route_1 === precursorValue) ||
          (precursorId && p.id === precursorId)
      );

      if (matchingPrecursor) {
        console.log(
          `✅ Found matching precursor for index ${index}:`,
          matchingPrecursor
        );
        setExistingData(matchingPrecursor);

        // เก็บข้อมูลเดิมไว้ในสถานะที่แยกออกมา เพื่อใช้เป็น fallback
        setPreviousData(matchingPrecursor);

        updateFieldsFromApiData(matchingPrecursor);

        // If the precursor has an ID but our component doesn't know about it yet
        if (matchingPrecursor.id && !precursorId && onSave) {
          // Notify parent component about this existing record
          const precursorData: PrecursorSubmitData =
            mapApiDataToPrecursorData(matchingPrecursor);
          onSave(precursorData);
        }
      } else {
        console.log(
          `ℹ️ No matching precursor found for index ${index} with value ${precursorValue}`
        );
      }
    } catch (error) {
      console.error(
        `❌ Error fetching precursor data for report #${reportId}:`,
        error
      );
    } finally {
      setIsLoadingData(false);
    }
  };

  // Map API data to field values
  const updateFieldsFromApiData = (data: PrecursorApiData) => {
    const updatedValues: { [key: string]: string | number } = {
      ...fieldValues,
    };

    // Map the API fields to our form fields
    updatedValues[`purchased_precursors_${index}`] =
      data.route_1 || precursorValue || "";
    updatedValues[`amount_${index}`] = data.route_1_amounts || 0;
    updatedValues[`country_code_${index}`] = data.country_code || "";
    updatedValues[`embedded_direct_emissions_value_${index}`] =
      data.embedded_direct_emissions_value || 0;
    updatedValues[`source_embedded_direct_emissions_${index}`] =
      data.source_embedded_direct_emissions || "";
    updatedValues[`embedded_indirection_emissions_value_${index}`] =
      data.embedded_indirection_emissions_value || 0;
    updatedValues[`source_embedded_indirect_emissions_${index}`] =
      data.source_embedded_indirect_emissions || "";
    updatedValues[`justification_for_use_default_values_${index}`] =
      data.justification_for_use_default_values || "";

    // Set local state
    setFieldValues(updatedValues);

    // Update parent component
    Object.entries(updatedValues).forEach(([key, value]) => {
      onChange(key, value);
    });
  };

  // Map API data to PrecursorSubmitData - fixed to match database structure
  const mapApiDataToPrecursorData = (
    data: PrecursorApiData
  ): PrecursorSubmitData => {
    return {
      id: data.id,
      report_id: formValues.report_id || reportId,
      precursors:
        data.precursors ||
        (fieldValues[`purchased_precursors_${index}`] as string) ||
        null,
      name: data.name || "",
      route_1: data.route_1 || "",
      route_1_amounts: data.route_1_amounts || 0,
      route_2: data.route_2 || "",
      route_2_amounts: data.route_2_amounts || 0,
      route_3: data.route_3 || "",
      route_3_amounts: data.route_3_amounts || 0,
      route_4: data.route_4 || "",
      route_4_amounts: data.route_4_amounts || 0,
      route_5: data.route_5 || "",
      route_5_amounts: data.route_5_amounts || 0,
      country_code: data.country_code || "",
      embedded_direct_emissions_value:
        data.embedded_direct_emissions_value || 0,
      source_embedded_direct_emissions:
        data.source_embedded_direct_emissions || "",
      embedded_indirection_emissions_value:
        data.embedded_indirection_emissions_value || 0,
      source_embedded_indirect_emissions:
        data.source_embedded_indirect_emissions || "",
      justification_for_use_default_values:
        data.justification_for_use_default_values || "",
      total_consumed_within_installation:
        data.total_consumed_within_installation || 0,
      consumed_in_production_amounts: data.consumed_in_production_amounts || 0,
      consumed_non_cbam_goods_amounts:
        data.consumed_non_cbam_goods_amounts || 0,
      total_consumed_within_installation_amounts:
        data.total_consumed_within_installation_amounts || 0,
      // For backward compatibility
      route: data.route_1 || "",
      amount: data.route_1_amounts || 0,
    };
  };

  // Initialize local state from props and fetch data if needed
  useEffect(() => {
    const initialValues: { [key: string]: string | number } = {};

    // Map all relevant field values from props
    Object.keys(formValues).forEach((key) => {
      if (key.endsWith(`_${index}`) || key.includes(`_${index}_`)) {
        initialValues[key] = formValues[key] ?? "";
      }
    });

    // Add specific fields we know we need
    initialValues[`purchased_precursors_${index}`] = precursorValue || "";
    initialValues[`route_${index}`] = routeValue || "";
    initialValues[`amount_${index}`] = formValues[`amount_${index}`] || 0;

    // Add country code with Thailand default if needed
    if (!initialValues[`country_code_${index}`] && countries.length > 0) {
      const thailandOption = countries.find(
        (country) =>
          country.label === "Thailand" || country.abbreviation === "TH"
      );
      if (thailandOption && thailandOption.abbreviation !== undefined) {
        initialValues[`country_code_${index}`] = thailandOption.abbreviation;
      }
    }

    setFieldValues(initialValues);

    // Fetch data from API if we have a report ID
    if (reportId) {
      fetchExistingData();
    }
  }, [reportId, index, precursorValue, routeValue]); // Dependencies for initial data loading

  // Load route options based on industryTypeId and goodsId
  useEffect(() => {
    const loadRouteOptions = async () => {
      if (industryTypeId && goodsId) {
        setIsLoadingRoutes(true);
        try {
          const data = await fetchGoodsData();
          const routesOptions = getRoutesOptions(data, industryTypeId, goodsId);
          setRouteOptions(routesOptions);
        } catch (error) {
          console.error("Error loading route options:", error);
          setRouteOptions([]);
        } finally {
          setIsLoadingRoutes(false);
        }
      }
    };
    loadRouteOptions();
  }, [industryTypeId, goodsId]);

  // Handle input value changes - update both local state and parent
  const handleInputChange = (
    name: string,
    value: string | number | (string | number)[]
  ) => {
    // Update local state
    setFieldValues((prev) => ({
      ...prev,
      [name]: Array.isArray(value) ? value.join(",") : value,
    }));

    // Clear any error for this field
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Update parent state
    onChange(name, value);
  };

  // Validate form before save
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    // Required fields
    if (!fieldValues[`purchased_precursors_${index}`]) {
      errors[`purchased_precursors_${index}`] = "กรุณากรอกข้อมูล";
    }

    if (!fieldValues[`country_code_${index}`]) {
      errors[`country_code_${index}`] = "กรุณาเลือกประเทศ";
    }

    const amountValue = fieldValues[`amount_${index}`];
    if (!amountValue && amountValue !== 0) {
      errors[`amount_${index}`] = "กรุณาระบุจำนวน";
    } else {
      const numValue = parseFloat(String(amountValue));
      if (isNaN(numValue) || numValue < 0) {
        errors[`amount_${index}`] = "กรุณาระบุจำนวนที่ถูกต้อง";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Format data for API submission - fixed to match database structure
  // Format data for API submission
  const prepareDataForApi = (): Record<string, any> => {
    const payload: Record<string, any> = {
      precursors: fieldValues[`purchased_precursors_${index}`] || null,
      name: "", // Default to an empty string
      route_1: fieldValues[`purchased_precursors_${index}`] || "",
      route_1_amounts: parseFloat(
        fieldValues[`amount_${index}`]?.toString() || "0"
      ),
      country_code: fieldValues[`country_code_${index}`] || "",
      embedded_direct_emissions_value: parseFloat(
        fieldValues[`embedded_direct_emissions_value_${index}`]?.toString() ||
          "0"
      ),
      source_embedded_direct_emissions:
        fieldValues[`source_embedded_direct_emissions_${index}`] || "",
      embedded_indirection_emissions_value: parseFloat(
        fieldValues[
          `embedded_indirection_emissions_value_${index}`
        ]?.toString() || "0"
      ),
      source_embedded_indirect_emissions:
        fieldValues[`source_embedded_indirect_emissions_${index}`] || "",
      justification_for_use_default_values:
        fieldValues[`justification_for_use_default_values_${index}`] || "",
      // Empty values for other routes
      route_2: "",
      route_2_amounts: 0,
      route_3: "",
      route_3_amounts: 0,
      route_4: "",
      route_4_amounts: 0,
      route_5: "",
      route_5_amounts: 0,
      total_consumed_within_installation: 0,
      consumed_in_production_amounts: 0,
      consumed_non_cbam_goods_amounts: 0,
      total_consumed_within_installation_amounts: 0,
    };

    // Only include report_id if it's necessary for your use case
    if (reportId) {
      // Replace isRequiredByApi with logic if there are specific rules about when to include it
      payload.report_id = reportId;
    }

    return payload;
  };

  const handleSave = async () => {
    // Validate form
    if (!validateForm()) {
      console.error("Validation failed");
      return;
    }

    // เก็บข้อมูลปัจจุบันไว้ก่อนการบันทึก
    const currentFieldValues = { ...fieldValues };

    setIsSaving(true);
    try {
      // Prepare data for API
      const payload = prepareDataForApi();
      // Log what we're about to send
      console.log("📤 Sending data to API:", payload);
      // Determine if we're updating or creating a new entry
      const method = existingData ? "PUT" : "POST";
      const url = existingData
        ? `${apiUrl}/api/cbam/e_precursors/${existingData.id}`
        : `${apiUrl}/api/cbam/e_precursors`;
      console.log(`🔄 ${method} request to: ${url}`);
      // Make the API request
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      // Parse response
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      // Get the response data
      const responseData = await response.json();
      console.log("✅ API Response:", responseData);
      // Update local state with the returned data
      if (responseData) {
        setExistingData(responseData);
        setPreviousData(responseData); // เก็บข้อมูลล่าสุดเป็น previousData
        updateFieldsFromApiData(responseData);
      }
      // If your onSave callback is necessary to inform the parent about saved data, call it
      if (onSave) {
        await onSave(responseData);
      }
      alert(`Precursor ${existingData ? "updated" : "created"} successfully!`);
    } catch (error) {
      console.error("❌ Error saving precursor:", error);
      alert(
        `Failed to save precursor: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );

      // กู้คืนข้อมูลเดิมหากการบันทึกล้มเหลว
      if (previousData) {
        // กู้คืนข้อมูลจาก previousData
        setExistingData(previousData);
        updateFieldsFromApiData(previousData);
      } else {
        // กู้คืนค่าฟอร์มเดิม
        setFieldValues(currentFieldValues);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete button click - DELETE from API
  const handleDelete = async () => {
    const idToDelete = precursorId || existingData?.id;

    if (!idToDelete) {
      console.error("No precursor ID provided for deletion");
      return;
    }

    // Confirm deletion
    if (!window.confirm("Are you sure you want to delete this precursor?")) {
      return;
    }

    setIsDeleting(true);

    try {
      console.log(`🗑️ Deleting precursor with ID: ${idToDelete}`);

      const url = `${apiUrl}/api/cbam/e_precursors/${idToDelete}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      console.log("✅ Precursor deleted successfully");

      // Clear existing data
      setExistingData(null);

      // Call parent onDelete if provided
      if (onDelete) {
        await onDelete();
      }

      // Show success message
      alert("Precursor deleted successfully!");
    } catch (error) {
      console.error("❌ Error deleting precursor:", error);
      alert(
        `Failed to delete precursor: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Refresh data from API
  const handleRefreshData = () => {
    fetchExistingData();
  };

  return (
    <div
      className="precursor-field-group"
      style={{
        marginBottom: "20px",
        padding: "15px",
        border: "1px solid #e0e0e0",
        borderColor: isSaved || existingData ? "#2ecc71" : "#e0e0e0",
        borderRadius: "4px",
        position: "relative",
      }}
    >
      {/* Loading indicator */}
      {isLoadingData && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255,255,255,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          <CircularProgress size={40} />
        </div>
      )}

      {/* Status indicators */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <div>
          <h4 style={{ margin: 0 }}>
            Precursor {index}
            {existingData?.id && ` (ID: ${existingData.id})`}
          </h4>

          {/* Data source info */}
          {existingData && (
            <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
              Data loaded from report #{reportId}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          {/* Refresh button */}
          {reportId && (
            <button
              type="button"
              onClick={handleRefreshData}
              style={{
                marginRight: "8px",
                background: "none",
                border: "1px solid #ccc",
                borderRadius: "4px",
                padding: "2px 8px",
                fontSize: "12px",
                cursor: "pointer",
              }}
              disabled={isLoadingData}
            >
              Refresh
            </button>
          )}

          {(isSaved || existingData) && (
            <div
              style={{
                backgroundColor: "#2ecc71",
                color: "white",
                padding: "5px 10px",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              {existingData ? "Loaded" : "Saved"}
            </div>
          )}

          {/* Delete button for saved/existing precursors */}
          {(isSaved || existingData?.id) && (
            <IconButton
              size="small"
              color="error"
              onClick={handleDelete}
              disabled={isDeleting}
              style={{ marginLeft: "10px" }}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </div>
      </div>

      {/* Form fields */}
      <LabeledTextField
        caption="Purchased precursor"
        defination="รายการวัตถุดิบ"
        label=""
        name={`purchased_precursors_${index}`}
        value={fieldValues[`purchased_precursors_${index}`] || ""}
        onChange={(e) => handleInputChange(e.target.name, e.target.value)}
        error={
          fieldErrors[`purchased_precursors_${index}`] ||
          formErrors[`purchased_precursors_${index}`]
        }
        readOnly
      />

      <LabeledAutocompleteMap
        caption="Country code"
        defination="เลือกรหัสประเทศที่นำเข้าวัตถุดิบ"
        label=""
        name={`country_code_${index}`}
        options={countries
          .filter((c) => c.abbreviation !== undefined)
          .map((c) => ({ label: c.label, value: c.abbreviation as string }))}
        value={fieldValues[`country_code_${index}`] || ""}
        onChange={(val) => handleInputChange(`country_code_${index}`, val)}
        error={
          fieldErrors[`country_code_${index}`] ||
          formErrors[`country_code_${index}`]
        }
      />

      {/* Dynamic Routes Section */}
      <Box mb={3}>
        {Array.from({ length: routeCount }).map((_, routeIndex) => (
          <Box key={routeIndex} display="flex" gap={3} mb={3}>
            <Box flex={1}>
              <LabeledAutocomplete
                caption={`Production Route ${routeIndex + 1}`}
                defination="เลือกเทคโนโลยีการผลิตที่ใช้วัตถุดิบนี้"
                label=""
                name={`route_${routeIndex}_${index}`}
                error={
                  fieldErrors[`route_${routeIndex}_${index}`] ||
                  formErrors[`route_${routeIndex}_${index}`]
                }
                options={routeOptions.map((option) => option.label)}
                value={String(
                  fieldValues[`route_${routeIndex}_${index}`] || ""
                )}
                onChange={(val) =>
                  handleInputChange(`route_${routeIndex}_${index}`, val)
                }
                disabled={isLoadingRoutes || routeOptions.length === 0}
                helperText={
                  isLoadingRoutes
                    ? "Loading routes..."
                    : routeOptions.length === 0
                    ? "No routes available"
                    : ""
                }
              />
            </Box>
            <Box flex={1}>
              <LabeledTextField
                caption={`Amount for Route ${routeIndex + 1}`}
                defination="จำนวน"
                label=""
                type="number"
                name={`amount_${routeIndex}_${index}`}
                value={fieldValues[`amount_${routeIndex}_${index}`] || ""}
                onChange={(e) =>
                  handleInputChange(e.target.name, e.target.value)
                }
                error={
                  fieldErrors[`amount_${routeIndex}_${index}`] ||
                  formErrors[`amount_${routeIndex}_${index}`]
                }
              />
            </Box>
          </Box>
        ))}

        {/* Route Buttons Container */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "10px",
          }}
        >
          <div>
            {routeCount < 6 && (
              <button
                type="button"
                style={{
                  backgroundColor: "#A5E8B1",
                  color: "#fff",
                  padding: "8px 12px",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
                onClick={() => setRouteCount((prev) => Math.min(prev + 1, 6))}
              >
                + เพิ่ม Route
              </button>
            )}
            {routeCount > 1 && (
              <button
                type="button"
                style={{
                  backgroundColor: "#E8BEA5",
                  color: "#fff",
                  padding: "8px 12px",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
                onClick={() => setRouteCount((prev) => prev - 1)}
              >
                - ลบ Route
              </button>
            )}
          </div>
        </div>
      </Box>

      <Box mb={3}>
        <div style={{ textAlign: "left", marginBottom: "1.5rem" }}>
          <strong>
            Specific embedded direct emissions (SEE (direct)) Unit: tCO2e/t
          </strong>
        </div>
        <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
          <div style={{ flex: 1 }}>
            <LabeledTextField
              type="number"
              caption=""
              defination="กรอกเป็นตัวเลขของค่า SEE direct ของวัตถุดิบตั้งต้น"
              label=""
              name={`embedded_direct_emissions_value_${index}`}
              value={
                fieldValues[`embedded_direct_emissions_value_${index}`] || ""
              }
              onChange={(e) => handleInputChange(e.target.name, e.target.value)}
              error={
                fieldErrors[`embedded_direct_emissions_value_${index}`] ||
                formErrors[`embedded_direct_emissions_value_${index}`]
              }
            />
          </div>
          <div style={{ flex: 1 }}>
            <LabeledAutocompleteMap
              caption=""
              defination="ระบุแหล่งที่มาของข้อมูล"
              label=""
              name={`source_embedded_direct_emissions_${index}`}
              options={[
                { label: "Source", value: "Source" },
                { label: "Measured", value: "Measured" },
                { label: "Default", value: "Default" },
                { label: "Unknown", value: "Unknown" },
              ]}
              value={
                fieldValues[`source_embedded_direct_emissions_${index}`] || ""
              }
              error={
                fieldErrors[`source_embedded_direct_emissions_${index}`] ||
                formErrors[`source_embedded_direct_emissions_${index}`]
              }
              onChange={(val) =>
                handleInputChange(
                  `source_embedded_direct_emissions_${index}`,
                  val
                )
              }
            />
          </div>
        </div>
      </Box>

      <Box mb={3}>
        <div style={{ textAlign: "left", marginBottom: "1.5rem" }}>
          <strong>
            Specific electricity consumption (for SEE (indirect)) Unit: MWh/t
          </strong>
        </div>
        <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
          <div style={{ flex: 1 }}>
            <LabeledTextField
              type="number"
              caption=""
              defination="กรอกเป็นค่าตัวเลขของ SEE indirect ของวัตถุดิบตั้งต้น"
              label=""
              name={`embedded_indirection_emissions_value_${index}`}
              value={
                fieldValues[`embedded_indirection_emissions_value_${index}`] ||
                ""
              }
              onChange={(e) => handleInputChange(e.target.name, e.target.value)}
              error={
                fieldErrors[`embedded_indirection_emissions_value_${index}`] ||
                formErrors[`embedded_indirection_emissions_value_${index}`]
              }
            />
          </div>
          <div style={{ flex: 1 }}>
            <LabeledAutocompleteMap
              caption=""
              defination="ระบุแหล่งที่มาของข้อมูล"
              label=""
              name={`source_embedded_indirect_emissions_${index}`}
              options={[
                { label: "Source", value: "Source" },
                { label: "Measured", value: "Measured" },
                { label: "Default", value: "Default" },
                { label: "Unknown", value: "Unknown" },
              ]}
              value={
                fieldValues[`source_embedded_indirect_emissions_${index}`] || ""
              }
              error={
                fieldErrors[`source_embedded_indirect_emissions_${index}`] ||
                formErrors[`source_embedded_indirect_emissions_${index}`]
              }
              onChange={(val) =>
                handleInputChange(
                  `source_embedded_indirect_emissions_${index}`,
                  val
                )
              }
            />
          </div>
        </div>
      </Box>

      <Box mb={3}>
        <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
          <div style={{ flex: 1 }}>
            <LabeledAutocomplete
              caption="Justification for use of default values (if relevant)"
              defination="กรอกเหตุผลในการใช้ค่ากลาง (ถ้าเกี่ยวข้อง)"
              label=""
              name={`justification_for_use_default_values_${index}`}
              options={justification.map((j) => j.name)}
              value={String(
                fieldValues[`justification_for_use_default_values_${index}`] ||
                  ""
              )}
              error={
                fieldErrors[`justification_for_use_default_values_${index}`] ||
                formErrors[`justification_for_use_default_values_${index}`]
              }
              onChange={(val) =>
                handleInputChange(
                  `justification_for_use_default_values_${index}`,
                  val
                )
              }
            />
          </div>
        </div>
      </Box>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px",
        }}
      >
        {previousData && (
          <button
            type="button"
            style={{
              backgroundColor: "#f0ad4e",
              color: "#fff",
              padding: "10px 20px",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
            }}
            onClick={() => {
              // กู้คืนข้อมูลจาก previousData
              if (previousData) {
                setExistingData(previousData);
                updateFieldsFromApiData(previousData);
              }
            }}
          >
            Restore Previous Data
          </button>
        )}

        <button
          type="button"
          style={{
            backgroundColor:
              isSaved || existingData?.id ? "#73797C" : "#91BACC",
            color: "#fff",
            padding: "10px 20px",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            fontSize: "14px",
          }}
          onClick={handleSave}
          disabled={isSaving || isLoadingData}
        >
          {isSaving
            ? "Saving..."
            : isSaved || existingData?.id
            ? `Update Precursor${
                existingData?.id ? ` #${existingData.id}` : ""
              }`
            : "Save Precursor"}
          {(isSaved || existingData?.id) && (
            <span style={{ marginLeft: "5px", fontSize: "16px" }}>✓</span>
          )}
        </button>
      </div>
     
      {/* API Response Display (only in development mode) */}
      {process.env.NODE_ENV === "development" && apiResponse && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            backgroundColor: "#f5f5f5",
            borderRadius: "4px",
            fontSize: "12px",
            overflow: "auto",
            maxHeight: "200px",
          }}
        >
          <details>
            <summary
              style={{
                cursor: "pointer",
                fontWeight: "bold",
                color: "#2c3e50",
              }}
            >
              API Response Details
            </summary>
            <pre style={{ margin: "10px 0 0" }}>
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default PrecursorFields;
