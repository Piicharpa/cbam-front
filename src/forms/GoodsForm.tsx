import React, { useState, useEffect } from "react";
import { Container, Typography, Grid, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import Section from "../components/Section";
import PGButton from "../components/FormButton";
import { fetchCountries, CountryOption } from "../components/dropdown/contriesmap";
import Section1 from "./formsections/Goods/Goods_sec1";
import Section2 from "./formsections/Goods/Goods_sec2";
import Section3 from "./formsections/Goods/Goods_sec3";

interface GoodsFormProps {
    formValues: {
        report_id: number;
        name: string;
        goods_category: string;
        routes: { [key: number]: string };
        amounts: { [key: number]: string };
        total_consumed_within_installation: number;
        consumed_in_others_amounts: number;
        condumed_non_cbam_goods_amounts: number;
        has_heat: number;
        has_waste_gases: number;
        direct_emissions: number;
        imported_heat_value: number;
        exported_heat_value: number;
        ef_imported_heat: number;
        ef_exported_heat: number;
        electricity_consumption_value: number;
        ef_electricity: number;
        source_of_ef_electricity: string;
        exported_electricity_value: number;
        ef_exported_electricity: number;
        produced_for_market_amount: number;
        imported_wgases_amount: number;
        ef_imported_wgases: number;
        exported_wgases_amount: number;
        ef_exported_wgases: number;
        industry_type: string;
        total_production_amounts: number;
    };
    onChange: (formValues: GoodsFormProps["formValues"]) => void;
    onNextStep: () => void;
}

const GoodsForm: React.FC<GoodsFormProps> = ({
    formValues,
    onChange,
    onNextStep,
}) => {
    const reportId = 1;

    const [localFormValues, setLocalFormValues] = useState<GoodsFormProps["formValues"]>({
        report_id: formValues.report_id || 0,
        name: formValues.name || "",
        goods_category: formValues.goods_category || "",
        routes: formValues.routes || {},
        amounts: formValues.amounts || {},
        total_consumed_within_installation: formValues.total_consumed_within_installation || 0,
        consumed_in_others_amounts: formValues.consumed_in_others_amounts || 0,
        condumed_non_cbam_goods_amounts: formValues.condumed_non_cbam_goods_amounts || 0,
        has_heat: formValues.has_heat || 0,
        has_waste_gases: formValues.has_waste_gases || 0,
        direct_emissions: formValues.direct_emissions || 0,
        imported_heat_value: formValues.imported_heat_value || 0,
        exported_heat_value: formValues.exported_heat_value || 0,
        ef_imported_heat: formValues.ef_imported_heat || 0,
        ef_exported_heat: formValues.ef_exported_heat || 0,
        electricity_consumption_value: formValues.electricity_consumption_value || 0,
        ef_electricity: formValues.ef_electricity || 0,
        source_of_ef_electricity: formValues.source_of_ef_electricity || "",
        exported_electricity_value: formValues.exported_electricity_value || 0,
        ef_exported_electricity: formValues.ef_exported_electricity || 0,
        produced_for_market_amount: formValues.produced_for_market_amount || 0,
        imported_wgases_amount: formValues.imported_wgases_amount || 0,
        ef_imported_wgases: formValues.ef_imported_wgases || 0,
        exported_wgases_amount: formValues.exported_wgases_amount || 0,
        ef_exported_wgases: formValues.ef_exported_wgases || 0,
        industry_type: formValues.industry_type || "",
        total_production_amounts: formValues.total_production_amounts || 0,
    });

    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [countries, setCountries] = useState<CountryOption[]>([]);

    const apiUrl = process.env.REACT_APP_API_URL;

    // Load the countries from an API on component mount
    useEffect(() => {
        const loadCountries = async () => {
            const fetched = await fetchCountries();
            setCountries(fetched.countries);
        };
        loadCountries();
    }, []);

    // Load saved data from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem("goodsFormData");
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                setLocalFormValues((prev) => ({
                    ...prev,
                    ...parsedData,
                    // Keeping routes and amounts based on localFormValues priority
                    routes: Object.keys(prev.routes).length > 0 ? prev.routes : (parsedData.routes || {}),
                    amounts: Object.keys(prev.amounts).length > 0 ? prev.amounts : (parsedData.amounts || {}),
                }));
            } catch (error) {
                console.error("Error parsing saved goods form data", error);
            }
        }
    }, []);

    // Save data to localStorage whenever localFormValues change
    useEffect(() => {
        localStorage.setItem("goodsFormData", JSON.stringify(localFormValues));
    }, [localFormValues]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalFormValues((prev) => ({
            ...prev,
            [name]: value
        }));
        setFormErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const requiredFields = [
        "industry_type",
        "goods_category",
        "source_of_ef_electricity",
        "name",
    ];

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const newErrors: { [key: string]: string } = {};
        requiredFields.forEach((field) => {
            if (!localFormValues[field as keyof typeof localFormValues]) {
                newErrors[field] = "กรุณากรอกข้อมูล";
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setFormErrors(newErrors);
            const firstErrorField = Object.keys(newErrors)[0];
            const errorElement = document.getElementsByName(firstErrorField)[0];
            if (errorElement)
                errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        const payload = {
            ...localFormValues,
            industry_type: localFormValues.industry_type || "",
            goods_category: localFormValues.goods_category || "",
            name: localFormValues.name || "",
            amounts: JSON.stringify(localFormValues.amounts),
            routes: JSON.stringify(localFormValues.routes),
            report_id: reportId || "",
        };

        try {
            const response = await fetch(`${apiUrl}/api/cbam/d_goods/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server error: ${errorText}`);
            }

            const data = await response.json();
            localStorage.removeItem("goodsFormData"); // Clear local storage on successful submission
            onChange(localFormValues);
            onNextStep?.();
        } catch (err: any) {
            console.error("❌ POST error:", err.message || err);
            alert(`บันทึกข้อมูลไม่สำเร็จ: ${err.message}`);
        }
    };

    return (
        <Container
            maxWidth="md"
            style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
        >
            <form onSubmit={handleSubmit} noValidate>
                <Grid container spacing={3} alignItems="stretch">
                    <Box>
                        <Typography
                            variant="h5"
                            fontWeight="bold"
                            gutterBottom
                            color="#1976d2"
                        >
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
                            setLocalFormValues((prev) => {
                                const updated = { ...prev, [field]: val };
                                return updated;
                            });
                            setFormErrors((prev) => ({ ...prev, [field]: "" }));
                        }}
                    />
                    <Section2
                        values={{
                            total_production_amounts: String(localFormValues.total_production_amounts ?? ""),
                            consumed_in_others_amounts: String(localFormValues.consumed_in_others_amounts ?? ""),
                            produced_for_market_amount: String(localFormValues.produced_for_market_amount ?? ""),
                            condumed_non_cbam_goods_amounts: String(localFormValues.condumed_non_cbam_goods_amounts ?? ""),
                        }}
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