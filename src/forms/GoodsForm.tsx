import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Box,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import Section from "../components/Section";
import PGButton from "../components/FormButton";
import {
  fetchCountries,
  CountryOption,
} from "../components/dropdown/contriesmap";
import Section1 from "./formsections/Goods_sec1";
import Section2 from "./formsections/Goods_sec2";
import Section3 from "./formsections/Goods_sec3";

interface GoodsFormProps {
  formValues: {
    report_id: string;
    name: string;
    goods_category: string;
    routes: { [key: number]: string }; 
    amounts: { [key: number]: string };
    total_consumed_within_installation: number;
    consumed_in_others_amounts: string;
    condumed_non_cbam_goods_amounts: string;
    has_heat: string;
    has_waste_gases: string;
    direct_emissions: string;
    imported_heat_value: string;
    exported_heat_value: string;
    ef_imported_heat: string;
    ef_exported_heat: string;
    electricity_consumption_value: string;
    ef_electricity: string;
    source_of_ef_electricity: string;
    exported_electricity_value: string;
    ef_exported_electricity: string;
    produced_for_market_amount: string;
    imported_wgases_amount: string;
    ef_imported_wgases: string;
    exported_wgases_amount: string;
    ef_exported_wgases: string;
    industry_type: string;
    total_production_amounts: string;
  };
  onChange: (formValues: GoodsFormProps["formValues"]) => void;
  redirectPath?: string;
  onNextStep: () => void;
}

const GoodsForm: React.FC<GoodsFormProps> = ({ formValues, onChange, onNextStep }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const reportIdRaw = (location.state as { reportId?: number } | undefined)?.reportId || null;
  const reportId = reportIdRaw ? Number(reportIdRaw) : null;
  
  const [localFormValues, setLocalFormValues] = useState<GoodsFormProps["formValues"]>({
    report_id: "",
    name: "",
    goods_category: "",
    routes: {},
    amounts: {},
    total_consumed_within_installation: 0 ,
    consumed_in_others_amounts: "",
    condumed_non_cbam_goods_amounts: "",
    has_heat: "",
    has_waste_gases: "",
    direct_emissions: "",
    imported_heat_value: "",
    exported_heat_value: "",
    ef_imported_heat: "",
    ef_exported_heat: "",
    electricity_consumption_value: "",
    ef_electricity: "",
    source_of_ef_electricity: "",
    exported_electricity_value: "",
    ef_exported_electricity: "",
    produced_for_market_amount: "",
    imported_wgases_amount: "",
    ef_imported_wgases: "",
    exported_wgases_amount: "",
    ef_exported_wgases: "",
    industry_type: "",
    total_production_amounts: "",
  });
  
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [countries, setCountries] = useState<CountryOption[]>([]);
  
  useEffect(() => {
    const loadCountries = async () => {
      const fetched = await fetchCountries();
      setCountries(fetched);
    };
    loadCountries();
  }, []);
  
  useEffect(() => {
    setLocalFormValues(formValues);
  }, [formValues]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalFormValues((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log("✅ handleSubmit called");
    console.log("📦 formValues ที่จะส่ง:", localFormValues);
    
    const payload = {
      ...localFormValues,
      name: localFormValues.goods_category || "",   
      amounts: JSON.stringify(localFormValues.amounts), 
      routes: JSON.stringify(localFormValues.routes),   
      report_id: reportId || "", 
    };
    console.log("data", payload);
    
    try {
      console.log("💬 ส่งข้อมูล:", localFormValues);
      console.log("📦 report_id ที่จะส่ง:", reportId);
      
      const response = await fetch("http://178.128.123.212:5000/api/cbam/d_goods/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ บันทึกสำเร็จ:", data);
      
      // Navigate to the next page
      // navigate('/next-page'); // Replace '/next-page' with your desired redirect path
      
      onNextStep?.();
    } catch (err: any) {
      console.error("❌ POST error:", err.message || err);
    }
  };

  return (
    <Container maxWidth="md" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3} alignItems="stretch">
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="#1976d2">
              Aggregated goods categories and relevant production processes
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              รายละเอียดของกลุ่มสินค้าและกระบวนการผลิต
            </Typography>
          </Box>
          <Section1
            values={localFormValues}
            errors={formErrors}
            onChange={(field, val) => {
              setLocalFormValues((prev) => ({ ...prev, [field]: val }));
              setFormErrors((prev) => ({ ...prev, [field]: "" }));
            }}
          />
          <Section2
            values={localFormValues}
            errors={formErrors}
            onChange={handleInputChange}
          />
          <Section3
            values={localFormValues}
            errors={formErrors}
            onChange={handleInputChange}
            setValues={setLocalFormValues}
            countries={countries}
          />
          <PGButton />
        </Grid>
      </form>
    </Container>
  );
};

export default GoodsForm;