import React, { useState, useEffect, useRef } from "react";
import { Box } from "@mui/material";
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
import { electricitys } from "../../components/dropdown/electricitys";

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
  total_production_amounts?: number;
}

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
  total_production_amounts?: number;
}

//_________________________________________________________________________
const PrecursorFields1: React.FC<PrecursorFieldsProps> = ({
  index,
  formValues,
  formErrors,
  countries,
  onChange,
  precursorValue = "",
  routeValue = "",
  onSave,
  onDelete,
  onNextStep,
  isSaved = false,
}) => {
  const [routeOptions, setRouteOptions] = useState<OptionType[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState<boolean>(false);
  const [routeCount, setRouteCount] = useState<number>(1);
  const [routeCount1, setRouteCount1] = useState<number>(1);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [fieldValues, setFieldValues] = useState<{
    [key: string]: string | number;
  }>({});
  const [previousData, setPreviousData] = useState<PrecursorApiData | null>(
    null
  );
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [existingData, setExistingData] = useState<PrecursorApiData | null>(
    null
  );
  const [goodsOptions, setGoodsOptions] = useState<OptionType[]>([]);
  const [precursorOptions, setPrecursorOptions] = useState<string[]>([]);
  const [loadingPrecursors, setLoadingPrecursors] = useState(false);
  const [noPrecursors, setNoPrecursors] = useState(false);

  // State for calculated values
  const [totalPurchaseLevel, setTotalPurchaseLevel] = useState<number>(0);
  const [controlAmount, setControlAmount] = useState<number>(0);
  const [calculatedIndirectEmissions, setCalculatedIndirectEmissions] =
    useState<number>(0);

  // Ref to prevent infinite loop
  const isCalculating = useRef(false);

  const apiUrl = process.env.REACT_APP_API_URL || "http://178.128.123.212:5000";
  const reportIdRaw = localStorage.getItem("reportId");
  const reportId = reportIdRaw ? parseInt(reportIdRaw, 10) : undefined;
  const selectedIndustry = localStorage.getItem("selectedIndustry")
    ? parseInt(localStorage.getItem("selectedIndustry") as string, 10)
    : undefined;
  const selectedGoods = localStorage.getItem("selectedGoods")
    ? parseInt(localStorage.getItem("selectedGoods") as string, 10)
    : undefined;
  const [selectedGoodsName, setSelectedGoodsName] = useState<string>("");

  const ADDDELButton: React.FC<{
    routeCount: number;
    setRouteCount: React.Dispatch<React.SetStateAction<number>>;
    maxRoutes?: number;
  }> = ({ routeCount, setRouteCount, maxRoutes = 6 }) => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          width: "100%",
          marginBottom: "20px",
        }}
      >
        {routeCount < maxRoutes && (
          <button
            type="button"
            style={{
              backgroundColor: "#2ecc71",
              color: "#fff",
              padding: "10px 16px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              marginTop: "15px",
              marginRight: "10px",
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              boxShadow: "0 2px 5px rgba(46, 204, 113, 0.3)",
              transition: "all 0.2s ease",
            }}
            onClick={() =>
              setRouteCount((prev) => Math.min(prev + 1, maxRoutes))
            }
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#27ae60";
              e.currentTarget.style.boxShadow =
                "0 4px 8px rgba(46, 204, 113, 0.4)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#2ecc71";
              e.currentTarget.style.boxShadow =
                "0 2px 5px rgba(46, 204, 113, 0.3)";
            }}
          >
            <span style={{ marginRight: "6px", fontSize: "16px" }}>+</span>
            เพิ่ม Route
          </button>
        )}
        {routeCount > 1 && (
          <button
            type="button"
            style={{
              backgroundColor: "#e74c3c",
              color: "#fff",
              padding: "10px 16px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              marginTop: "15px",
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              boxShadow: "0 2px 5px rgba(231, 76, 60, 0.3)",
              transition: "all 0.2s ease",
            }}
            onClick={() => setRouteCount((prev) => prev - 1)}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#c0392b";
              e.currentTarget.style.boxShadow =
                "0 4px 8px rgba(231, 76, 60, 0.4)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#e74c3c";
              e.currentTarget.style.boxShadow =
                "0 2px 5px rgba(231, 76, 60, 0.3)";
            }}
          >
            <span style={{ marginRight: "6px", fontSize: "16px" }}>−</span>
            ลบ Route
          </button>
        )}
      </div>
    );
  };

  // Safe calculation function to prevent infinite loops
  const calculateDerivedValues = () => {
    if (isCalculating.current) return;

    isCalculating.current = true;

    try {
      // Calculate total purchase level - sum of all amounts in section (a)
      let totalAmount = 0;
      for (let i = 0; i < routeCount1; i++) {
        const amountKey = `amount_${i}_${index}`;
        const amountValue = fieldValues[amountKey];
        if (amountValue && !isNaN(parseFloat(String(amountValue)))) {
          totalAmount += parseFloat(String(amountValue));
        }
      }

      // Calculate amount(b) - consumption in production processes
      const amountB = parseFloat(String(fieldValues[`amount_1`] || 0));

      // Calculate amount(c) - consumed for other purposes
      const amountC = parseFloat(
        String(fieldValues[`total_production_amounts_1`] || 0)
      );

      // Calculate control: Total Purchase Level - (amount(b) + amount(c))
      const calculatedControl = totalAmount - (amountB + amountC);

      // Calculate SEE (indirect): specific electricity consumption * electricity emission factor
      const specificElectricityConsumption = parseFloat(
        String(
          fieldValues[`embedded_indirection_emissions_value_${index}`] || 0
        )
      );

      // Get the electricity emission factor
      const electricityEmissionFactor = parseFloat(
        String(fieldValues[`electricity_emission_factor_${index}`] || 0)
      );

      const calculatedSEEIndirect =
        specificElectricityConsumption * electricityEmissionFactor;

      // Update the state variables directly
      setTotalPurchaseLevel(totalAmount);
      setControlAmount(calculatedControl);
      setCalculatedIndirectEmissions(calculatedSEEIndirect);
    } finally {
      isCalculating.current = false;
    }
  };

  const getGoodsName = async () => {
    try {
      // Get IDs from localStorage
      const industryId = localStorage.getItem("selectedIndustry")
        ? parseInt(localStorage.getItem("selectedIndustry") as string, 10)
        : null;
      const goodsId = localStorage.getItem("selectedGoods")
        ? parseInt(localStorage.getItem("selectedGoods") as string, 10)
        : null;
      // If we don't have both IDs, we can't proceed
      if (!industryId || !goodsId) return;
      // Check if we already have the name in localStorage
      const storedName = localStorage.getItem("selectedGoodsName");
      if (storedName) {
        setSelectedGoodsName(storedName);
        return;
      }
      // Fetch goods data
      const data = await fetchGoodsData();
      // Find the industry group that matches our industry ID
      const industryGroup = data.find(
        (group) => group.industry_type_id === industryId
      );
      if (industryGroup) {
        // Find the specific goods in that industry
        const goods = industryGroup.goods.find((g) => g.goods_id === goodsId);
        if (goods) {
          // We found the goods, set and store the name
          setSelectedGoodsName(goods.name);
          localStorage.setItem("selectedGoodsName", goods.name);
        }
      }
    } catch (error) {
      console.error("Error fetching goods data:", error);
    }
  };

  // Call this function when the component mounts
  useEffect(() => {
    getGoodsName();
  }, []);

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
    updatedValues[`total_production_amounts_${index}`] =
      data.total_production_amounts || 0;

    // Also set fields for section b and c
    updatedValues[`amount_1`] = data.consumed_in_production_amounts || 0;
    updatedValues[`total_production_amounts_1`] =
      data.consumed_non_cbam_goods_amounts || 0;

    // Set the electricity emission factor field
    updatedValues[`electricity_emission_factor_${index}`] =
      data.electricity_emission_factor || 0;

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
  }, [selectedGoods, selectedIndustry, existingData, index, onChange]);

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
    initialValues[`total_production_amounts_${index}`] =
      formValues[`total_production_amounts_${index}`] || 0;
    // Initialize the electricity emission factor field if it doesn't exist
    initialValues[`electricity_emission_factor_${index}`] =
      formValues[`electricity_emission_factor_${index}`] || 0;

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
  }, [reportId, index, formValues, precursorValue, routeValue, countries]);

  const handleInputChange = (
    name: string,
    value: string | number | (string | number)[]
  ) => {
    const newValue = Array.isArray(value) ? value.join(",") : value;

    setFieldValues((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    onChange(name, value);
  };

  // Run calculations when relevant fields change
  useEffect(() => {
    // Using a setTimeout to ensure the calculation runs after the current render cycle
    const timer = setTimeout(() => {
      calculateDerivedValues();
    }, 0);

    return () => clearTimeout(timer);
  }, [
    routeCount1,
    fieldValues[`amount_0_${index}`],
    fieldValues[`amount_1_${index}`],
    fieldValues[`amount_2_${index}`],
    fieldValues[`amount_3_${index}`],
    fieldValues[`amount_4_${index}`],
    fieldValues[`amount_5_${index}`],
    fieldValues[`amount_1`],
    fieldValues[`total_production_amounts_1`],
    fieldValues[`embedded_indirection_emissions_value_${index}`],
    fieldValues[`electricity_emission_factor_${index}`],
  ]);

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
    // Validate total production amounts
    const totalValue = fieldValues[`total_production_amounts_${index}`];
    if (totalValue !== undefined && totalValue !== "") {
      const numValue = parseFloat(String(totalValue));
      if (isNaN(numValue) || numValue < 0) {
        errors[`total_production_amounts_${index}`] =
          "กรุณาระบุจำนวนที่ถูกต้อง";
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
      total_consumed_within_installation: totalPurchaseLevel || 0,
      consumed_in_production_amounts: parseFloat(
        fieldValues[`amount_1`]?.toString() || "0"
      ),
      consumed_non_cbam_goods_amounts: parseFloat(
        fieldValues[`total_production_amounts_1`]?.toString() || "0"
      ),
      total_consumed_within_installation_amounts: totalPurchaseLevel || 0,
      total_production_amounts: controlAmount || 0,
      electricity_emission_factor: parseFloat(
        fieldValues[`electricity_emission_factor_${index}`]?.toString() || "0"
      ),
      calculated_indirect_emissions: calculatedIndirectEmissions || 0,
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
    if (!validateForm()) {
      alert("Please fix the validation errors before saving.");
      return;
    }

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
      {/* Precursor name display */}
      {/* {renderPrecursorField()} */}
      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
        <div style={{ flex: 1 }}>
          {/* Country selection */}
          <LabeledAutocompleteMap
            caption="Country code"
            defination="เลือกรหัสประเทศที่นำเข้าวัตถุดิบ"
            label=""
            name={`country_code_${index}`}
            options={countries
              .filter((c) => c.abbreviation !== undefined)
              .map((c) => ({
                label: c.label,
                value: c.abbreviation as string,
              }))}
            value={fieldValues[`country_code_${index}`] || ""}
            onChange={(val) => handleInputChange(`country_code_${index}`, val)}
            error={
              fieldErrors[`country_code_${index}`] ||
              formErrors[`country_code_${index}`]
            }
          />
        </div>
        <div style={{ flex: 1 }}>
          <LabeledTextField
            caption="Name"
            defination="ระบุชื่อผลิตภัณฑ์"
            label=""
            name="name"
            type="text"
            value={formValues.name}
            onChange={(e) => onChange("name", e.target.value)}
            error={fieldErrors[`name`]}
            helperText={fieldErrors[`name`]}
            required
          />
        </div>
      </div>
      <div
        style={{
          textAlign: "left",
          marginBottom: "1.5rem",
          fontSize: "18px",
        }}
      >
        <strong>(a) Total purchased levels:</strong>
        <p
          style={{
            marginTop: "0.25rem",
            color: "#666",
            fontSize: "14px",
          }}
        >
          ปริมาณการสั่งซื้อทั้งหมด
        </p>
      </div>
      {/* Production routes */}
      <Box mb={3}>
        {Array.from({ length: routeCount1 }).map((_, routeIndex) => (
          <Box
            key={`route-group-${index}-${routeIndex}`}
            display="flex"
            gap={3}
            mb={3}
          >
            <Box flex={1}>
              <LabeledAutocomplete
                caption={`Production Process ${routeIndex + 1}`}
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
                unit="Tonne"
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
        <Box mb={3}>
          <ADDDELButton
            routeCount={routeCount1}
            setRouteCount={setRouteCount1}
          />
        </Box>
        <LabeledTextField
          caption="Total purchased levels"
          defination="ปริมาณการสั่งซื้อทั้งหมด"
          unit="Tonne"
          label=""
          type="number"
          name={`total_purchase_level_${index}`}
          value={totalPurchaseLevel}
          onChange={(e) => handleInputChange(e.target.name, e.target.value)}
          error={
            fieldErrors[`total_purchase_level_${index}`] ||
            formErrors[`total_purchase_level_${index}`]
          }
          disabled={true}
        />
      </Box>
      <div
        style={{
          textAlign: "left",
          marginBottom: "1.5rem",
          fontSize: "18px",
        }}
      >
        <strong>
          (b) Consumed in 'production processes' within the installation:
        </strong>
        <p style={{ marginTop: "0.25rem", color: "#666", fontSize: "14px" }}>
          ปริมาณการสั่งซื้อเพื่อใช้ในโรงงาน
        </p>
      </div>
      {/* Production routes */}
      <Box mb={3}>
        <Box key={`route-group-b`} display="flex" gap={3} mb={3}>
          <div style={{ flex: 1 }}>
            <LabeledAutocompleteMap
              caption="Aggregated goods category"
              defination="เลือกหมวดหมู่ของผลิตภัณฑ์"
              label={selectedGoodsName}
              name="goods_category"
              options={goodsOptions.map((opt) => ({
                ...opt,
                value: String(opt.value),
              }))}
              value={selectedGoodsName || ""}
              error={fieldErrors[`amount_1`]}
              onChange={(val) => onChange("goods_category", String(val))}
              required
              disabled={true}
            />
          </div>
          <div style={{ flex: 1 }}>
            <LabeledTextField
              caption={`Amount`}
              defination="ระบุปริมาณวัตถุดิบ"
              label=""
              type="number"
              unit="Tonne"
              name={`consumed_non_cbam_goods_amounts`}
              value={fieldValues[`consumed_non_cbam_goods_amounts`] || ""}
              onChange={(e) => handleInputChange(e.target.name, e.target.value)}
              error={
                fieldErrors[`consumed_non_cbam_goods_amounts`] ||
                formErrors[`consumed_non_cbam_goods_amounts`]
              }
            />
          </div>
        </Box>
        <Box key={`route-group-included`} display="flex" gap={3} mb={3}>
          <div style={{ flex: 1 }}>
            <LabeledAutocompleteMap
              caption="Included goods categories"
              defination="หมวดหมู่สินค้าที่ระบุ"
              label=""
              name={`b_category`}
              options={[
                {
                  label: "Only direct production",
                  value: "Only direct production",
                },
                { label: selectedGoodsName, value: selectedGoodsName },
                { label: "N.A.", value: "N.A." },
              ]}
              value={
                fieldValues[`b_category`] || ""
              }
              error={
                fieldErrors[`b_category`] ||
                formErrors[`b_category`]
              }
              onChange={(val) =>
                handleInputChange(
                  `b_category`,
                  val
                )
              }
            />
          </div>
          <div style={{ flex: 1 }}>
            <LabeledTextField
              caption="Name"
              defination="ระบุชื่อผลิตภัณฑ์"
              label=""
              name="b_name"
              type="text"
              value={formValues.b_name}
              onChange={(e) => onChange("b_name", e.target.value)}
              error={fieldErrors[`b_name`]}
              helperText={fieldErrors[`b_name`]}
              required
            />
          </div>
        </Box>
      </Box>
      <div
        style={{
          textAlign: "left",
          marginBottom: "1.5rem",
          fontSize: "18px",
        }}
      >
        <strong>
          (c) Consumed for other purposes, e.g. sold or used for non-CBAM goods
        </strong>
        <p style={{ marginTop: "0.25rem", color: "#666", fontSize: "14px" }}>
          ปริมาณการสั่งซื้อเพื่อวัตถุประสงค์อื่น เช่น ขาย
          หรือไปใช้ผลิตสินค้าที่ไม่อยู่ภายใต้ขอบเขตของ CBAM
        </p>
      </div>
      {/* Total Production Amounts */}
      <Box mb={3}>
        <LabeledTextField
          type="number"
          caption="Amount"
          defination="ระบุปริมาณวัตถุดิบ"
          unit="Tonne"
          label=""
          name={`consumed_non_cbam_goods_amounts`}
          value={fieldValues[`consumed_non_cbam_goods_amounts`] || ""}
          onChange={(e) => handleInputChange(e.target.name, e.target.value)}
          error={
            fieldErrors[`consumed_non_cbam_goods_amounts`] ||
            formErrors[`consumed_non_cbam_goods_amounts`]
          }
          helperText={
            fieldErrors[`consumed_non_cbam_goods_amounts`] ||
            formErrors[`consumed_non_cbam_goods_amounts`]
          }
          inputProps={{
            step: "any",
            placeholder: "",
            className: "appearance-none",
          }}
        />
      </Box>
      <div
        style={{
          textAlign: "left",
          marginBottom: "1.5rem",
          fontSize: "18px",
        }}
      >
        <strong>(d) Control</strong>
        <p style={{ marginTop: "0.25rem", color: "#666", fontSize: "14px" }}>
          ควบคุม
        </p>
      </div>
      <Box mb={3}>
        <LabeledTextField
          type="number"
          caption="Control"
          defination="ควบคุม"
          unit="Tonne"
          label=""
          name={`control`}
          value={controlAmount}
          onChange={(e) => handleInputChange(e.target.name, e.target.value)}
          error={fieldErrors[`control`] || formErrors[`control`]}
          helperText={fieldErrors[`control`] || formErrors[`control`]}
          inputProps={{
            step: "any",
            placeholder: "Enter amount",
            className: "appearance-none",
          }}
          disabled
        />
      </Box>
      <Box mb={3}>
        <strong
          style={{
            textAlign: "left",
            fontSize: "18px",
          }}
        >
          (e) Emission embedded in this purchased precursor
        </strong>
        <div
          style={{
            marginTop: "1.5rem",
            textAlign: "left",
            marginBottom: "1.5rem",
            fontSize: "18px",
          }}
        >
          <strong style={{ color: "#0290c4" }}>
            Specific embedded direct emissions (SEE (direct))
          </strong>
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
              unit="tCO2e/t"
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
      {/* Indirect Emissions Section */}
      <Box mb={3}>
        <div
          style={{
            textAlign: "left",
            marginBottom: "1.5rem",
            fontSize: "18px",
          }}
        >
          <strong style={{ color: "#0290c4" }}>
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
              defination="ระบุเป็นค่าตัวเลขของการใช้ไฟฟ้าในการผลิตวัตถุดิบ"
              unit="MWh/t"
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
        <div
          style={{
            textAlign: "left",
            marginBottom: "1.5rem",
            fontSize: "18px",
          }}
        >
          <strong style={{ color: "#0290c4" }}>
            Electricity emission factor (for SEE (indirect))
          </strong>
          <p style={{ marginTop: "0.25rem", color: "#666", fontSize: "14px" }}>
            ค่าการปล่อยก๊าซเรือนกระจกจากการผลิตไฟฟ้า
          </p>
        </div>
        <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
          <div style={{ flex: 1 }}>
            <LabeledTextField
              type="number"
              caption=""
              defination="ระบุเป็นค่าตัวเลขของค่าการปล่อย CO2 จากการผลิตไฟฟ้า"
              label=""
              name={`value_electricity_indirect_emission_factor`}
              value={fieldValues[`value_electricity_indirect_emission_factor`] || ""}
              onChange={(e) => handleInputChange(e.target.name, e.target.value)}
              error={
                fieldErrors[`value_electricity_indirect_emission_factor`] ||
                formErrors[`value_electricity_indirect_emission_factor`]
              }
              unit="tCO2e/MWh"
            />
          </div>
          <div style={{ flex: 1 }}>
            <LabeledAutocomplete
              caption=""
              defination="ระบุแหล่งที่มาของข้อมูล"
              label=""
              name={`source_electricity_indirect_emission_factor'`}
              options={electricitys.map((e) => e.name)}
              value={String(fieldValues[`source_electricity_indirect_emission_factor'`] || "")}
              error={
                fieldErrors[`source_electricity_indirect_emission_factor'`] ||
                formErrors[`source_electricity_indirect_emission_factor'`]
              }
              onChange={(val) =>
                handleInputChange(`source_electricity_indirect_emission_factor'`, val)
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
          <strong style={{ color: "#999" }}>
            Specific embedded indirect emissions (SEE (indirect))
          </strong>
          <p style={{ marginTop: "0.25rem", color: "#999", fontSize: "14px" }}>
            ปริมาณการปล่อยก๊าซเรือนกระจกทางอ้อมที่แฝงอยู่ในวัตถุดิบ
          </p>
        </div>
        <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
          <div style={{ flex: 1 }}>
            <LabeledTextField
              type="number"
              caption=""
              defination="ค่าการปล่อยก๊าซเรือนกระจกทางอ้อมที่แฝงอยู่ในวัตถุดิบ"
              label=""
              name={`calculated_indirect_emissions_${index}`}
              value={calculatedIndirectEmissions}
              onChange={(e) => handleInputChange(e.target.name, e.target.value)}
              error={
                fieldErrors[`calculated_indirect_emissions_${index}`] ||
                formErrors[`calculated_indirect_emissions_${index}`]
              }
              unit="tCO2e/t"
              disabled={true}
            />
          </div>
        </div>
      </Box>
      {/* Justification Section */}
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
      {/* Save Button Section */}
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
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default PrecursorFields1;
