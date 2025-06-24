import React, { useState, useEffect } from "react";
import { Container, Typography, Button, Box, Grid } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
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
    // เพิ่มฟิลด์ custom สำหรับเก็บข้อมูลสถานะ
    industry_type?: number;
    goods_category?: number;
  };
  onChange: (formValues: PrecursorsFormProps["formValues"]) => void;
  onNextStep?: () => void;
}

const PrecursorsForm: React.FC<PrecursorsFormProps> = ({ 
  formValues = {}, // ใช้ค่าเริ่มต้นเป็น empty object ถ้าไม่มีการส่งค่า
  onChange,
  onNextStep 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const reportId = localStorage.getItem('reportId');
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [goodsData, setGoodsData] = useState<IndustryGroup[]>([]);
  const [precursorsCount, setPrecursorsCount] = useState<number>(0);
  
  // ใช้ค่าจาก props หรือ localStorage ถ้าไม่มี
  const [industryTypeId, setIndustryTypeId] = useState<number | undefined>(
    formValues.industry_type
  );
  const [goodsId, setGoodsId] = useState<number | undefined>(
    formValues.goods_category
  );
  
  // ใช้ formValues เป็นค่าเริ่มต้น
  const [localFormValues, setLocalFormValues] = useState<{
    [key: string]: string | number;
  }>({
    // แปลง formValues เป็นรูปแบบที่ต้องการ
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

  // โหลดข้อมูลจาก localStorage และ API
  useEffect(() => {
    // โหลดข้อมูลจาก localStorage เฉพาะเมื่อ formValues ไม่มีข้อมูล
    if (!formValues.industry_type && !formValues.goods_category) {
      const savedData = localStorage.getItem("precursorData");
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          if (data.industry_type) setIndustryTypeId(Number(data.industry_type));
          if (data.goods_category) setGoodsId(Number(data.goods_category));
          
          // อัปเดต formValues ผ่าน onChange
          if (onChange) {
            onChange({
              ...formValues,
              industry_type: Number(data.industry_type),
              goods_category: Number(data.goods_category),
              route_1: data.routes?.[0] || "",
              route_1_amounts: parseFloat(data.amounts?.[0] as string) || 0,
              route_2: data.routes?.[1] || "",
              route_2_amounts: parseFloat(data.amounts?.[1] as string) || 0,
              route_3: data.routes?.[2] || "",
              route_3_amounts: parseFloat(data.amounts?.[2] as string) || 0,
              route_4: data.routes?.[3] || "",
              route_4_amounts: parseFloat(data.amounts?.[3] as string) || 0,
              route_5: data.routes?.[4] || "",
              route_5_amounts: parseFloat(data.amounts?.[4] as string) || 0,
            });
          }
        } catch (error) {
          console.error("Error parsing precursorData:", error);
        }
      }
    } else {
      // ถ้ามี formValues ให้ใช้ค่าจาก props
      setIndustryTypeId(formValues.industry_type);
      setGoodsId(formValues.goods_category);
    }

    // โหลดข้อมูลประเทศและสินค้า
    fetchCountries().then((fetched) => {
      setCountries(fetched);
    });
    fetchGoodsData().then((data) => {
      setGoodsData(data);
    });
  }, [formValues, onChange]);

  // อัปเดตค่าเมื่อข้อมูลสินค้าเปลี่ยน
  useEffect(() => {
    if (industryTypeId && goodsId && goodsData.length > 0) {
      const precursors =
        getPrecursorsOptions(goodsData, industryTypeId, goodsId) || [];
      const limitedPrecursors = precursors.slice(0, 6);
      const updatedValues: { [key: string]: string | number } = {};
      
      // นำข้อมูลจาก formValues มาใช้ก่อน (ถ้ามี)
      limitedPrecursors.forEach((precursor, index) => {
        const routeField = `route_${index + 1}` as keyof typeof formValues;
        const amountField = `route_${index + 1}_amounts` as keyof typeof formValues;
        
        updatedValues[`purchased_precursors_${index + 1}`] = 
          formValues[routeField]?.toString() || 
          String(precursor.value || "");
          
        updatedValues[`amount_${index + 1}`] = 
          formValues[amountField]?.toString() || 
          "";
      });
      
      const defaultCountry = countries.find(
        (c) => c.abbreviation === "TH" || c.label === "Thailand"
      );
      
      if (defaultCountry) {
        limitedPrecursors.forEach((_, index) => {
          updatedValues[`country_code_${index + 1}`] =
            defaultCountry.abbreviation;
        });
      }
      
      setLocalFormValues((prev) => ({
        ...prev,
        ...updatedValues,
      }));
      
      setPrecursorsCount(limitedPrecursors.length);
    }
  }, [industryTypeId, goodsId, goodsData, countries, formValues]);

  // อัปเดต parent component เมื่อมีการเปลี่ยนแปลงข้อมูล
  useEffect(() => {
    if (onChange && precursorsCount > 0) {
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
      onChange(updatedFormValues);
    }
  }, [localFormValues, industryTypeId, goodsId, precursorsCount, onChange]);

  const handleChange = (name: string, value: string | string[]) => {
    setLocalFormValues((prev) => ({
      ...prev,
      [name]: Array.isArray(value) ? value.join(",") : value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    
    // ตรวจสอบความถูกต้องของข้อมูล
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
      
      // บันทึกข้อมูลลง localStorage
      localStorage.setItem(
        "precursorData",
        JSON.stringify({
          routes,
          amounts,
          industry_type: industryTypeId,
          goods_category: goodsId,
        })
      );
      
      try {
        // เตรียมข้อมูลสำหรับส่งไป API
        const payload = {
          report_id: reportId,
          name: "",
          route_1: localFormValues["purchased_precursors_1"] || "",
          route_1_amounts: parseFloat(localFormValues["amount_1"]?.toString() || "0"),
          route_2: localFormValues["purchased_precursors_2"] || "",
          route_2_amounts: parseFloat(localFormValues["amount_2"]?.toString() || "0"),
          route_3: localFormValues["purchased_precursors_3"] || "",
          route_3_amounts: parseFloat(localFormValues["amount_3"]?.toString() || "0"),
          route_4: localFormValues["purchased_precursors_4"] || "",
          route_4_amounts: parseFloat(localFormValues["amount_4"]?.toString() || "0"),
          route_5: localFormValues["purchased_precursors_5"] || "",
          route_5_amounts: parseFloat(localFormValues["amount_5"]?.toString() || "0"),
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

        const response = await fetch(
          `${apiUrl}/api/cbam/e_precursors`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Server Error: ${errText}`);
        }
        
        const resData = await response.json();
        setpercursortId(String(resData.id));
        localStorage.setItem("precursorId", String(resData.id));
        
                // อัปเดตข้อมูลล่าสุดที่ parent component
        if (onChange) {
          const updatedFormValues = {
            ...formValues,
            report_id: Number(reportId),
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
            industry_type: industryTypeId,
            goods_category: goodsId,
          };
          onChange(updatedFormValues);
        }
        
        onNextStep?.();
        
        const newId = resData.id;
        // 🔄 Fetch รายละเอียดจาก ID ที่สร้าง
        const getRes = await fetch(
          `${apiUrl}/api/cbam/e_precursors/${newId}`
        );
        
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
              <Typography color="#1976d2" sx={{ mt: 2, textAlign: "center" }} variant="h4">
                ไม่มีรายการวัตถุดิบสำหรับผลิตภัณฑ์นี้ <br /> กรุณากดปุ่ม continue to next step เพื่อกรอกแบบฟอร์มถัดไป 
              </Typography>
            ) : (
              Array.from({ length: precursorsCount }).map((_, idx) => (
                <PrecursorFields
                  key={idx + 1}
                  index={idx + 1}
                  formValues={formValues}
                  formErrors={formErrors}
                  countries={countries}
                  onChange={handleChange}
                  precursorValue={String(
                    localFormValues[`purchased_precursors_${idx + 1}`] ?? ""
                  )}
                  routeValue=""
                  industryTypeId={industryTypeId}
                  goodsId={goodsId}
                />
              ))
            )}
          </Section>
          <PGButton />
        </Grid>
      </form>
    </Container>
  );
};

export default PrecursorsForm;
