import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
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
  control: number;
  source_specific_indirect_electricity_consumption: string;
  value_specific_indirect_electricity_consumption: number;
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
  control: number;
  source_specific_indirect_electricity_consumption: string;
  value_specific_indirect_electricity_consumption: number;
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
  onNextStep,
  isSaved = false,

}) => {
  const [routeOptions, setRouteOptions] = useState<OptionType[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState<boolean>(false);
  const [routeCount, setRouteCount] = useState<number>(1);
  const [routeCount1, setRouteCount1] = useState<number>(1);
  const [routeCount2, setRouteCount2] = useState<number>(1);
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
  const [precursorOptions, setPrecursorOptions] = useState<string[]>([]);
  const [loadingPrecursors, setLoadingPrecursors] = useState(false);
  const [noPrecursors, setNoPrecursors] = useState(false);

  const [totalPurchaseLevel, setTotalPurchaseLevel] = useState<number>(0);
  const [controlAmount, setControlAmount] = useState<number>(0);
  const [calculatedIndirectEmissions, setCalculatedIndirectEmissions] =
    useState<number>(0);

  // Ref to prevent infinite loop
  const isCalculating = useRef(false);
 const user_account = localStorage.getItem("user_account");
const token = user_account ? JSON.parse(user_account).token : null;
 

  // Removed state for calculated values to calculate them right before saving
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

  const ensureNumber = (value: any): number => {
    // Handle empty string case
    if (value === "" || value === null || value === undefined) {
      return 0;
    }

    // Parse the value
    const num = parseFloat(String(value));

    // Handle NaN
    return isNaN(num) ? 0 : num;
  };

  const calculateDerivedValues = useCallback(() => {
    if (isCalculating.current) return;
    isCalculating.current = true;
    try {
      // Calculate total purchase level - sum of all amounts in section (a)
      let totalAmount = 0;
      for (let i = 0; i < routeCount1; i++) {
        const amountKey = `amount_${i}_${index}`;
        totalAmount += ensureNumber(fieldValues[amountKey]);
      }
      // Calculate amount(b) - consumption in production processes
      const amountB = ensureNumber(
        fieldValues[`consumed_in_production_amounts`]
      );
      // Calculate amount(c) - consumed for other purposes
      const amountC = ensureNumber(
        fieldValues[`consumed_non_cbam_goods_amounts`]
      );
      // Calculate control: Total Purchase Level - (amount(b) + amount(c))
      const calculatedControl = Math.max(totalAmount - (amountB + amountC));
      // Calculate SEE (indirect)
      const specificElectricityConsumption = ensureNumber(
        fieldValues[`value_specific_indirect_electricity_consumption`]
      );
      const electricityEmissionFactor = ensureNumber(
        fieldValues[`value_electricity_indirect_emission_factor`]
      );
      const calculatedSEEIndirect =
        specificElectricityConsumption * electricityEmissionFactor;

      // Update state only if values have changed
      if (totalAmount !== totalPurchaseLevel) {
        setTotalPurchaseLevel(totalAmount);
      }
      if (calculatedControl !== controlAmount) {
        setControlAmount(calculatedControl);
      }
      // if (calculatedSEEIndirect !== calculatedIndirectEmissions) {
      //   setCalculatedIndirectEmissions(calculatedSEEIndirect);
      // }
      setCalculatedIndirectEmissions(calculatedSEEIndirect);
    } finally {
      isCalculating.current = false;
    }
  }, [
    fieldValues,
    index,
    routeCount1,
    totalPurchaseLevel,
    controlAmount,
    calculatedIndirectEmissions,
  ]);

  // 2. Replace the existing useEffect with a more controlled one
  useEffect(() => {
    const timer = setTimeout(calculateDerivedValues, 100);
    return () => clearTimeout(timer);
  }, [calculateDerivedValues]);

  // 3. Add useMemo for computed values
  const relevantAmounts = useMemo(() => {
    const amounts: Record<string, string | number> = {};
    for (let i = 0; i < routeCount1; i++) {
      const key = `amount_${i}_${index}`;
      amounts[key] = fieldValues[key] || 0;
    }
    return amounts;
  }, [fieldValues, routeCount1, index]);

  // 4. Use useEffect with specific dependency instead of many field values
  useEffect(() => {
    calculateDerivedValues();
  }, [
    relevantAmounts,
    fieldValues[`consumed_in_production_amounts`],
    fieldValues[`consumed_non_cbam_goods_amounts`],
    fieldValues[`embedded_indirection_emissions_value_${index}`],
    fieldValues[`value_electricity_indirect_emission_factor`],
  ]);

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
      // If no specific ID or the specific fetch failed, get all precursors for this report
      const response = await fetch(
        `${apiUrl}/api/cbam/e_precursors/report/${reportId}`,{headers:{
          'Content-Type' :"application/json",
          Authorization:`Bearer ${token}`
        }}
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch data: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();


      // Handle both array and single object responses
      const precursorsArray = Array.isArray(data) ? data : data ? [data] : [];

      // Try to find the matching precursor based on index or name
      let matchingPrecursor = null;

      // First try to find by index if we have multiple items
      if (precursorsArray.length > index) {
        matchingPrecursor = precursorsArray[index];
      }
      // If not found by index, try to find by precursor value/name
      else if (precursorValue) {
        matchingPrecursor = precursorsArray.find(
          (p) =>
            p.precursors === precursorValue ||
            p.name === precursorValue ||
            p.route_1 === precursorValue
        );
      }
      // If still not found, just use the first item (if any)
      else if (precursorsArray.length > 0) {
        matchingPrecursor = precursorsArray[0];
      }

      // If we found a matching precursor, update the state with its data
      if (matchingPrecursor && matchingPrecursor.id) {
        setExistingData(matchingPrecursor);
        setPreviousData(matchingPrecursor);
        const updatedValues = updateFieldsFromApiData(matchingPrecursor);
        setFieldValues(updatedValues);

        // Update route count if needed
        let maxRouteIndex = 1;
        for (let i = 2; i <= 5; i++) {
          if (
            matchingPrecursor[`route_${i}`] &&
            matchingPrecursor[`route_${i}_amounts`] > 0
          ) {
            maxRouteIndex = i;
          }
        }
        setRouteCount1(maxRouteIndex);
      } else {
        setExistingData(null);
      }
    } catch (error) {
      console.error("Error fetching precursor data:", error);
      setExistingData(null);
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

    // Update basic information
    updatedValues[`name_${index}`] = data.name || "";
    updatedValues[`purchased_precursors_${index}`] =
      data.route_1 || data.precursors || precursorValue || "";
    updatedValues[`country_code_${index}`] = data.country_code || "";

    // Update direct emissions data
    updatedValues[`embedded_direct_emissions_value_${index}`] =
      data.embedded_direct_emissions_value || 0;
    updatedValues[`source_embedded_direct_emissions_${index}`] =
      data.source_embedded_direct_emissions || "";

    // Update indirect emissions data
    updatedValues[`embedded_indirection_emissions_value_${index}`] =
      data.embedded_indirection_emissions_value || 0;
    updatedValues[`source_embedded_indirect_emissions_${index}`] =
      data.source_embedded_indirect_emissions || "";

    // Update justification
    updatedValues[`justification_for_use_default_values_${index}`] =
      data.justification_for_use_default_values || "";

    // Update control value - ใช้ข้อมูลที่มีอยู่จริงใน API
    updatedValues[`control`] = data.control || 0;

    // Update consumption data
    updatedValues[`consumed_in_production_amounts`] =
      data.consumed_in_production_amounts || 0;
    updatedValues[`consumed_non_cbam_goods_amounts`] =
      data.consumed_non_cbam_goods_amounts || 0;

    // Update electricity emission factors - Use correct field names
    updatedValues[`value_electricity_indirect_emission_factor`] =
      data.value_electricity_indirect_emission_factor || 0;
    updatedValues[`source_electricity_indirect_emission_factor`] =
      data.source_electricity_indirect_emission_factor || "";
    // Fix: Add new fields to be updated from API
    updatedValues[`source_specific_indirect_electricity_consumption`] =
      data.source_specific_indirect_electricity_consumption || "";
    updatedValues[`value_specific_indirect_electricity_consumption`] =
      data.value_specific_indirect_electricity_consumption || 0;

    // Update b_name and b_category
    updatedValues[`b_name`] = data.b_name || "";
    updatedValues[`b_category`] = data.b_category || "";

    const totalPurchaseAmount =
      Number(updatedValues[`amount_0_${index}`]) +
      Number(updatedValues[`amount_1_${index}`]) +
      Number(updatedValues[`amount_2_${index}`]) +
      Number(updatedValues[`amount_3_${index}`]) +
      Number(updatedValues[`amount_4_${index}`]);

    updatedValues[`total_purchase_level_${index}`] = totalPurchaseAmount;
    updatedValues[`total_consumed_within_installation`] =
      data.total_consumed_within_installation || 0;
    updatedValues[`total_consumed_within_installation_amounts`] =
      data.total_consumed_within_installation_amounts || totalPurchaseAmount;

    return updatedValues;
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
    initialValues[`name_${index}`] = formValues[`name_${index}`] || "";
    initialValues[`purchased_precursors_${index}`] = precursorValue || "";
    initialValues[`route_${index}`] = routeValue || "";
    initialValues[`amount_${index}`] = formValues[`amount_${index}`] || 0;
    initialValues[`control`] = formValues[`control`] || 0;
    initialValues[`total_consumed_within_installation`] =
      formValues[`total_consumed_within_installation`] || 0;
    initialValues[`value_electricity_indirect_emission_factor`] =
      formValues[`value_electricity_indirect_emission_factor`] || 0;
    initialValues[`source_electricity_indirect_emission_factor`] =
      formValues[`source_electricity_indirect_emission_factor`] || "";
    initialValues[`electricity_emission_factor_${index}`] =
      formValues[`electricity_emission_factor_${index}`] || 0;
    initialValues[`b_category`] = formValues[`b_category`] || "";
    initialValues[`b_name`] = formValues[`b_name`] || "";

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
    if (!fieldValues[`name_${index}`]) {
      errors[`name_${index}`] = "กรุณากรอกข้อมูล";
    }
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
      // ข้อมูลพื้นฐาน
      report_id: reportId ? Number(reportId) : null,
      name: String(fieldValues[`name_${index}`] || ""),
      precursors: String(fieldValues[`purchased_precursors_${index}`] || ""),
      country_code: String(fieldValues[`country_code_${index}`] || "TH"),

      // ข้อมูล routes
      route_1: String(
        fieldValues[`route_0_${index}`] ||
          ""
      ),
      route_1_amounts: ensureNumber(fieldValues[`amount_0_${index}`]),
      route_2: String(fieldValues[`route_1_${index}`] || ""),
      route_2_amounts: ensureNumber(fieldValues[`amount_1_${index}`]),
      route_3: String(fieldValues[`route_2_${index}`] || ""),
      route_3_amounts: ensureNumber(fieldValues[`amount_2_${index}`]),
      route_4: String(fieldValues[`route_3_${index}`] || ""),
      route_4_amounts: ensureNumber(fieldValues[`amount_3_${index}`]),
      route_5: String(fieldValues[`route_4_${index}`] || ""),
      route_5_amounts: ensureNumber(fieldValues[`amount_4_${index}`]),

      // ข้อมูล emissions
      embedded_direct_emissions_value: ensureNumber(
        fieldValues[`embedded_direct_emissions_value_${index}`]
      ),
      source_embedded_direct_emissions: String(
        fieldValues[`source_embedded_direct_emissions_${index}`] || ""
      ),
      // Use the calculated indirect emissions value
      embedded_indirection_emissions_value: calculatedIndirectEmissions,
      source_embedded_indirect_emissions: String(
        fieldValues[`source_embedded_indirect_emissions_${index}`] || ""
      ),

      // ข้อมูล consumption - แก้ไขชื่อฟิลด์ให้ตรงกัน
      total_consumed_within_installation: totalPurchaseLevel,
      consumed_in_production_amounts: ensureNumber(
        fieldValues[`consumed_in_production_amounts`]
      ),
      consumed_non_cbam_goods_amounts: ensureNumber(
        fieldValues[`consumed_non_cbam_goods_amounts`]
      ),
      total_consumed_within_installation_amounts: totalPurchaseLevel,

      // ข้อมูลอื่นๆ
      justification_for_use_default_values: String(
        fieldValues[`justification_for_use_default_values_${index}`] || ""
      ),

      // ข้อมูล SEE
      SEE_direct: null,
      SEE_indirect: null,
      SEE_total: null,
      control: controlAmount,

      // ข้อมูลเกี่ยวกับไฟฟ้า - ใช้ชื่อที่ถูกต้อง
      source_specific_indirect_electricity_consumption: String(
        fieldValues.source_specific_indirect_electricity_consumption || ""
      ),
      value_specific_indirect_electricity_consumption: ensureNumber(
        fieldValues.value_specific_indirect_electricity_consumption
      ),
      source_electricity_indirect_emission_factor: String(
        fieldValues[`source_electricity_indirect_emission_factor`] || ""
      ),
      value_electricity_indirect_emission_factor: ensureNumber(
        fieldValues[`value_electricity_indirect_emission_factor`]
      ),

      // ข้อมูลเพิ่มเติม
      b_name: String(fieldValues[`b_name`] || ""),
      b_category: String(fieldValues[`b_category`] || ""),
    };

    // เพิ่ม ID สำหรับการอัพเดต
    if (existingData?.id) {
      payload.id = existingData.id;
    }

    // ลบฟิลด์ที่มีค่า undefined หรือ NaN ออกไป
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
      if (typeof payload[key] === "number" && isNaN(payload[key])) {
        payload[key] = 0;
      }
    });

    return payload;
  };

  const handleSaveWithAlert = async () => {
    // if (!validateForm()) return;

    const Swal = {
      fire: async (options: any) => ({
        isConfirmed: window.confirm(options.text),
      }),
    };

    const { isConfirmed } = await Swal.fire({
      title: `💾 Save Precursor ${index + 1}`,
      text: "กรอกข้อมูลเสร็จแล้วกด Continue to Next Step",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
    });
    if (!isConfirmed) return;

    setIsSaving(true);

    try {
      const payloadObj = prepareDataForApi();
      const payload = prepareDataForApi();
      const payloadArray = Array.isArray(payloadObj)
        ? payloadObj
        : [payloadObj];

      for (const precursor of payloadArray) {
        const isUpdate = !!precursor.id;
        const method = isUpdate ? "PUT" : "POST";
        const url = isUpdate
          ? `${apiUrl}/api/cbam/e_precursors/${precursor.id}`
          : `${apiUrl}/api/cbam/e_precursors`;


        const response = await fetch(url, {
          method,
          headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`
},
          body: JSON.stringify(precursor),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API Error (${response.status}):`, errorText);
          throw new Error(`API Error (${response.status}): ${errorText}`);
        }

        const responseData = await response.json();
      }

      window.alert(`✅ All precursors saved successfully!`);
      if (onNextStep) onNextStep();
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="precursor-field-group"
      style={{
        // marginBottom: "20px",
        padding: "15px",
        border: "1px solid #e0e0e0",
        borderColor: isSaved || existingData ? "#2ecc71" : "#e0e0e0",
        borderRadius: "4px",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", gap: "1.5rem" }}>
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
            caption="Precursord Name"
            defination="ระบุชื่อผลิตภัณฑ์"
            label=""
            name={`name_${index}`}
            type="text"
            value={fieldValues[`name_${index}`] || ""}
            onChange={e => handleInputChange(`name_${index}`, e.target.value)}
            error={fieldErrors[`name_${index}`]}
            helperText={fieldErrors[`name_${index}`] ? "กรุณากรอกข้อมูล" : ""}
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
                unit="t"
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

          <div
            style={{
              textAlign: "left",
              fontSize: "14px",
              backgroundColor: "#f5f5f5",
              padding: "12px 16px",
              borderRadius: "6px",
              border: "1px solid #e0e0e0",
            }}
          >
            <p
              style={{
                margin: "4px 0",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontWeight: 500 }}>Total production levels:</span>
              <span style={{ fontWeight: 600, color: "#0190c3" }}>
                {totalPurchaseLevel} t
              </span>
            </p>
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
          (b) Consumed in 'production processes' within the installation:
        </strong>
        <p style={{ marginTop: "0.25rem", color: "#666", fontSize: "14px" }}>
          ปริมาณการสั่งซื้อเพื่อใช้ในโรงงาน
        </p>
      </div>

      {/* Production routes */}
      <Box mb={3}>
        <div
          style={{
            textAlign: "left",
            marginBottom: "2rem",
            fontSize: "14px",
            backgroundColor: "#f5f5f5",
            padding: "12px 16px",
            borderRadius: "6px",
            border: "1px solid #e0e0e0",
          }}
        >
          <p
            style={{
              margin: "4px 0",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontWeight: 500 }}>Aggregated goods category:</span>
            <span style={{ fontWeight: 600, color: "#0190c3" }}>
              {selectedGoodsName}
            </span>
          </p>
          <p
            style={{
              margin: "4px 0",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontWeight: 500 }}>Name:</span>
            <span style={{ fontWeight: 600, color: "#0190c3" }}>
              {fieldValues[`b_name`] || ""}
            </span>
          </p>
        </div>

        <Box key={`route-group-included`} display="flex" gap={3} mb={3}>
          <div style={{ flex: 1 }}>
            <LabeledTextField
              caption={`Amount`}
              defination="ระบุปริมาณวัตถุดิบ"
              label=""
              type="number"
              unit="t"
              name={`consumed_in_production_amounts`}
              value={fieldValues[`consumed_in_production_amounts`] || ""}
              onChange={(e) => handleInputChange(e.target.name, e.target.value)}
              error={
                fieldErrors[`consumed_in_production_amounts`] ||
                formErrors[`consumed_in_production_amounts`]
              }
            />
          </div>
        </Box>
      </Box>

      <div
        style={{
          textAlign: "left",
          // marginBottom: "1.5rem",
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
        <Box key={`route-group-b`} display="flex" gap={3} mb={3}>
          <div style={{ flex: 1 }}>
            <LabeledTextField
              type="number"
              caption="Amount"
              defination="ระบุปริมาณวัตถุดิบ"
              unit="t"
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
                placeholder: "Enter amount",
                className: "appearance-none",
              }}
            />
          </div>
        </Box>
      </Box>

      <div
        style={{
          textAlign: "left",
          fontSize: "18px",
        }}
      >
        <strong>(d) Control</strong>
        <p style={{ marginTop: "0.25rem", color: "#666", fontSize: "14px" }}>
          ควบคุม
        </p>
      </div>

      <div
        style={{
          textAlign: "left",
          marginBottom: "2rem",
          fontSize: "14px",
          backgroundColor: "#f5f5f5",
          padding: "12px 16px",
          borderRadius: "6px",
          border: "1px solid #e0e0e0",
        }}
      >
        <p
          style={{
            margin: "4px 0",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontWeight: 500 }}>Control:</span>
          <span style={{ fontWeight: 600, color: "#0190c3" }}>
            {/* { controlAmount || formValues[`control`]}{" "} */}
            {controlAmount}t
          </span>
        </p>
      </div>

      <Box mb={3}>
        <div
          style={{
            textAlign: "left",
            marginBottom: "1.5rem",
            fontSize: "18px",
          }}
        >
          <strong>(e) Emission embedded in this purchased precursor</strong>
        </div>
        <div
          style={{
            textAlign: "left",
            marginBottom: "1.5rem",
            fontSize: "18px",
          }}
        >
          <strong> Direct emissions </strong>
          <p style={{ marginTop: "0.25rem", color: "#666", fontSize: "14px" }}>
            ปริมาณการปล่อยก๊าซเรือนกระจกทางตรง
          </p>
        </div>
        <div
          style={{
            textAlign: "left",
            marginBottom: "2rem",
            fontSize: "14px",
            padding: "12px 16px",
            borderRadius: "6px",
            border: "1px solid #62ccd6ff",
          }}
        >
          <div
            style={{
              textAlign: "left",
              marginBottom: "1.5rem",
              fontSize: "18px",
            }}
          >
            <strong style={{ color: "#0290c4" }}>
              Specific embedded direct emissions (SEE (direct))
            </strong>
            <p
              style={{ marginTop: "0.25rem", color: "#666", fontSize: "14px" }}
            >
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
                onChange={(e) =>
                  handleInputChange(e.target.name, e.target.value)
                }
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
        </div>
      </Box>

      {/* Indirect Emissions Section */}

      <div
        style={{
          textAlign: "left",
          marginBottom: "1.5rem",
          fontSize: "18px",
        }}
      >
        <strong> Indirect emissions </strong>
        <p style={{ marginTop: "0.25rem", color: "#666", fontSize: "14px" }}>
          ปริมาณการปล่อยก๊าซเรือนกระจกทางอ้อม
        </p>
      </div>
      <div
        style={{
          textAlign: "left",
          marginBottom: "2rem",
          fontSize: "14px",
          padding: "12px 16px",
          borderRadius: "6px",
          border: "1px solid #62ccd6ff",
        }}
      >
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
            <p
              style={{ marginTop: "0.25rem", color: "#666", fontSize: "14px" }}
            >
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
                name={`value_specific_indirect_electricity_consumption`}
                value={
                  fieldValues[
                    `value_specific_indirect_electricity_consumption`
                  ] || ""
                }
                onChange={(e) =>
                  handleInputChange(e.target.name, e.target.value)
                }
                error={
                  fieldErrors[
                    `value_specific_indirect_electricity_consumption`
                  ] ||
                  formErrors[`value_specific_indirect_electricity_consumption`]
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
                  { label: "Measured", value: "Measured" },
                  { label: "Default", value: "Default" },
                  { label: "Unknown", value: "Unknown" },
                ]}
                value={
                  fieldValues[`source_embedded_indirect_emissions_${index}`] ||
                  ""
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
            <p
              style={{ marginTop: "0.25rem", color: "#666", fontSize: "14px" }}
            >
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
                value={
                  fieldValues[`value_electricity_indirect_emission_factor`] ||
                  ""
                }
                onChange={(e) =>
                  handleInputChange(e.target.name, e.target.value)
                }
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
                name={`source_electricity_indirect_emission_factor`}
                options={electricitys.map((e) => e.name + e.description)}
                value={String(
                  fieldValues[`source_electricity_indirect_emission_factor`] ||
                    ""
                )}
                error={
                  fieldErrors[`source_electricity_indirect_emission_factor`] ||
                  formErrors[`source_electricity_indirect_emission_factor`]
                }
                onChange={(val) =>
                  handleInputChange(
                    `source_electricity_indirect_emission_factor`,
                    val
                  )
                }
              />
            </div>
          </div>
        </Box>

        <div
          style={{
            textAlign: "left",
            marginBottom: "2rem",
            fontSize: "14px",
            backgroundColor: "#f5f5f5",
            padding: "12px 16px",
            borderRadius: "6px",
            border: "1px solid #e0e0e0",
          }}
        >
          <p
            style={{
              margin: "4px 0",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontWeight: 500 }}>
              Specific embedded indirect emissions (SEE (indirect)):
            </span>
            <span style={{ fontWeight: 600, color: "#0190c3" }}>
              {isNaN(calculatedIndirectEmissions)
                ? ""
                : Number(calculatedIndirectEmissions).toFixed(4)}{" "}
              tCO2e/t
            </span>
          </p>
        </div>
      </div>

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
          // disabled={isSaving || isLoadingData}
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
