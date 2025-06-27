// PrecursorsForm.tsx
import React, { useState, useEffect, useRef } from "react";
import { Container, Typography, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PGButton from "../components/FormButton";
import Section from "../components/Section";
import PrecursorFields from "./formsections/Precursors_sec1";
import { fetchCountries, CountryOption } from "../components/dropdown/contriesmap";
import { fetchGoodsData, getPrecursorsOptions, IndustryGroup } from "../components/dropdown/goods";

// Define a type for individual precursor that is ready for submission
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

interface PrecursorsFormProps {
  formValues: {
    route_1?: string;
    route_1_amounts?: number | string;
    route_2?: string;
    route_2_amounts?: number | string;
    route_3?: string;
    route_3_amounts?: number | string;
    route_4?: string;
    route_4_amounts?: number | string;
    route_5?: string;
    route_5_amounts?: number | string;
    report_id?: number;
    industry_type?: number;
    goods_category?: number;
    // other needed fields...
  };
  onChange: (formValues: PrecursorsFormProps["formValues"]) => void;
  onNextStep?: () => void;
}

const PrecursorsForm: React.FC<PrecursorsFormProps> = ({
  formValues = {},
  onChange,
  onNextStep,
}) => {
  const navigate = useNavigate();
  const reportId = localStorage.getItem("reportId");
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [goodsData, setGoodsData] = useState<IndustryGroup[]>([]);
  const [precursorsCount, setPrecursorsCount] = useState<number>(0);
  const [initialized, setInitialized] = useState(false);
  
  const [industryTypeId, setIndustryTypeId] = useState<number | undefined>(formValues.industry_type);
  const [goodsId, setGoodsId] = useState<number | undefined>(formValues.goods_category);
  const [localFormValues, setLocalFormValues] = useState<{ [key: string]: string | number }>({
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
  const [savedPrecursors, setSavedPrecursors] = useState<{ [key: number]: boolean }>({});
  const apiUrl = process.env.REACT_APP_API_URL;

  // Load initial data
  useEffect(() => {
    fetchCountries().then(setCountries);
    fetchGoodsData().then(setGoodsData);
    
    // Initialize from localStorage or props logic
    const initFromData = () => {
      // Load from goodsFormData, precursorData, or props
      // ...existing logic
      return false;
    };
    
    if (initFromData()) {
      setInitialized(true);
    }
  }, []);

  // Handle props changes for industry_type and goods_category
  useEffect(() => {
    if (formValues.industry_type !== industryTypeId && formValues.industry_type !== undefined) {
      setIndustryTypeId(formValues.industry_type);
    }
    if (formValues.goods_category !== goodsId && formValues.goods_category !== undefined) {
      setGoodsId(formValues.goods_category);
    }
  }, [formValues.industry_type, formValues.goods_category]);

  // Process precursor options
  useEffect(() => {
    if (!industryTypeId || !goodsId || !goodsData.length || !countries.length) return;
    
    const precursors = getPrecursorsOptions(goodsData, industryTypeId, goodsId) || [];
    const limitedPrecursors = precursors.slice(0, 6);
    const updatedValues: { [key: string]: string | number } = {};
    
    // Process each precursor
    limitedPrecursors.forEach((precursor, index) => {
      // Logic to set default values
      // ...existing logic
    });
    
    // Set default country
    // ...existing logic
    
    setLocalFormValues((prev) => ({ ...prev, ...updatedValues }));
    setPrecursorsCount(limitedPrecursors.length);
  }, [industryTypeId, goodsId, goodsData, countries]);

  // Handle individual precursor values change
  const handleChange = (name: string, value: string | number | (string | number)[]) => {
    let newValue: string | number;
    if (Array.isArray(value)) {
      newValue = value.join(",");
    } else {
      newValue = value;
    }
    
    setLocalFormValues((prev) => ({ ...prev, [name]: newValue }));
    
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // PrecursorsForm.tsx (continued)

// Function to save individual precursor
const savePrecursor = async (index: number, data: PrecursorSubmitData) => {
  // Validate this precursor
  const precursorErrors: { [key: string]: string } = {};
  
  if (!data.route) precursorErrors[`purchased_precursors_${index}`] = "กรุณากรอกข้อมูล";
  if (!data.country_code) precursorErrors[`country_code_${index}`] = "กรุณาเลือกประเทศ";
  if (!data.amount) precursorErrors[`amount_${index}`] = "กรุณาระบุจำนวน";
  
  // Update errors only for this precursor
  if (Object.keys(precursorErrors).length > 0) {
    setFormErrors((prev) => ({ ...prev, ...precursorErrors }));
    return;
  }
  
  try {
    // Prepare payload for this specific precursor
    const payload = {
      report_id: reportId,
      name: data.route,
      [`route_${index}`]: data.route,
      [`route_${index}_amounts`]: data.amount,
      embedded_direct_emissions_value: data.embedded_direct_emissions_value || 0,
      source_embedded_direct_emissions: data.source_embedded_direct_emissions || "",
      embedded_indirect_emissions_value: data.embedded_indirect_emissions_value || 0,
      source_embedded_indirect_emissions: data.source_embedded_indirect_emissions || "",
      justification_for_use_default_values: data.justification_for_use_default_values || "",
      country_code: data.country_code,
      industry_type: industryTypeId,
      goods_category: goodsId
    };
    
    // Submit to API
    const response = await fetch(`${apiUrl}/api/cbam/e_precursors/single`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Server Error: ${errText}`);
    }
    
    const resData = await response.json();
    
    // Mark this precursor as saved
    setSavedPrecursors(prev => ({ ...prev, [index]: true }));
    
    // Store the precursor ID in local storage
    const precursorIds = JSON.parse(localStorage.getItem('precursorIds') || '{}');
    precursorIds[index] = resData.id;
    localStorage.setItem('precursorIds', JSON.stringify(precursorIds));
    
    alert(`Precursor ${index} saved successfully!`);
    
  } catch (error: any) {
    console.error(`Error saving precursor ${index}:`, error);
    alert(`Failed to save precursor ${index}: ${error.message}`);
  }
};

// Continue to next step only if all precursors are saved
const handleContinue = () => {
  const allSaved = Array.from({ length: precursorsCount }, (_, i) => i + 1)
    .every(index => savedPrecursors[index]);
    
  if (allSaved) {
    onNextStep?.();
  } else {
    alert("Please save all precursors before continuing.");
  }
};

return (
  <Container maxWidth="md" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
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
            const index = idx + 1;
            const fixedPrecursorValue = String(
              localFormValues[`purchased_precursors_${index}`] ?? ""
            );
            
            return (
              <PrecursorFields
                key={index}
                index={index}
                formValues={localFormValues}
                formErrors={formErrors}
                countries={countries}
                onChange={handleChange}
                precursorValue={fixedPrecursorValue}
                routeValue=""
                industryTypeId={industryTypeId}
                goodsId={goodsId}
                onSave={(data) => savePrecursor(index, data)}
                isSaved={savedPrecursors[index] || false}
              />
            );
          })
        )}
      </Section>
    </Grid>
  </Container>
);
};

export default PrecursorsForm;