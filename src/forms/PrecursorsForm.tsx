import React, { useState, useEffect } from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

import Section from "../components/Section";
import PrecursorFields from "./formsections/Precursors_sec1";
import { fetchCountries, CountryOption } from "../components/dropdown/contriesmap";
import { fetchGoodsData, getPrecursorsOptions, IndustryGroup } from "../components/dropdown/goods";
import PGButton from "../components/FormButton_v2";

interface PrecursorsFormProps {
  redirectPath?: string;
}

interface FormValues {
  [key: string]: string;
}

const PrecursorsForm: React.FC<PrecursorsFormProps> = () => {
  const navigate = useNavigate();
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [goodsData, setGoodsData] = useState<IndustryGroup[]>([]);
  const [precursorsCount, setPrecursorsCount] = useState<number>(0);
  const [industryTypeId, setIndustryTypeId] = useState<number | undefined>();
  const [goodsId, setGoodsId] = useState<number | undefined>();
  const [formValues, setFormValues] = useState<FormValues>({});
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

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

      navigate("/next-step");
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
          <PGButton onClick={() => { handleSubmit(new Event('submit') as unknown as React.FormEvent); }}>SAVE</PGButton>
        </Box>
      </form>
    </Container>
  );
};

export default PrecursorsForm;