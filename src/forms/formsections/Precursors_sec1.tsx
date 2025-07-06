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
import { data } from "react-router-dom";

// Updated PrecursorSubmitData interface that matches the database structure
export interface PrecursorSubmitData {
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
  onNextStep?: () => void;
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
  onNextStep?: () => void;
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
  onNextStep,
  isSaved = false,
  precursorId,
  // reportId,
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
  const reportIdRaw = localStorage.getItem("reportId");
  const reportId = reportIdRaw ? parseInt(reportIdRaw, 10) : undefined;
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
      // === Step 1: ตรวจว่ามี precursor data ไหม ===
      const precursorItem = (
        Array.isArray(data) ? data : data ? [data] : []
      )[0];
      if (precursorItem && precursorItem.id) {
        // === Step 2: ถ้ามีก้อนข้อมูล ให้ setFieldValues ใช้ค่าจาก backend ===
        setExistingData(precursorItem);
        setPreviousData(precursorItem);
        updateFieldsFromApiData(precursorItem);
      } else {
        // === Step 2: ถ้าไม่มีอะไร ไม่ต้อง set ค่าช่องฟอร์ม (ใช้ default) ===
        setExistingData(null);
      }
    } catch (error) {
      console.error("❌ Error fetching precursor data for report:", error);
    } finally {
      setIsLoadingData(false);
    }
  };
  // Map API data to field values
  const updateFieldsFromApiData = (data: PrecursorApiData) => {
    const updatedValues: { [key: string]: string | number } = {
      ...fieldValues,
    };

    // Map dynamic route fields (route_1 ... route_5)
    for (let ridx = 0; ridx < 5; ridx++) {
      updatedValues[`route_${ridx}_${index}`] = data[`route_${ridx + 1}`] || "";
      updatedValues[`amount_${ridx}_${index}`] =
        data[`route_${ridx + 1}_amounts`] || 0;
    }

    updatedValues[`purchased_precursors_${index}`] =
      data.route_1 || data.precursors || precursorValue || "";
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

    setFieldValues(updatedValues);

    Object.entries(updatedValues).forEach(([key, value]) => {
      onChange(key, value);
    });

    // *** update routeCount ให้เท่าจำนวน route ที่มีค่าจริง ***
    let maxFilledRoute = 1;
    for (let i = 0; i < 5; i++) {
      if (data[`route_${i + 1}`]) maxFilledRoute = i + 1;
    }
    setRouteCount(maxFilledRoute);
  };

  console.log("localStorage : ", localStorage);
  // Map API data to PrecursorSubmitData - fixed to match database structure
  const mapApiDataToPrecursorData = (
    data: PrecursorApiData
  ): PrecursorSubmitData => {
    return {
      id: data.id,
      report_id: reportId || 0,
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
  const [precursorOptions, setPrecursorOptions] = useState<string[]>([]);
  const [loadingPrecursors, setLoadingPrecursors] = useState(false);
  const [noPrecursors, setNoPrecursors] = useState(false);

  const selectedIndustry = localStorage.getItem("selectedIndustry")
    ? parseInt(localStorage.getItem("selectedIndustry") as string, 10)
    : undefined;
  const selectedGoods = localStorage.getItem("selectedGoods")
    ? parseInt(localStorage.getItem("selectedGoods") as string, 10)
    : undefined;

  const precursorFieldValue =
    fieldValues[`purchased_precursors_${index}`] || "";

  const searchRelevantPrecursors = async (
    industryTypeId?: number,
    goodsId?: number
  ) => {
    if (!industryTypeId || !goodsId) {
      setPrecursorOptions([]);
      setNoPrecursors(false);
      return;
    }
    setLoadingPrecursors(true);
    setNoPrecursors(false);
    try {
      const goodsList = await fetchGoodsData();
      const industry = goodsList.find(
        (ind: any) => ind.industry_type_id === industryTypeId
      );
      if (!industry) {
        setPrecursorOptions([]);
        setNoPrecursors(true);
        return;
      }
      const goods = industry.goods.find((g: any) => g.goods_id === goodsId);
      if (!goods) {
        setPrecursorOptions([]);
        setNoPrecursors(true);
        return;
      }
      const relevant = goods.relevant_precursors || [];
      if (relevant.length > 0) {
        setPrecursorOptions(relevant);
        setNoPrecursors(false);
      } else {
        setPrecursorOptions([]);
        setNoPrecursors(true);
      }
    } finally {
      setLoadingPrecursors(false);
    }
  };

  useEffect(() => {
    // เช็ค EDIT CASE: ถ้า selectedGoods/selectedIndustry เปลี่ยนจากค่าที่ save ไว้ => clear precursor เดิม
    const savedGoods = existingData?.goods_id;
    const savedIndustry = existingData?.industry_type_id;

    if (
      existingData &&
      (savedGoods !== selectedGoods || savedIndustry !== selectedIndustry)
    ) {
      setFieldValues((prev) => ({
        ...prev,
        [`purchased_precursors_${index}`]: "",
        // clear ฟิลด์อื่นได้ถ้าต้องการ
      }));
      // อาจใส่ onChange ด้วย (สำหรับ parent)
      onChange(`purchased_precursors_${index}`, "");
      setExistingData(null);
    }

    searchRelevantPrecursors(selectedIndustry, selectedGoods);
    // eslint-disable-next-line
  }, [selectedGoods, selectedIndustry]);

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
  }, [goodsId]);

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
      name: "",
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
      total_consumed_within_installation: 0,
      consumed_in_production_amounts: 0,
      consumed_non_cbam_goods_amounts: 0,
      total_consumed_within_installation_amounts: 0,
    };

    for (let ridx = 0; ridx < 5; ridx++) {
      // <---- เปลี่ยน 6 เป็น 5
      payload[`route_${ridx + 1}`] =
        fieldValues[`route_${ridx}_${index}`] || "";
      payload[`route_${ridx + 1}_amounts`] = parseFloat(
        fieldValues[`amount_${ridx}_${index}`]?.toString() || "0"
      );
    }

    if (reportId) {
      payload.report_id = reportId;
    }
    return payload;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const payload = prepareDataForApi();
      let method = "POST";
      let url = `${apiUrl}/api/cbam/e_precursors`;
      // === Step 3: ถ้ามี existingData (id) => ใช้ PUT, ถ้าไม่มีก็ POST ===
      if (existingData && existingData.id) {
        method = "PUT";
        url = `${apiUrl}/api/cbam/e_precursors/${existingData.id}`;
      }
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      const responseData = await response.json();
      // ตั้งค่ารายละเอียดใหม่หลังบันทึกสำเร็จ
      setExistingData(responseData);
      setPreviousData(responseData);
      updateFieldsFromApiData(responseData);
      if (onSave) await onSave(responseData);
      alert(
        `Precursor ${method === "PUT" ? "updated" : "created"} successfully!`
      );
    } catch (error) {
      alert(
        `Failed to save precursor: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      if (onNextStep) onNextStep();
    } finally {
      setIsSaving(false);
    }
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
          {/* {reportId && (
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
          )} */}

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
          {/* {(isSaved || existingData?.id) && (
            <IconButton
              size="small"
              color="error"
              onClick={handleDelete}
              disabled={isDeleting}
              style={{ marginLeft: "10px" }}
            >
              <DeleteIcon />
            </IconButton>
          )} */}
        </div>
      </div>

      {/* Form fields */}
      {precursorOptions.length > 0 ? (
      precursorOptions.map((precursor, idx) => (
      <LabeledAutocomplete
        caption="Purchased precursor"
        defination="รายการวัตถุดิบ precursor"
        label=""
        name={`purchased_precursors_${index}`}
        options={precursorOptions}
        value={String(fieldValues[`purchased_precursors_${index}`] || "")}
        onChange={(val) =>
          handleInputChange(`purchased_precursors_${index}`, val)
        }
        error={
          fieldErrors[`purchased_precursors_${index}`] ||
          formErrors[`purchased_precursors_${index}`]
        }
        disabled={loadingPrecursors}
      />
       ))
    ) : (
      // {loadingPrecursors && <span>Loading...</span>}
      // {noPrecursors && (
        <span style={{ color: "#ff9800", fontSize: 13 }}>
          ไม่มี Precursor ที่เกี่ยวข้องสำหรับสินค้านี้
        </span>
      )}

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
        {/* {previousData && (
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
        )} */}

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
              backgroundColor: "#91BACC",
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
            {isSaving ? "Saving..." : "Save Precursor"}
          </button>
        </div>
      </div>

      {/* API Response Display (only in development mode) */}
      {/* {process.env.NODE_ENV === "development" && apiResponse && (
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
      )} */}
    </div>
  );
};

export default PrecursorFields;
