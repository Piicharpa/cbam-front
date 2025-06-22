import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Box,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import Section from "../components/Section";
import PGButton from "../components/FormButton_v2";
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
    routes: { [key: number]: string }; // เปลี่ยนจาก string[] เป็นแบบ object ตามที่คุณปรับ
    amounts: { [key: number]: string };
    total_consumed_within_installation: string;
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
    total_production_amounts: string;
    produced_for_market_amount: string;
    imported_wgases_amount: string;
    ef_imported_wgases: string;
    exported_wgases_amount: string;
    ef_exported_wgases: string;
    industry_type: string;
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
    total_consumed_within_installation: "",
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
    total_production_amounts: "",
    produced_for_market_amount: "",
    imported_wgases_amount: "",
    ef_imported_wgases: "",
    exported_wgases_amount: "",
    ef_exported_wgases: "",
    industry_type: "",
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
    console.log("📦 formValues ที่จะส่ง:", localFormValues); // <<==== ใส่ตรงนี้

    // ✅ validate (เฉพาะตัวอย่าง)
    // const requiredFields = ["report_id", "name", "route_1"];
    // const errors: { [key: string]: string } = {};
    // for (const field of requiredFields) {
    //   if (!localFormValues[field as keyof typeof localFormValues]) {
    //     errors[field] = "กรุณากรอกข้อมูล";
    //   }
    // }
    // if (Object.keys(errors).length > 0) {
    //   setFormErrors(errors);
    //   return;
    // }

    const payload = {
      ...localFormValues,
      name: localFormValues.goods_category || "",   // เปลี่ยน name เป็น goods_category
      amounts: JSON.stringify(localFormValues.amounts), // ✅ แก้ตรงนี้
      routes: JSON.stringify(localFormValues.routes),   // ✅ ถ้า routes เป็น object ด้วย
      report_id: reportId || "", // 🔍 ต้องเป็นค่าที่ตรงกับ `reports.id`

    };

    try {
      console.log("💬 ส่งข้อมูล:", localFormValues);
      console.log("📦 report_id ที่จะส่ง:", reportId);

      const response = await fetch("http://localhost:5000/api/cbam/d_goods/", {
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
          // onNext={() => setActiveStep(3)}
          />

          <Section3
            values={localFormValues}
            errors={formErrors}
            onChange={handleInputChange}
            // onNext={() => setActiveStep(4)}
            setValues={setLocalFormValues}
            countries={countries}
          />

          <PGButton type="submit">SAVE</PGButton>
        </Grid>
      </form>
    </Container>
  );
};

export default GoodsForm;
