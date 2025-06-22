import React, { useState, useEffect } from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

import Section from "../components/Section";
import PrecursorFields from "./formsections/Precursors_sec1";
import { fetchCountries, CountryOption } from "../components/dropdown/contriesmap";
import { fetchGoodsData, getPrecursorsOptions, IndustryGroup } from "../components/dropdown/goods";

interface PrecursorsFormProps {
  redirectPath?: string;
  onNextStep: () => void;
}

interface FormValues {
  [key: string]: string;
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
  const [formValues, setFormValues] = useState<FormValues>({});
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [percursorId, setpercursortId] = useState<string | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem("precursorData");
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
      const updatedValues: FormValues = {};

      limitedPrecursors.forEach((precursor, index) => {
        updatedValues[`purchased_precursors_${index + 1}`] = String(precursor.value || "");
        updatedValues[`amount_${index + 1}`] = "";
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
    setFormValues(prev => ({ ...prev, [name]: Array.isArray(value) ? value.join(",") : String(value) }));
    setFormErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    console.log("Submit formValues:", formValues); //

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
      const routes = Array.from({ length: precursorsCount }, (_, idx) => formValues[`purchased_precursors_${idx + 1}`] || "");
      const amounts = Array.from({ length: precursorsCount }, (_, idx) => formValues[`amount_${idx + 1}`] || "")
        .reduce<{ [key: number]: string }>((acc, curr, idx) => {
          acc[idx] = curr;
          return acc;
        }, {});

      localStorage.setItem("precursorData", JSON.stringify({
        routes,
        amounts,
        industry_type: industryTypeId,
        goods_category: goodsId,
      }));
      let resData: any = null;
      try {
        const payload = {
          report_id: reportId,
          name: "",
          route_1: formValues["purchased_precursors_1"] || "",
          route_1_amounts: formValues["amount_1"] || "",
          route_2: formValues["purchased_precursors_2"] || "",
          route_2_amounts: formValues["amount_2"] || "",
          route_3: formValues["purchased_precursors_3"] || "",
          route_3_amounts: formValues["amount_3"] || "",
          route_4: formValues["purchased_precursors_4"] || "",
          route_4_amounts: formValues["amount_4"] || "",
          route_5: formValues["purchased_precursors_5"] || "",
          route_5_amounts: formValues["amount_5"] || "",
          total_consumed_within_installation: "",
          consumed_in_production_amounts: "",
          consumed_non_cbam_goods_amounts: "",
          total_consumed_within_installation_amounts: "",
          embedded_direct_emissions_value: "",
          source_embedded_direct_emissions: "",
          embedded_indirection_emissions_value: "",
          source_embedded_indirect_emissions: "",
          justification_for_use_default_values: "",
        };

        console.log("📦 POST Payload:", payload);

        const response = await fetch("http://localhost:5000/api/cbam/e_precursors", {
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

        setpercursortId(String(resData.id)); // ✅ ตั้งค่าค่า state ให้แสดงผลภายหลัง
        localStorage.setItem("precursorId", String(resData.id)); // ✅ เก็บใน localStorage
        console.log("📌 precursorId:", resData.id);
        onNextStep?.();


        const newId = resData.id; // 👈 ได้ id ที่สร้างใหม่

        // 🔄 Fetch รายละเอียดจาก ID ที่สร้าง
        const getRes = await fetch(`http://localhost:5000/api/cbam/e_precursors/${newId}`);
        if (!getRes.ok) {
          const errText = await getRes.text();
          throw new Error(`GET Error: ${errText}`);
        }

        const detailData = await getRes.json();
        console.log("🔍 ข้อมูลที่ดึงมาหลัง POST:", detailData);

        alert("✅ บันทึกสำเร็จ! ID: " + newId);

        // คุณจะ navigate ไปหน้ารายละเอียดก็ได้ เช่น:
        // navigate(`/precursors/detail/${newId}`);
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
              precursorValue={formValues[`purchased_precursors_${idx + 1}`] || ""}
              routeValue=""
              // Assuming these values are defined somewhere appropriately
              industryTypeId={industryTypeId}
              goodsId={goodsId}
            />
          ))}
        </Section>

        <Box sx={{ mt: 3, textAlign: "right" }}>
          <Button type="submit" variant="contained" color="primary">
            SAVE
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default PrecursorsForm;