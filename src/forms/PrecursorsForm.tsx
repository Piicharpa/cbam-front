import React, { useState, useEffect } from "react";
import { Container, Typography, Button, Box, Grid } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import PGButton from "../components/FormButton";
import Section from "../components/Section";
import PrecursorFields from "./formsections/Precursors_sec1";
import { fetchCountries, CountryOption } from "../components/dropdown/contriesmap";
import { fetchGoodsData, getPrecursorsOptions, IndustryGroup } from "../components/dropdown/goods";

interface PrecursorsFormProps {
  redirectPath?: string;
  onNextStep: () => void;
}

interface FormValues {
  data:{
     report_id: number,
          name: string,
          route_1: string,
          route_1_amounts: number,
          route_2: string,
          route_2_amounts: number,
          route_3: string,
          route_3_amounts: number,
          route_4: string,
          route_4_amounts: number,
          route_5: string,
          route_5_amounts: number,
          total_consumed_within_installation:number,
          consumed_in_production_amounts:number,
          consumed_non_cbam_goods_amounts:number,
          total_consumed_within_installation_amounts:number,
          embedded_direct_emissions_value:number,
          source_embedded_direct_emissions:string,
          embedded_indirection_emissions_value:number,
          source_embedded_indirect_emissions:string,
          justification_for_use_default_values:string,
  }
}

const PrecursorsForm: React.FC<PrecursorsFormProps> = ({ onNextStep }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const reportId = location.state?.reportId || null;
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [goodsData, setGoodsData] = useState<IndustryGroup[]>([]);
  const [precursorsCount, setPrecursorsCount] = useState<number>(0);
  const [industryTypeId, setIndustryTypeId] = useState<number | undefined>();
  const [goodsId, setGoodsId] = useState<number | undefined>();
  const [formValues, setFormValues] = useState<{ [key: string]: string | number }>({});
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [percursorId, setpercursortId] = useState<string | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem("precursorData");
    console.log(savedData);
    if (savedData) {
      const data = JSON.parse(savedData);
      if (data.industry_type) setIndustryTypeId(Number(data.industry_type));
      if (data.goods_category) setGoodsId(Number(data.goods_category));
    }
    fetchCountries().then((fetched) => {
      setCountries(fetched);
    });
    fetchGoodsData().then((data) => {
      setGoodsData(data);
    });
  }, []);

  useEffect(() => {
    if (industryTypeId && goodsId && goodsData.length > 0) {
      const precursors = getPrecursorsOptions(goodsData, industryTypeId, goodsId) || [];
      const limitedPrecursors = precursors.slice(0, 6);
      const updatedValues: { [key: string]: string | number } = {};
      
      limitedPrecursors.forEach((precursor, index) => {
        updatedValues[`purchased_precursors_${index + 1}`] = String(precursor.value || "");
        updatedValues[`amount_${index + 1}`] = ""; // Initialize as empty string
      });
      
      const defaultCountry = countries.find(c => c.abbreviation === "TH" || c.label === "Thailand");
      if (defaultCountry) {
        limitedPrecursors.forEach((_, index) => {
          updatedValues[`country_code_${index + 1}`] = defaultCountry.abbreviation;
        });
      }
      
      setFormValues(prev => ({
        ...prev,
        ...updatedValues,
      }));
      setPrecursorsCount(limitedPrecursors.length);
    }
  }, [industryTypeId, goodsId, goodsData, countries]);

  const handleChange = (name: string, value: string | string[]) => {
    setFormValues(prev => ({ 
      ...prev, 
      [name]: Array.isArray(value) ? value.join(",") : value 
    }));
    setFormErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    console.log("Submit formValues:", formValues);

    for (let i = 1; i <= precursorsCount; i++) {
      if (!formValues[`purchased_precursors_${i}`]) {
        newErrors[`purchased_precursors_${i}`] = "กรุณากรอกข้อมูล";
      }
      if (!formValues[`country_code_${i}`]) {
        newErrors[`country_code_${i}`] = "กรุณาเลือกประเทศ";
      }
      if (!formValues[`amount_${i}`]) {
        newErrors[`amount_${i}`] = "กรุณาระบุจำนวน";
      }
    }

    setFormErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const routes = Array.from({ length: precursorsCount }, (_, idx) => 
        formValues[`purchased_precursors_${idx + 1}`] || "");
        
      const amounts = Array.from({ length: precursorsCount }, (_, idx) => 
        formValues[`amount_${idx + 1}`] || "")
        .reduce<{ [key: number]: string | number }>((acc, curr, idx) => {
          acc[idx] = curr;
          return acc;
        }, {});

      localStorage.setItem("precursorData", JSON.stringify({
        routes,
        amounts,
        industry_type: industryTypeId,
        goods_category: goodsId,
      }));

      try {
        // Convert amount values to numbers for API payload
        const payload = {
          report_id: reportId,
          name: "",
          route_1: formValues["purchased_precursors_1"] || "",
          route_1_amounts: parseFloat(formValues["amount_1"] as string) || 0,
          route_2: formValues["purchased_precursors_2"] || "",
          route_2_amounts: parseFloat(formValues["amount_2"] as string) || 0,
          route_3: formValues["purchased_precursors_3"] || "",
          route_3_amounts: parseFloat(formValues["amount_3"] as string) || 0,
          route_4: formValues["purchased_precursors_4"] || "",
          route_4_amounts: parseFloat(formValues["amount_4"] as string) || 0,
          route_5: formValues["purchased_precursors_5"] || "",
                    route_5_amounts: parseFloat(formValues["amount_5"] as string) || 0,
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
        
        console.log("📦 POST Payload:", payload);
        
        const response = await fetch("http://178.128.123.212:5000/api/cbam/e_precursors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Server Error: ${errText}`);
        }
        
        const resData = await response.json();
        console.log("✅ POST สำเร็จ:", resData);
        setpercursortId(String(resData.id));
        localStorage.setItem("precursorId", String(resData.id));
        console.log("📌 precursorId:", resData.id);
        
        onNextStep?.();
        
        const newId = resData.id;
        
        // 🔄 Fetch รายละเอียดจาก ID ที่สร้าง
        const getRes = await fetch(`http://178.128.123.212:5000/api/cbam/e_precursors/${newId}`);
        if (!getRes.ok) {
          const errText = await getRes.text();
          throw new Error(`GET Error: ${errText}`);
        }
        
        const detailData = await getRes.json();
        console.log("🔍 ข้อมูลที่ดึงมาหลัง POST:", detailData);
        alert("✅ บันทึกสำเร็จ! ID: " + newId);
        
      } catch (error: any) {
        console.error("❌ Error ใน POST หรือ GET:", error.message || error);
      }
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
      <form onSubmit={handleSubmit}>
         <Grid container spacing={3}>
        <Section
          defaultExpanded
          title="(a) List of purchased precursors"
          subtitle="รายการวัตถุดิบ"
          hasError={Object.keys(formErrors).length > 0}
        >
          {Array.from({ length: precursorsCount }).map((_, idx) => (
            <PrecursorFields
              key={idx + 1}
              index={idx + 1}
              formValues={formValues}
              formErrors={formErrors}
              countries={countries}
              onChange={handleChange}
              precursorValue={String(formValues[`purchased_precursors_${idx + 1}`] ?? "")}
              routeValue=""
              industryTypeId={industryTypeId}
              goodsId={goodsId}
            />
          ))}
        </Section>
        <PGButton />
        </Grid>
      </form>
    </Container>
  );
};

export default PrecursorsForm;