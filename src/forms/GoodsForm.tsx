import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Box,
  CircularProgress,
} from "@mui/material";
import Section from "../components/Section";
import PGButton from "../components/FormButton";
import {
  fetchCountries,
  CountryOption,
} from "../components/dropdown/contriesmap";
import Section1 from "./formsections/Goods/Goods_sec1";
import Section2 from "./formsections/Goods/Goods_sec2";
import Section3 from "./formsections/Goods/Goods_sec3";

interface GoodsFormProps {
  formValues: {
    report_id: number;
    name: string;
    goods_category: string;
    routes: string[];
    amounts: string[];
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
  const storedReportId = localStorage.getItem("reportId");
  const reportId = storedReportId ? parseInt(storedReportId, 10) : null;
  const apiUrl = process.env.REACT_APP_API_URL;
  const [existingData, setExistingData] = useState<any>(null);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formMode, setFormMode] = useState<"edit" | "create">("create");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Default values for the form
  const getDefaultFormValues = () => ({
    report_id: reportId || 0,
    name: formValues.name || "",
    goods_category: formValues.goods_category || "",
    routes: formValues.routes || [],
    amounts: formValues.amounts || [],
    total_consumed_within_installation:
      formValues.total_consumed_within_installation || 0,
    consumed_in_others_amounts: formValues.consumed_in_others_amounts || 0,
    condumed_non_cbam_goods_amounts:
      formValues.condumed_non_cbam_goods_amounts || 0,
    has_heat: formValues.has_heat || 0,
    has_waste_gases: formValues.has_waste_gases || 0,
    direct_emissions: formValues.direct_emissions || 0,
    imported_heat_value: formValues.imported_heat_value || 0,
    exported_heat_value: formValues.exported_heat_value || 0,
    ef_imported_heat: formValues.ef_imported_heat || 0,
    ef_exported_heat: formValues.ef_exported_heat || 0,
    electricity_consumption_value:
      formValues.electricity_consumption_value || 0,
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

  const [localFormValues, setLocalFormValues] = useState<
    GoodsFormProps["formValues"]
  >(getDefaultFormValues());

  // --- Fetch countries on mount ---
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const result = await fetchCountries();
        setCountries(result.countries);
      } catch (error) {
        console.error("❌ Error loading countries:", error);
      }
    };
    loadCountries();
  }, []);

  // -- Main data loading logic --
  useEffect(() => {
    const loadGoodsData = async () => {
      setIsLoading(true);
      try {
        if (!reportId) {
          setFormMode("create");
          setLocalFormValues(getDefaultFormValues());
          setIsLoading(false);
          return;
        }
        // 1. fetch report data
        const reportRes = await fetch(`${apiUrl}/api/cbam/report/${reportId}`);
        if (!reportRes.ok) throw new Error(`Failed to fetch report`);
        const reportArr = await reportRes.json();
        const report = reportArr[0];
        setExistingData(report);
        if (report && report.goods_id) {
          // 2. fetch goods data (edit mode)
          const goodsRes = await fetch(
            `${apiUrl}/api/cbam/d_goods/${report.goods_id}`
          );
          if (!goodsRes.ok) throw new Error(`Failed to fetch goods`);
          const goodsDataRes = await goodsRes.json();
          const goodsData = Array.isArray(goodsDataRes)
            ? goodsDataRes[0]
            : goodsDataRes;
          const extractedValues = {
            report_id: goodsData.report_id || reportId,
            name: String(goodsData.name || ""),
            goods_category: String(goodsData.goods_category || ""),
            industry_type: String(goodsData.industry_type || ""),
            routes: (() => {
              if (!goodsData.routes) return [];
              try {
                return JSON.parse(goodsData.routes);
              } catch {
                return [];
              }
            })(),
            amounts: (() => {
              if (!goodsData.amounts) return [];
              try {
                return JSON.parse(goodsData.amounts);
              } catch {
                return [];
              }
            })(),
            total_consumed_within_installation: Number(
              goodsData.total_consumed_within_installation ?? 0
            ),
            consumed_in_others_amounts: Number(
              goodsData.consumed_in_others_amounts ?? 0
            ),
            condumed_non_cbam_goods_amounts: Number(
              goodsData.condumed_non_cbam_goods_amounts ?? 0
            ),
            total_production_amounts: Number(
              goodsData.total_production_amounts ?? 0
            ),
            produced_for_market_amount: Number(
              goodsData.produced_for_market_amount ?? 0
            ),
            has_heat:
              goodsData.has_heat === 1 || goodsData.has_heat === "1" ? 1 : 0,
            has_waste_gases:
              goodsData.has_waste_gases === 1 ||
              goodsData.has_waste_gases === "1"
                ? 1
                : 0,
            direct_emissions: Number(goodsData.direct_emissions ?? 0),
            imported_heat_value: Number(goodsData.imported_heat_value ?? 0),
            exported_heat_value: Number(goodsData.exported_heat_value ?? 0),
            ef_imported_heat: Number(goodsData.ef_imported_heat ?? 0),
            ef_exported_heat: Number(goodsData.ef_exported_heat ?? 0),
            electricity_consumption_value: Number(
              goodsData.electricity_consumption_value ?? 0
            ),
            ef_electricity: Number(goodsData.ef_electricity ?? 0),
            source_of_ef_electricity: String(
              goodsData.source_of_ef_electricity ?? ""
            ),
            exported_electricity_value: Number(
              goodsData.exported_electricity_value ?? 0
            ),
            ef_exported_electricity: Number(
              goodsData.ef_exported_electricity ?? 0
            ),
            imported_wgases_amount: Number(
              goodsData.imported_wgases_amount ?? 0
            ),
            ef_imported_wgases: Number(goodsData.ef_imported_wgases ?? 0),
            exported_wgases_amount: Number(
              goodsData.exported_wgases_amount ?? 0
            ),
            ef_exported_wgases: Number(goodsData.ef_exported_wgases ?? 0),
          };
          setLocalFormValues(extractedValues);
          onChange(extractedValues);
          setFormMode("edit");
        } else {
          setFormMode("create");
          setLocalFormValues(getDefaultFormValues());
          onChange(getDefaultFormValues());
        }
      } catch (error) {
        setFormMode("create");
        setLocalFormValues(getDefaultFormValues());
        onChange(getDefaultFormValues());
      } finally {
        setIsLoading(false);
      }
    };
    loadGoodsData();
    // eslint-disable-next-line
  }, [apiUrl, reportId]);

  // -- Sync local to parent --
  useEffect(() => {
    onChange(localFormValues);
  }, [localFormValues, onChange]);

  // --- handle changes ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };
  const handleSection1Change = (field: string, value: any) => {
    setLocalFormValues((prev) => {
      const updated = { ...prev, [field]: value };
      return updated;
    });
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };
  // -- form validation --
  const requiredFields = [
    "industry_type",
    "goods_category",
    "source_of_ef_electricity",
    "name",
    "total_production_amounts",
    "consumed_in_others_amounts",
    "produced_for_market_amount",
    "condumed_non_cbam_goods_amounts",
  ];
  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    requiredFields.forEach((field) => {
      const value = localFormValues[field as keyof typeof localFormValues];
      if (!value && value !== 0)
        errors[field] = `${field.replace(/_/g, " ")} is required`;
    });
    if (
      localFormValues.routes.length === 0 ||
      localFormValues.routes.every((route) => !route)
    ) {
      errors.routes = "At least one route is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  // --- form submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const cleanPayload = {
        report_id: localFormValues.report_id || reportId,
        name: localFormValues.name,
        goods_category: parseInt(localFormValues.goods_category) || 0,
        industry_type: parseInt(localFormValues.industry_type) || 0,
        routes: JSON.stringify(localFormValues.routes || []),
        amounts: JSON.stringify(localFormValues.amounts || []),
        total_consumed_within_installation:
          Number(localFormValues.total_consumed_within_installation) || 0,
        consumed_in_others_amounts:
          Number(localFormValues.consumed_in_others_amounts) || 0,
        condumed_non_cbam_goods_amounts:
          Number(localFormValues.condumed_non_cbam_goods_amounts) || 0,
        has_heat: localFormValues.has_heat ? 1 : 0,
        has_waste_gases: localFormValues.has_waste_gases ? 1 : 0,
        direct_emissions: Number(localFormValues.direct_emissions) || 0,
        imported_heat_value: Number(localFormValues.imported_heat_value) || 0,
        exported_heat_value: Number(localFormValues.exported_heat_value) || 0,
        ef_imported_heat: Number(localFormValues.ef_imported_heat) || 0,
        ef_exported_heat: Number(localFormValues.ef_exported_heat) || 0,
        electricity_consumption_value:
          Number(localFormValues.electricity_consumption_value) || 0,
        ef_electricity: Number(localFormValues.ef_electricity) || 0,
        source_of_ef_electricity: localFormValues.source_of_ef_electricity,
        exported_electricity_value:
          Number(localFormValues.exported_electricity_value) || 0,
        ef_exported_electricity:
          Number(localFormValues.ef_exported_electricity) || 0,
        total_production_amounts:
          Number(localFormValues.total_production_amounts) || 0,
        produced_for_market_amount:
          Number(localFormValues.produced_for_market_amount) || 0,
        imported_wgases_amount:
          Number(localFormValues.imported_wgases_amount) || 0,
        ef_imported_wgases: Number(localFormValues.ef_imported_wgases) || 0,
        exported_wgases_amount:
          Number(localFormValues.exported_wgases_amount) || 0,
        ef_exported_wgases: Number(localFormValues.ef_exported_wgases) || 0,
      };
      let response, newGoodsId;
      if (formMode === "edit" && existingData?.goods_id) {
        response = await fetch(
          `${apiUrl}/api/cbam/d_goods/${existingData.goods_id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cleanPayload),
          }
        );
        newGoodsId = existingData.goods_id;
      } else {
        response = await fetch(`${apiUrl}/api/cbam/d_goods`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cleanPayload),
        });
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Server error saving goods data: ${JSON.stringify(errorData)}`
        );
      }
      const result = await response.json();
      if (formMode !== "edit") newGoodsId = result.id;

      // Update report with goods_id if needed
      if (reportId && newGoodsId) {
        await fetch(`${apiUrl}/api/cbam/report/${reportId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ goods_id: newGoodsId }),
        });
      }
      onNextStep();
    } catch (error: any) {
      setFormErrors((prev) => ({
        ...prev,
        submit: error.message || "Failed to save goods data",
      }));
      alert("Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Container
        maxWidth="md"
        style={{ paddingTop: "2rem", textAlign: "center" }}
      >
        <CircularProgress />
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Loading goods data...
        </Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="md"
      style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
    >
      <form onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          {/* Header Section */}
          <Grid size={12}>
            <Typography
              variant="h5"
              fontSize="32px"
              fontWeight="bold"
              gutterBottom
              color="#1976d2"
            >
              Aggregated goods categories and relevant production processes
            </Typography>
            <Typography
              variant="subtitle1"
              fontSize="22px"
              color="text.secondary"
              gutterBottom
            >
              รายละเอียดของกลุ่มสินค้าและกระบวนการผลิต
            </Typography>
          </Grid>
          {/* Show form-level errors */}
          {formErrors.submit && (
            <Grid size={12}>
              <Box
                p={2}
                bgcolor="#ffebee"
                border="1px solid #f44336"
                borderRadius={1}
                mb={2}
              >
                <Typography color="error" variant="body2">
                  {formErrors.submit}
                </Typography>
              </Box>
            </Grid>
          )}
          {/* Section 1 - Industry Type, Goods Category, Routes */}
          <Grid size={12}>
            <Section1
              values={localFormValues}
              errors={formErrors}
              onChange={handleSection1Change}
            />
          </Grid>
          {/* Section 2 - Production Amounts */}
          <Grid size={12}>
            <Section2
              values={{
                total_production_amounts: String(
                  localFormValues.total_production_amounts ?? ""
                ),
                consumed_in_others_amounts: String(
                  localFormValues.consumed_in_others_amounts ?? ""
                ),
                produced_for_market_amount: String(
                  localFormValues.produced_for_market_amount ?? ""
                ),
                condumed_non_cbam_goods_amounts: String(
                  localFormValues.condumed_non_cbam_goods_amounts ?? ""
                ),
              }}
              errors={formErrors}
              onChange={handleInputChange}
            />
          </Grid>
          {/* Section 3 - Heat, Electricity, Waste Gases */}
          <Grid size={12}>
            <Section3
              values={localFormValues}
              errors={formErrors}
              onChange={handleInputChange}
              setValues={setLocalFormValues}
              countries={countries}
            />
          </Grid>
          {/* Form submission button */}
          <Grid size={12}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={3}
            >
              <Box ml="auto">
                <PGButton
                  text={
                    isSubmitting
                      ? "Saving..."
                      : formMode === "edit"
                      ? "Save"
                      : "Save"
                  }
                  loading={isSubmitting}
                  type="submit"
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default GoodsForm;
