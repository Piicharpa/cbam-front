import React, { useState, useEffect } from "react";
import { Button, IconButton, Box, CircularProgress } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import LabeledTextField from "../../components/LabeledTextField";
import LabeledAutocomplete from "../../components/LabeledAutoComplete";
import LabeledAutocompleteMap from "../../components/LabeledAutoCompleteMap";
import { CountryOption } from "../../components/dropdown/contriesmap";
import {
  fetchGoodsData,
  getPrecursorsOptionsAsStrings,
  getRoutesOptions,
  OptionType,
} from "../../components/dropdown/goods";
import { justification } from "../../components/dropdown/justification";
import { data } from "react-router-dom";

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
  reportId?: number;
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
  [key: string]: any;
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
  const [precursorOptions, setPrecursorOptions] = useState<string[]>([]);
  const [loadingPrecursors, setLoadingPrecursors] = useState(false);
  const [noPrecursors, setNoPrecursors] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL || "http://178.128.123.212:5000";
  const reportIdRaw = localStorage.getItem("reportId");
  const reportId = reportIdRaw ? parseInt(reportIdRaw, 10) : undefined;

  const selectedIndustry = localStorage.getItem("selectedIndustry")
    ? parseInt(localStorage.getItem("selectedIndustry") as string, 10)
    : undefined;
  const selectedGoods = localStorage.getItem("selectedGoods")
    ? parseInt(localStorage.getItem("selectedGoods") as string, 10)
    : undefined;

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
      const precursorItem = (
        Array.isArray(data) ? data : data ? [data] : []
      )[0];
      if (precursorItem && precursorItem.id) {
        setExistingData(precursorItem);
        setPreviousData(precursorItem);
        updateFieldsFromApiData(precursorItem);
      } else {
        setExistingData(null);
      }
    } catch (error) {
      //
    } finally {
      setIsLoadingData(false);
    }
  };

  const updateFieldsFromApiData = (data: PrecursorApiData) => {
    const updatedValues: { [key: string]: string | number } = {
      ...fieldValues,
    };

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

    let maxFilledRoute = 1;
    for (let i = 0; i < 5; i++) {
      if (data[`route_${i + 1}`]) maxFilledRoute = i + 1;
    }
    setRouteCount(maxFilledRoute);
  };

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
      const precursorsList = getPrecursorsOptionsAsStrings(
        goodsList,
        industryTypeId,
        goodsId
      );

      if (precursorsList && precursorsList.length > 0) {
        setPrecursorOptions(precursorsList);
        setNoPrecursors(false);
      } else {
        setPrecursorOptions([]);
        setNoPrecursors(true);
      }
    } catch (error) {
      setPrecursorOptions([]);
      setNoPrecursors(true);
    } finally {
      setLoadingPrecursors(false);
    }
  };

  const renderPrecursorField = () => {
    if (loadingPrecursors) {
      return (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <CircularProgress size={24} />
          <span style={{ marginLeft: "10px", color: "#666" }}>
            Loading precursors...
          </span>
        </div>
      );
    }

    if (noPrecursors || precursorOptions.length === 0) {
      return (
        <div
          style={{
            padding: "15px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          <span style={{ color: "#856404", fontSize: "20px" }}>
            ℹ️ ไม่มี Precursor ที่เกี่ยวข้องสำหรับสินค้านี้
          </span>
        </div>
      );
    }

    // Get the specific precursor for this index
    const currentPrecursor = precursorOptions[index - 1] || null;

    if (!currentPrecursor) {
      return (
        <div
          style={{
            padding: "15px",
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          <span style={{ color: "#6c757d", fontSize: "20px" }}>
            ℹ️ No precursor available for position {index}
          </span>
        </div>
      );
    }

    // Show the specific precursor for this loop/index (read-only)
    return (
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            marginBottom: "15px",
            fontSize: "24px",
            fontWeight: "600",
            color: "#000000",
          }}
        >
          {currentPrecursor}
        </div>

        {/* <div
        style={{
          marginBottom: "15px",
          padding: "12px",
          border: "2px solid #0290c4",
          borderRadius: "6px",
          backgroundColor: "#e3f2fd"
        }}
      > */}
        {/* <div style={{ 
          fontSize: "16px", 
          fontWeight: "500",
          color: "#0d47a1",
          marginBottom: "8px"
        }}>
          {currentPrecursor}
        </div>
         */}
        {/* Amount field for this specific precursor
        <LabeledTextField
          caption={`Amount for ${currentPrecursor}`}
          defination={`ระบุจำนวนของ ${currentPrecursor}`}
          label=""
          type="number"
          name={`precursor_amount_${index}`}
          value={fieldValues[`precursor_amount_${index}`] || ""}
          onChange={(e) =>
            handleInputChange(e.target.name, e.target.value)
          }
          error={
            fieldErrors[`precursor_amount_${index}`] ||
            formErrors[`precursor_amount_${index}`]
          }
        /> */}

        {/* Store the precursor name in hidden field */}
        {/* <input 
          type="hidden" 
          name={`purchased_precursors_${index}`}
          value={currentPrecursor}
        />
      </div> */}
      </div>
    );
  };

  useEffect(() => {
    const savedGoods = existingData?.goods_id;
    const savedIndustry = existingData?.industry_type_id;
    if (
      existingData &&
      (savedGoods !== selectedGoods || savedIndustry !== selectedIndustry)
    ) {
      setFieldValues((prev) => ({
        ...prev,
        [`purchased_precursors_${index}`]: "",
      }));
      onChange(`purchased_precursors_${index}`, "");
      setExistingData(null);
    }
    searchRelevantPrecursors(selectedIndustry, selectedGoods);
  }, [selectedGoods, selectedIndustry]);

  useEffect(() => {
    const loadRouteOptions = async () => {
      if (selectedIndustry && selectedGoods) {
        setIsLoadingRoutes(true);
        try {
          const data = await fetchGoodsData();
          const routesOptions = getRoutesOptions(
            data,
            selectedIndustry,
            selectedGoods
          );
          setRouteOptions(routesOptions);
        } catch (error) {
          setRouteOptions([]);
        } finally {
          setIsLoadingRoutes(false);
        }
      }
    };
    loadRouteOptions();
  }, [selectedIndustry, selectedGoods]);

  useEffect(() => {
    const initialValues: { [key: string]: string | number } = {};

    Object.keys(formValues).forEach((key) => {
      if (key.endsWith(`_${index}`) || key.includes(`_${index}_`)) {
        initialValues[key] = formValues[key] ?? "";
      }
    });

    initialValues[`purchased_precursors_${index}`] = precursorValue || "";
    initialValues[`route_${index}`] = routeValue || "";
    initialValues[`amount_${index}`] = formValues[`amount_${index}`] || 0;

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

    if (reportId) {
      fetchExistingData();
    }
  }, [reportId, index]);

  const handleInputChange = (
    name: string,
    value: string | number | (string | number)[]
  ) => {
    setFieldValues((prev) => ({
      ...prev,
      [name]: Array.isArray(value) ? value.join(",") : value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    onChange(name, value);
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

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

  const handleSaveWithAlert = async () => {
    const confirmed = window.confirm(
      `💾 Save Precursor ${index}\n\n` +
        `Are you sure you want to save this precursor data?\n\n` +
        `Precursor: ${
          fieldValues[`purchased_precursors_${index}`] || "Not specified"
        }\n` +
        `Country: ${
          fieldValues[`country_code_${index}`] || "Not specified"
        }\n\n` +
        `Click OK to proceed or Cancel to go back.`
    );

    if (!confirmed) {
      alert("❌ Save operation cancelled by user.");
      return;
    }

    setIsSaving(true);
    const startTime = Date.now();

    try {
      const payload = prepareDataForApi();
      const isUpdate = existingData && existingData.id;
      const method = isUpdate ? "PUT" : "POST";
      const url = isUpdate
        ? `${apiUrl}/api/cbam/e_precursors/${existingData.id}`
        : `${apiUrl}/api/cbam/e_precursors`;

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

      if (onSave) await onSave(responseData);

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      const successMessage = isUpdate
        ? `✅ Precursor Updated Successfully!\n\n` +
          `📊 Updated Details:\n` +
          `• Precursor ID: ${responseData.id}\n` +
          `• Name: ${
            responseData.precursors || responseData.route_1 || "N/A"
          }\n` +
          `• Total Routes: ${routeCount}\n` +
          `• Country: ${responseData.country_code || "N/A"}\n\n` +
          `⏱️ Updated in ${duration} seconds\n` +
          `🎉 Data has been updated in the database.`
        : `✅ New Precursor Created Successfully!\n\n` +
          `📊 Created Details:\n` +
          `• New Precursor ID: ${responseData.id}\n` +
          `• Name: ${
            responseData.precursors || responseData.route_1 || "N/A"
          }\n` +
          `• Total Routes: ${routeCount}\n` +
          `• Country: ${responseData.country_code || "N/A"}\n\n` +
          `⏱️ Created in ${duration} seconds\n` +
          `🎉 Data has been saved to the database.`;

      alert(successMessage);

      if (onNextStep) {
        const shouldContinue = window.confirm(
          "🚀 Would you like to continue to the next step?"
        );
        if (shouldContinue) {
          onNextStep();
        }
      }
    } catch (error) {
      const errorMessage =
        `❌ Failed to Save Precursor ${index}!\n\n` +
        `Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }\n\n` +
        `🔧 Troubleshooting Steps:\n` +
        `• Check your internet connection\n` +
        `• Verify all required fields are completed\n` +
        `• Contact support if the problem persists\n\n` +
        `📋 Technical Details:\n` +
        `• Method: ${existingData?.id ? "PUT (Update)" : "POST (Create)"}\n` +
        `• Report ID: ${reportId || "N/A"}\n` +
        `• Precursor Index: ${index}`;
      alert(errorMessage);
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

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        {/* <div>
          <h4 style={{ margin: 0, fontSize: "18px" }}>
            Precursor {index}
            {existingData?.id && ` (ID: ${existingData.id})`}
          </h4>
          {existingData && (
            <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
              Data loaded from report #{reportId}
            </div>
          )}
                  </div> */}
      </div>

      {renderPrecursorField()}

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

      <Box mb={3}>
        {Array.from({ length: routeCount }).map((_, routeIndex) => (
          <Box
            key={`route-group-${index}-${routeIndex}`}
            display="flex"
            gap={3}
            mb={3}
          >
            <Box flex={1}>
              <LabeledAutocomplete
                caption={`Production Route ${routeIndex + 1}`}
                defination="เลือกเทคโนโลยีการผลิตที่ใช้วัตถุดิบ"
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
                caption={`Amount`}
                defination="ระบุปริมาณวัตถุดิบ"
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

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "10px",
          }}
        >
          <div>
            {routeCount < 5 && (
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
                  fontSize: "14px",
                }}
                onClick={() => setRouteCount((prev) => Math.min(prev + 1, 5))}
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
                  fontSize: "14px",
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
        <div
          style={{
            textAlign: "left",
            marginBottom: "1.5rem",
            fontSize: "18px",
          }}
        >
          <strong> Specific embedded direct emissions (SEE (direct))</strong>
          <p style={{ marginTop: "0.25rem", color: "#666", fontSize: "14px" }}>
            ค่าการปล่อยก๊าซเรือนกระจกทางตรงที่แฝงอยู่ในวัตถุดิบ
          </p>
        </div>
        <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
          <div style={{ flex: 1 }}>
            <LabeledTextField
              type="number"
              caption=""
              defination="ระบุเป็นตัวเลขของค่า SEE direct ของวัตถุดิบตั้งต้น"
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
        <div
          style={{
            textAlign: "left",
            marginBottom: "1.5rem",
            fontSize: "18px",
          }}
        >
          <strong>
            {" "}
            Specific electricity consumption (for SEE (indirect))
          </strong>
          <p style={{ marginTop: "0.25rem", color: "#666", fontSize: "14px" }}>
            ปริมาณการใช้ไฟฟ้าที่ใช้ในการผลิตวัตถุดิบ
          </p>
        </div>
        <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
          <div style={{ flex: 1 }}>
            <LabeledTextField
              type="number"
              caption=""
              defination="ระบุเป็นค่าตัวเลขของ SEE indirect ของวัตถุดิบตั้งต้น"
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
              defination="ระบุเหตุผลในการใช้ค่ากลาง (ถ้าเกี่ยวข้อง)"
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
              backgroundColor: isSaving || isLoadingData ? "#f5f5f5" : "#fff",
              color: isSaving || isLoadingData ? "#999" : "#0190c3",
              padding: "12px 24px",
              border: `2px solid ${
                isSaving || isLoadingData ? "#e0e0e0" : "#0190c3"
              }`,
              borderRadius: "10px",
              cursor: isSaving || isLoadingData ? "not-allowed" : "pointer",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              minWidth: "160px",
              height: "44px",
              transition: "all 0.2s ease",
              outline: "none",
            }}
            onClick={handleSaveWithAlert}
            disabled={isSaving || isLoadingData}
            onMouseOver={(e) => {
              if (!isSaving && !isLoadingData) {
                e.currentTarget.style.backgroundColor = "#0190c3";
                e.currentTarget.style.color = "#fff";
              }
            }}
            onMouseOut={(e) => {
              if (!isSaving && !isLoadingData) {
                e.currentTarget.style.backgroundColor = "#fff";
                e.currentTarget.style.color = "#0190c3";
              }
            }}
          >
            {isSaving ? "Saving..." : "Save Precursor"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrecursorFields;
