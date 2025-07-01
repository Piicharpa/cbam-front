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
    country_id?:string;
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
  // const reportId = localStorage.getItem("reportId");
  const reportId =23;
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [goodsData, setGoodsData] = useState<IndustryGroup[]>([]);
  const [precursorsCount, setPrecursorsCount] = useState<number>(0);

  // Track if initialization has been completed
  const [initialized, setInitialized] = useState(false);

  // Use values from props or localStorage
  const [industryTypeId, setIndustryTypeId] = useState<number | undefined>(
    formValues.industry_type
  );
  const [goodsId, setGoodsId] = useState<number | undefined>(
    formValues.goods_category
  );

  const [localFormValues, setLocalFormValues] = useState<{
    [key: string]: string | number;
  }>({
    purchased_precursors_1: formValues.route_1 || "",
    amount_1: formValues.route_1_amounts || "",
    purchased_precursors_2: formValues.route_2 || "",
    amount_2: formValues.route_2_amounts || "",
    purchased_precursors_3: formValues.route_3 || "",
    amount_3: formValues.route_3_amounts || "",
    purchased_precursors_4: formValues.route_4 || "",
    amount_4: formValues.route_4_amounts || "",
    purchased_precursors_5: formValues.route_5 || "",
    amount_5: formValues.route_5_amounts || "",
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [percursorId, setpercursortId] = useState<string | null>(null);
  const apiUrl = process.env.REACT_APP_API_URL;

  // Initialization useEffect - runs only once on mount
  useEffect(() => {
    // Load data sources
    fetchCountries().then((result) => setCountries(result.countries));
    fetchGoodsData().then(setGoodsData);

    // Initialize from localStorage
    const initFromData = () => {
      // Try to load from goodsFormData first (most recent)
      const goodsFormData = localStorage.getItem("goodsFormData");
      if (goodsFormData) {
        try {
          const parsed = JSON.parse(goodsFormData);
          const industry_type = Number(parsed.industry_type);
          const goods_category = Number(parsed.goods_category);

          // Update local state
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

      // Fallback to precursorData
      const savedData = localStorage.getItem("precursorData");
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          if (data.industry_type) {
            setIndustryTypeId(Number(data.industry_type));
            setGoodsId(Number(data.goods_category));
            console.log(
              "Loaded from precursorData:",
              data.industry_type,
              data.goods_category
            );
            return true;
          }
        } catch (error) {
          console.error("Error parsing precursorData:", error);
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
    }
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
  }, [formValues.industry_type, formValues.goods_category]);

  // Process precursor options when industry_type and goods_category are available
  useEffect(() => {
    if (!industryTypeId || !goodsId || !goodsData.length || !countries.length)
      return;

    const precursors =
      getPrecursorsOptions(goodsData, industryTypeId, goodsId) || [];
    const limitedPrecursors = precursors.slice(0, 6);
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

    // Update the form values and precursor count
    setLocalFormValues((prev) => ({
      ...prev,
      ...updatedValues,
    }));

    setPrecursorsCount(limitedPrecursors.length);
  }, [industryTypeId, goodsId, goodsData, countries]);

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
      route_1_amounts: parseFloat(localFormValues["amount_1"]?.toString() || "0"),
      route_2: localFormValues["purchased_precursors_2"]?.toString() || "",
      route_2_amounts: parseFloat(localFormValues["amount_2"]?.toString() || "0"),
      route_3: localFormValues["purchased_precursors_3"]?.toString() || "",
      route_3_amounts: parseFloat(localFormValues["amount_3"]?.toString() || "0"),
      route_4: localFormValues["purchased_precursors_4"]?.toString() || "",
      route_4_amounts: parseFloat(localFormValues["amount_4"]?.toString() || "0"),
      route_5: localFormValues["purchased_precursors_5"]?.toString() || "",
      route_5_amounts: parseFloat(localFormValues["amount_5"]?.toString() || "0"),
    };

    // Notify parent
    onChange(updatedFormValues);
  }
}, [onChange, precursorsCount]);

  // Add a ref to track previous values
const previousValuesRef = useRef<{[key: string]: string | number}>({});

// Update handleChange to prevent unnecessary updates
const handleChange = (name: string, value: string | number | (string | number)[]) => {
  let newValue: string | number;
  if (Array.isArray(value)) {
    newValue = value.join(",");
  } else {
    newValue = value;
  }

  // Only update if the value has changed
  if (previousValuesRef.current[name] !== newValue) {
    previousValuesRef.current[name] = newValue;

    setLocalFormValues((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Only clear errors if there are errors for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Now manually update the parent component if needed
    if ((onChange && name.startsWith('purchased_precursors_')) || name.startsWith('amount_')) {
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
    route_1_amounts: parseFloat(localFormValues["amount_1"]?.toString() || "0"),
    route_2: localFormValues["purchased_precursors_2"]?.toString() || "",
    route_2_amounts: parseFloat(localFormValues["amount_2"]?.toString() || "0"),
    route_3: localFormValues["purchased_precursors_3"]?.toString() || "",
    route_3_amounts: parseFloat(localFormValues["amount_3"]?.toString() || "0"),
    route_4: localFormValues["purchased_precursors_4"]?.toString() || "",
    route_4_amounts: parseFloat(localFormValues["amount_4"]?.toString() || "0"),
    route_5: localFormValues["purchased_precursors_5"]?.toString() || "",
    route_5_amounts: parseFloat(localFormValues["amount_5"]?.toString() || "0"),
  };
};

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    // Validate form fields
    for (let i = 1; i <= precursorsCount; i++) {
      if (!localFormValues[`purchased_precursors_${i}`]) {
        newErrors[`purchased_precursors_${i}`] = "กรุณากรอกข้อมูล";
      }
      if (!localFormValues[`country_code_${i}`]) {
        newErrors[`country_code_${i}`] = "กรุณาเลือกประเทศ";
      }
      if (!localFormValues[`amount_${i}`]) {
        newErrors[`amount_${i}`] = "กรุณาระบุจำนวน";
      }
    }

    setFormErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Prepare data to save to localStorage
      const routes = Array.from(
        { length: precursorsCount },
        (_, idx) => localFormValues[`purchased_precursors_${idx + 1}`] || ""
      );

      const amounts = Array.from(
        { length: precursorsCount },
        (_, idx) => localFormValues[`amount_${idx + 1}`] || ""
      ).reduce<{ [key: number]: string | number }>((acc, curr, idx) => {
        acc[idx] = curr;
        return acc;
      }, {});

      // Save data to localStorage
      localStorage.setItem(
        "precursorData",
        JSON.stringify({
          routes,
          amounts,
          industry_type: industryTypeId,
          goods_category: goodsId,
        })
      );
      console.log(localStorage)

      try {
        // Prepare API payload
        const payload = {
          report_id: reportId,
          name: "",
          route_1: localFormValues["purchased_precursors_1"] || "",
          route_1_amounts: parseFloat(
            localFormValues["amount_1"]?.toString() || "0"
          ),
          route_2: localFormValues["purchased_precursors_2"] || "",
          route_2_amounts: parseFloat(
            localFormValues["amount_2"]?.toString() || "0"
          ),
          route_3: localFormValues["purchased_precursors_3"] || "",
          route_3_amounts: parseFloat(
            localFormValues["amount_3"]?.toString() || "0"
          ),
          route_4: localFormValues["purchased_precursors_4"] || "",
          route_4_amounts: parseFloat(
            localFormValues["amount_4"]?.toString() || "0"
          ),
          route_5: localFormValues["purchased_precursors_5"] || "",
          route_5_amounts: parseFloat(
            localFormValues["amount_5"]?.toString() || "0"
          ),
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

        // Submit data to API
        const response = await fetch(`${apiUrl}/api/cbam/e_precursors`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Server Error: ${errText}`);
        }

        const resData = await response.json();
        setpercursortId(String(resData.id));
        localStorage.setItem("precursorId", String(resData.id));
        console.log("Precursor:", resData)

        // Navigate to next step
        onNextStep?.();

        const newId = resData.id;
        // 🔄 Fetch รายละเอียดจาก ID ที่สร้าง
        const getRes = await fetch(`${apiUrl}/api/cbam/e_precursors/${newId}`);

        if (!getRes.ok) {
          const errText = await getRes.text();
          throw new Error(`GET Error: ${errText}`);
        }

        const detailData = await getRes.json();
        console.log("Precursor data retrieved successfully:", detailData);
      } catch (error: any) {
        console.error("❌ Error ใน POST หรือ GET:", error.message || error);
        alert(`เกิดข้อผิดพลาด: ${error.message}`);
      }
    }
  };

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
                ไม่มีรายการวัตถุดิบสำหรับผลิตภัณฑ์นี้ <br /> กรุณากดปุ่ม
                continue to next step เพื่อกรอกแบบฟอร์มถัดไป
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
                    formValues={localFormValues} // Pass localFormValues instead of formValues
                    formErrors={formErrors}
                    countries={countries}
                    onChange={handleChange}
                    precursorValue={fixedPrecursorValue} // Pass the fixed precursor value
                    routeValue=""
                    industryTypeId={industryTypeId}
                    goodsId={goodsId}
                  />
                );
              })
            )}
          </Section>
          <PGButton />
        </Grid>
      </form>
    </Container>
  );
};

export default PrecursorsForm;

/* Removed erroneous useRef definition that overrides React's useRef */

