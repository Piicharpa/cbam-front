import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import {
  Container,
  Typography,
  Grid,
  Box,
  CircularProgress,
} from "@mui/material";
import PGButton from "../components/FormButton";
import {
  fetchCountries,
  CountryOption,
} from "../components/dropdown/contriesmap";
import Section1 from "./formsections/Goods/Goods_sec1";
import Section2 from "./formsections/Goods/Goods_sec2";
import Section3 from "./formsections/Goods/Goods_sec3";

export interface GoodsFormProps {
  formValues: {
    report_id: number | null;
    name: string;
    goods_category: string;
    routes: string[];
    amounts: string[];
    total_consumed_within_installation: number;
    consumed_in_others_amounts: number;
    condumed_non_cbam_goods_amounts: number;
    control: number;
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
type FormValues = GoodsFormProps["formValues"];

const GoodsForm: React.FC<GoodsFormProps> = ({
  formValues,
  onChange,
  onNextStep,
}) => {
 const user_account = localStorage.getItem("user_account");
const token = user_account ? JSON.parse(user_account).token : null;
  const reportId = Number(localStorage.getItem("reportId"));
  const apiUrl = process.env.REACT_APP_API_URL;
  const [existingData, setExistingData] = useState<any>(null);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formMode, setFormMode] = useState<"edit" | "create">("create");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const methods = useForm({
    defaultValues: {
      amounts: [""], // array ของ amounts
      total_production_amounts: "",
    },
  });

  // Default values for the form - updated to support null report_id
  const getDefaultFormValues = (): FormValues => ({
    report_id: reportId,
    name: formValues.name || "",
    goods_category: formValues.goods_category || "",
    routes: formValues.routes || [],
    amounts: formValues.amounts || [],
    total_consumed_within_installation:
      formValues.total_consumed_within_installation || 1,
    consumed_in_others_amounts: formValues.consumed_in_others_amounts || 0,
    condumed_non_cbam_goods_amounts:
      formValues.condumed_non_cbam_goods_amounts || 0,
    control: formValues.control || 0,
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
    total_production_amounts: formValues.total_production_amounts || 1,
  });

  const [localFormValues, setLocalFormValues] = useState<FormValues>(
    getDefaultFormValues()
  );

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
      const user_account = localStorage.getItem("user_account");
      if (!user_account) {
        return;
      }
     const token = JSON.parse(user_account).token;
  const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ต้องอยู่ใน headers
      };
      setIsLoading(true);
      try {
        if (!reportId) {
          // กรณีไม่มี reportId ให้ใช้ค่าเริ่มต้นว่างเปล่า
          setFormMode("create");
          const defaultEmptyValues = getDefaultFormValues();
          setLocalFormValues(defaultEmptyValues);
          onChange(defaultEmptyValues);
          setIsLoading(false);
          return;
        }

        // 1. fetch report data
        const reportRes = await fetch(`${apiUrl}/api/cbam/report/${reportId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!reportRes.ok) throw new Error(`Failed to fetch report`);

        const reportArr = await reportRes.json();
        const report = reportArr[0];

        setExistingData(report);

        // ตรวจสอบว่ามี goods_id หรือไม่

        if (report && report.d_processes_id) {
          try {
            // กรณีมี goods_id ให้ดึงข้อมูล
            const goodsRes = await fetch(
              `${apiUrl}/api/cbam/d_goods/${report.d_processes_id}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!goodsRes.ok) {
              // ถ้าดึงข้อมูล goods ไม่สำเร็จ (อาจ goods_id ไม่ถูกต้อง) ให้ใช้ค่าว่างเปล่า
              console.error(
                "Failed to fetch goods data:",
                await goodsRes.text()
              );
              setFormMode("create");
              const defaultEmptyValues = getDefaultFormValues();
              setLocalFormValues(defaultEmptyValues);
              onChange(defaultEmptyValues);
              return;
            }

            const goodsDataRes = await goodsRes.json();
            const goodsData = Array.isArray(goodsDataRes)
              ? goodsDataRes[0]
              : goodsDataRes;

            if (!goodsData) {
              // ถ้าไม่มีข้อมูล goods ให้ใช้ค่าว่างเปล่า
              setFormMode("create");
              const defaultEmptyValues = getDefaultFormValues();
              setLocalFormValues(defaultEmptyValues);
              onChange(defaultEmptyValues);
              return;
            }

            // มีข้อมูลถูกต้อง ดึงค่าต่างๆ
            const extractedValues = {
              report_id: goodsData.report_id || reportId,
              name: String(goodsData.name || ""),
              goods_category: String(goodsData.goods_category || ""),
              industry_type: String(report.industry_type_id || ""),
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
              control: Number(goodsData.control ?? 0),
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

            // Clear cached form data since we're loading from API
            localStorage.removeItem("goodsFormData");
            localStorage.removeItem("selectedIndustry");
            localStorage.removeItem("selectedGoods");

            setLocalFormValues(extractedValues);
            onChange(extractedValues);
            setFormMode("edit");
          } catch (error) {
            console.error("Error processing goods data:", error);
            setFormMode("create");
            const defaultEmptyValues = getDefaultFormValues();
            setLocalFormValues(defaultEmptyValues);
            onChange(defaultEmptyValues);
          }
        } else {
          // ไม่มี goods_id ให้ใช้ค่าว่างเปล่า
          setFormMode("create");
          setLocalFormValues({
            ...localFormValues,
            industry_type: String(report.industry_type_id || ""),
          });
          onChange(getDefaultFormValues());
        }
      } catch (error) {
        console.error("Error loading goods data:", error);
        // กรณีเกิดข้อผิดพลาดให้ใช้ค่าว่างเปล่า
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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalFormValues((prev) => {
      const updated = { ...prev, [name]: value };
      onChange(updated); // เรียกตรงนี้เลย
      return updated;
    });
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
    "total_consumed_within_installation",
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

  const handleSubmit = async (data: any) => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // ตรวจสอบว่า report_id มีค่าหรือไม่
      if (!localFormValues.report_id && !reportId) {
        throw new Error("No report ID available. Cannot save goods data.");
      }

      const ensureNumber = (value: any, defaultValue = 0): number => {
        const num = Number(value);
        return isNaN(num) ? defaultValue : num;
      };

      const cleanPayload = {
        report_id: localFormValues.report_id || reportId,
        name: localFormValues.name || "",
        goods_category: ensureNumber(localFormValues.goods_category, 0),
        industry_type: ensureNumber(localFormValues.industry_type, 0),
        routes: JSON.stringify(localFormValues.routes || []),
        amounts: JSON.stringify(localFormValues.amounts || []),
        total_consumed_within_installation: ensureNumber(
          localFormValues.total_consumed_within_installation,
          1
        ),
        consumed_in_others_amounts: ensureNumber(
          localFormValues.consumed_in_others_amounts
        ),
        condumed_non_cbam_goods_amounts: ensureNumber(
          localFormValues.condumed_non_cbam_goods_amounts
        ),
        has_heat: localFormValues.has_heat ? 1 : 0,
        has_waste_gases: localFormValues.has_waste_gases ? 1 : 0,
        direct_emissions: ensureNumber(localFormValues.direct_emissions),
        imported_heat_value: ensureNumber(localFormValues.imported_heat_value),
        exported_heat_value: ensureNumber(localFormValues.exported_heat_value),
        ef_imported_heat: ensureNumber(localFormValues.ef_imported_heat),
        ef_exported_heat: ensureNumber(localFormValues.ef_exported_heat),
        electricity_consumption_value: ensureNumber(
          localFormValues.electricity_consumption_value
        ),
        ef_electricity: ensureNumber(localFormValues.ef_electricity),
        source_of_ef_electricity:
          localFormValues.source_of_ef_electricity || "",
        exported_electricity_value: ensureNumber(
          localFormValues.exported_electricity_value
        ),
        ef_exported_electricity: ensureNumber(
          localFormValues.ef_exported_electricity
        ),
        total_production_amounts: ensureNumber(
          localFormValues.total_production_amounts
        ),
        produced_for_market_amount: ensureNumber(
          localFormValues.produced_for_market_amount
        ),
        imported_wgases_amount: ensureNumber(
          localFormValues.imported_wgases_amount
        ),
        ef_imported_wgases: ensureNumber(localFormValues.ef_imported_wgases),
        exported_wgases_amount: ensureNumber(
          localFormValues.exported_wgases_amount
        ),
        ef_exported_wgases: ensureNumber(localFormValues.ef_exported_wgases),
      };

      let response, newGoodsId;
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ต้องอยู่ใน headers
      };

      if (formMode === "edit" && existingData?.d_processes_id) {
        response = await fetch(
          `${apiUrl}/api/cbam/d_goods/${existingData.d_processes_id}`,
          {
            method: "PUT",
            headers: headers,
            body: JSON.stringify(cleanPayload),
          }
        );
      } else {
        response = await fetch(`${apiUrl}/api/cbam/d_goods`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(cleanPayload),
        });
      }

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Server error response:", errorData);
        throw new Error(`Server error saving goods data: ${errorData}`);
      }

      const result = await response.json();
      if (formMode !== "edit") {
        newGoodsId = result.id;
      }

      localStorage.removeItem("goodsFormData");
      localStorage.removeItem("selectedIndustry");
      localStorage.removeItem("selectedGoods");

      onNextStep();
    } catch (error: any) {
      setFormErrors((prev) => ({
        ...prev,
        submit: "Failed to save goods data",
      }));
      onNextStep();
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
      <form onSubmit={methods.handleSubmit(handleSubmit)} noValidate>
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

          <FormProvider {...methods}>
            {/* Section 1 */}
            <Grid size={12}>
              <Section1
                values={localFormValues}
                errors={formErrors}
                onChange={handleSection1Change}
              />
            </Grid>

            {/* Section 2 */}
            <Grid size={12}>
              <Section2
                values={{
                  total_production_amounts: String(
                    localFormValues.total_production_amounts ?? ""
                  ),
                  total_consumed_within_installation: String(
                    localFormValues.total_consumed_within_installation ?? ""
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
                  control: String(localFormValues.control ?? ""),
                }}
                errors={{
                  ...formErrors,
                  total_consumed_within_installation:
                    formErrors.total_consumed_within_installation || "",
                }}
                onChange={handleInputChange}
              />
            </Grid>

            {/* Section 3 */}
            <Grid size={12}>
              <Section3
                values={localFormValues}
                errors={formErrors}
                onChange={handleInputChange}
                setValues={setLocalFormValues}
                countries={countries}
              />
            </Grid>

            {/* Submit Button */}
            <Grid size={12}>
              <Box display="flex" justifyContent="flex-end" mt={3}>
                <PGButton
                  text={isSubmitting ? "Saving..." : "Save"}
                  loading={isSubmitting}
                  type="submit"
                />
              </Box>
            </Grid>
          </FormProvider>
        </Grid>
      </form>
    </Container>
  );
};

export default GoodsForm;
