import React, { useState, useEffect } from "react";
import { Button, IconButton, Box } from "@mui/material";
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
import type { PrecursorSubmitData } from "../PrecursorsForm"; // Import the shared type

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
}) => {
  const [routeOptions, setRouteOptions] = useState<OptionType[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState<boolean>(false);
  const [routeCount, setRouteCount] = useState<number>(1);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [fieldValues, setFieldValues] = useState<{
    [key: string]: string | number;
  }>({});
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [apiResponse, setApiResponse] = useState<any>(null);
  
  const apiUrl = process.env.REACT_APP_API_URL || 'http://178.128.123.212:5000';

  // Initialize local state from props
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
  }, [index, formValues, precursorValue, routeValue, countries]);

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

  // Format data for API submission
  const prepareDataForApi = (): Record<string, any> => {
    const reportId = 54; // Replace with your actual report ID source
    
    return {
      report_id: reportId,
      route_1: fieldValues[`purchased_precursors_${index}`] || "",
      route_1_amounts: parseFloat(fieldValues[`amount_${index}`]?.toString() || "0"),
      country_code: fieldValues[`country_code_${index}`] || "",
      embedded_direct_emissions_value: parseFloat(
        fieldValues[`embedded_direct_emissions_value_${index}`]?.toString() || "0"
      ),
      source_embedded_direct_emissions: 
        fieldValues[`source_embedded_direct_emissions_${index}`] || "",
      embedded_indirection_emissions_value: parseFloat(
        fieldValues[`embedded_indirection_emissions_value_${index}`]?.toString() || "0"
      ),
      source_embedded_indirect_emissions: 
        fieldValues[`source_embedded_indirect_emissions_${index}`] || "",
      justification_for_use_default_values: 
        fieldValues[`justification_for_use_default_values_${index}`] || "",
      // Empty values for other routes
            // Empty values for other routes
      route_2: "",
      route_2_amounts: 0,
      route_3: "",
      route_3_amounts: 0,
      route_4: "",
      route_4_amounts: 0,
      route_5: "",
      route_5_amounts: 0,
    };
  };

  // Handle save button click - POST to API
  const handleSave = async () => {
    // Validate form
    if (!validateForm()) {
      console.error("Validation failed");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Prepare data for API
      const payload = prepareDataForApi();
      
      // Log what we're about to send
      console.log("📤 Sending data to API:", payload);
      
      // Determine if we're updating or creating
      const method = precursorId ? 'PUT' : 'POST';
      const url = precursorId 
        ? `${apiUrl}/api/cbam/e_precursors/${precursorId}`
        : `${apiUrl}/api/cbam/e_precursors`;
      
      console.log(`🔄 ${method} request to: ${url}`);
        
      // Make the API request
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      // Parse response
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      
      // Get response data
      const responseData = await response.json();
      console.log("✅ API Response:", responseData);
      
      // Store response for debugging
      setApiResponse(responseData);
      
      // Call onSave if provided
      if (onSave) {
        // Construct the precursor data from form values
        const precursorData: PrecursorSubmitData = {
          id: precursorId, // Include ID if it exists (for updates)
          route: fieldValues[`purchased_precursors_${index}`] as string,
          amount: parseFloat(fieldValues[`amount_${index}`]?.toString() || "0"),
          country_code: fieldValues[`country_code_${index}`] as string,
          embedded_direct_emissions_value: parseFloat(
            fieldValues[`embedded_direct_emissions_value_${index}`]?.toString() ||
            "0"
          ),
          source_embedded_direct_emissions: fieldValues[
            `source_embedded_direct_emissions_${index}`
          ] as string,
          embedded_indirect_emissions_value: parseFloat(
            fieldValues[
              `embedded_indirection_emissions_value_${index}`
            ]?.toString() || "0"
          ),
          source_embedded_indirect_emissions: fieldValues[
            `source_embedded_indirect_emissions_${index}`
          ] as string,
          justification_for_use_default_values: fieldValues[
            `justification_for_use_default_values_${index}`
          ] as string,
        };
        
        // Call the parent onSave function
        await onSave(precursorData);
      }
      
      // Show success message
      alert(`Precursor ${precursorId ? 'updated' : 'created'} successfully!`);
      
    } catch (error) {
      console.error("❌ Error saving precursor:", error);
      alert(`Failed to save precursor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete button click - DELETE from API
  const handleDelete = async () => {
    if (!precursorId) {
      console.error("No precursor ID provided for deletion");
      return;
    }
    
    // Confirm deletion
    if (!window.confirm("Are you sure you want to delete this precursor?")) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      console.log(`🗑️ Deleting precursor with ID: ${precursorId}`);
      
      const url = `${apiUrl}/api/cbam/e_precursors/${precursorId}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      
      console.log("✅ Precursor deleted successfully");
      
      // Call parent onDelete if provided
      if (onDelete) {
        await onDelete();
      }
      
      // Show success message
      alert("Precursor deleted successfully!");
      
    } catch (error) {
      console.error("❌ Error deleting precursor:", error);
      alert(`Failed to delete precursor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Debug function to log API response
  const logApiResponse = () => {
    console.log("🔍 Current API Response:", apiResponse);
  };

  return (
    <div
      className="precursor-field-group"
      style={{
        marginBottom: "20px",
        padding: "15px",
        border: "1px solid #e0e0e0",
        borderColor: isSaved ? "#2ecc71" : "#e0e0e0",
        borderRadius: "4px",
        position: "relative",
      }}
    >
      {/* Status indicators */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <h4 style={{ margin: 0 }}>Precursor {index}</h4>
        
        {isSaved && (
          <div
            style={{
              backgroundColor: "#2ecc71",
              color: "white",
              padding: "5px 10px",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            Saved
          </div>
        )}
        
        {/* Delete button for saved precursors */}
        {isSaved && precursorId && (
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
      
      {/* Debug button - only in development mode */}
      {process.env.NODE_ENV === 'development' && apiResponse && (
        <div style={{ marginBottom: '10px', textAlign: 'right' }}>
          <button 
            onClick={logApiResponse}
            style={{ 
              padding: '2px 5px', 
              fontSize: '11px', 
              background: '#f0f0f0', 
              border: '1px solid #ccc',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Log API Response
          </button>
        </div>
      )}

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
                fieldValues[`justification_for_use_default_values_${index}`] || ""
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
      
      {/* Save Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "20px",
        }}
      >
        <button
          type="button"
          style={{
            backgroundColor: isSaved ? "#73797C" : "#91BACC",
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
          disabled={isSaving}
        >
          {isSaving ? 
            "Saving..." : 
            isSaved ? 
              `Update Precursor${precursorId ? ` #${precursorId}` : ''}` : 
              "Save Precursor"}
          {isSaved && (
            <span style={{ marginLeft: "5px", fontSize: "16px" }}>✓</span>
          )}
        </button>
      </div>
      
      {/* API Response Display (only in development mode) */}
      {process.env.NODE_ENV === 'development' && apiResponse && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          fontSize: '12px',
          overflow: 'auto',
          maxHeight: '200px'
        }}>
          <details>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#2c3e50' }}>
              API Response Details
            </summary>
            <pre style={{ margin: '10px 0 0' }}>
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default PrecursorFields;