import React, { useState, useEffect, useCallback } from "react";
import { Container, Grid } from "@mui/material";
import {
  useNavigate,
  useParams,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import Section from "../components/Section";
import PGButton from "../components/FormButton";
import LabeledAutocompleteMap from "../components/LabeledAutoCompleteMap";

interface CNcodeFormProps {
  data: {
    industry_id: string;
    goods_id: string;
    cn_id: string;
  };
  onChange: (data: CNcodeFormProps["data"]) => void;
  onSave?: () => void; // ✅ เพิ่ม onSave callback
  onNextStep: () => void;
}

interface IndustryItem {
  industry_id: number;
  name: string;
}

interface GoodsItem {
  goods_id: number;
  name: string;
}

interface CncodeItem {
  cn_id: number;
  name: string;
  cn_code: string;
  cn_code_name?: string;
}

const SumupForm: React.FC<CNcodeFormProps> = ({
  data,
  onChange,
  onNextStep,
}) => {
  const navigate = useNavigate();
  const { reportId: urlReportId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const companyId = (() => {
    const data = localStorage.getItem("user_account");
    if (!data) return null;
    try {
      const parsed = JSON.parse(data);
      return parsed.company?.[0]?.company_id || null;
    } catch {
      return null;
    }
  })();

  // ✅ เช็ค reportId จากหลายแหล่ง
  const getReportIdFromUrl = () => {
    // 1. จาก URL params เช่น /report/:reportId
    if (urlReportId) {
      return parseInt(urlReportId, 10);
    }

    // 2. จาก query string เช่น ?reportId=123
    const queryReportId = searchParams.get("reportId");
    if (queryReportId) {
      return parseInt(queryReportId, 10);
    }
    return null;
  };

  const reportIdFromUrl = getReportIdFromUrl();
  const isEditMode = !!reportIdFromUrl;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // ✅ เพิ่ม loading state
  const [industryTypes, setIndustryTypes] = useState<IndustryItem[]>([]);
  const [goodsList, setGoodsList] = useState<GoodsItem[]>([]);
  const [cncodeList, setCncodeList] = useState<CncodeItem[]>([]);
  const [selectedCncode, setSelectedCncode] = useState<{
    name: string;
    cn_code: string;
  } | null>(null);
  const [currentReportId, setCurrentReportId] = useState<number | null>(
    reportIdFromUrl
  );
  const [existingReportData, setExistingReportData] = useState<any>(null); // ✅ เก็บข้อมูล report

  // Initialize formValues
  const [formValues, setFormValues] = useState({
    industry_id: data.industry_id || "",
    goods_id: data.goods_id || "",
    cn_id: data.cn_id || "",
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [installationName, setInstallationName] = useState<string>("");
  const apiUrl = process.env.REACT_APP_API_URL;

  // ✅ ฟังก์ชันตรวจสอบและอัปเดต reportId ใน localStorage
  useEffect(() => {
    if (reportIdFromUrl) {
      localStorage.setItem("reportId", String(reportIdFromUrl));
      // } else {
      // ถ้าไม่มี reportId ให้เคลียร์ localStorage
      // localStorage.removeItem("reportId");
    }
  }, [reportIdFromUrl, isEditMode]);

  // Keep formValues in sync with parent
  useEffect(() => {
    onChange(formValues);
  }, [formValues, onChange]);

  // Load industry types
  useEffect(() => {
    const fetchIndustryTypes = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/cbam/industry_types`);
        if (res.ok) {
          const data = await res.json();
          setIndustryTypes(data);
        }
      } catch (err) {
        console.error("❌ Failed to fetch industry types", err);
      }
    };
    fetchIndustryTypes();
  }, [apiUrl]);

  // ✅ Fetch existing report data (ปรับปรุงให้ครอบคลุมมากขึ้น)
  useEffect(() => {
    const fetchExistingReport = async () => {
      if (!reportIdFromUrl) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${apiUrl}/api/cbam/report/${reportIdFromUrl}`);

        if (!res.ok) {
          if (res.status === 404) {
            console.warn(`⚠️ Report ID ${reportIdFromUrl} not found`);

            // ล้าง URL และเปลี่ยนเป็น create mode
            navigate("/cbam/formdev", { replace: true });
            return;
          }
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const dataArr = await res.json();
        if (!Array.isArray(dataArr) || dataArr.length === 0) {
          console.warn("⚠️ Empty report data received");
          setIsLoading(false);
          return;
        }

        const report = dataArr[0];

        // ✅ เก็บข้อมูล report สำหรับใช้งาน
        setExistingReportData(report);

        // อัปเดต form values ด้วยข้อมูลที่มีอยู่
        const existingData = {
          industry_id: String(report.industry_type_id || ""),
          goods_id: String(report.goods_id || ""),
          cn_id: String(report.cn_id || ""),
        };

        setFormValues(existingData);
        setInstallationName(report.installation_name?.trim() || "");
        setCurrentReportId(reportIdFromUrl);
      } catch (err: any) {
        console.error("❌ Error loading existing report:", err);
        // ในกรณีเกิดข้อผิดพลาด ให้เปลี่ยนเป็น create mode
        navigate("/cbam/formdev", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingReport();
  }, [reportIdFromUrl, apiUrl, navigate]);

  // Fetch goods list when industry changes
  useEffect(() => {
    const fetchGoods = async () => {
      if (!formValues.industry_id) {
        setGoodsList([]);
        return;
      }
      try {
        const res = await fetch(
          `${apiUrl}/api/cbam/goods/${formValues.industry_id}`
        );
        if (res.ok) {
          const data = await res.json();
          setGoodsList(data);
        }
      } catch (err) {
        console.error("❌ Failed to fetch goods list", err);
        setGoodsList([]);
      }
    };
    fetchGoods();
  }, [formValues.industry_id, apiUrl]);

  // Fetch CN codes when goods selection changes
  useEffect(() => {
    const fetchCncodes = async () => {
      if (!formValues.goods_id) {
        setCncodeList([]);
        return;
      }
      try {
        const res = await fetch(
          `${apiUrl}/api/cbam/cncodes/${formValues.goods_id}`
        );
        if (res.ok) {
          const data = await res.json();
          setCncodeList(data);
        }
      } catch (err) {
        console.error("❌ Failed to fetch CN codes", err);
        setCncodeList([]);
      }
    };
    fetchCncodes();
  }, [formValues.goods_id, apiUrl]);

  // Update selected CN Code details when cn_id changes
  useEffect(() => {
    if (!formValues.cn_id || cncodeList.length === 0) {
      setSelectedCncode(null);
      return;
    }
    const selected = cncodeList.find(
      (item) => String(item.cn_id) === String(formValues.cn_id)
    );
    if (selected) {
      setSelectedCncode({
        name: selected.cn_code_name || selected.name,
        cn_code: selected.cn_code,
      });
    }
  }, [formValues.cn_id, cncodeList]);

  // Handle input changes
  const handleInputChange = (name: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
      // รีเซ็ตค่าที่ขึ้นอยู่กับ dropdown ที่เปลี่ยน
      ...(name === "industry_id" && { goods_id: "", cn_id: "" }),
      ...(name === "goods_id" && { cn_id: "" }),
    }));

    // ลบ error message
    setFormErrors((prev) => ({ ...prev, [name]: "" }));

    // รีเซ็ต dropdown lists
    if (name === "industry_id") {
      setGoodsList([]);
      setCncodeList([]);
      setSelectedCncode(null);
    } else if (name === "goods_id") {
      setCncodeList([]);
      setSelectedCncode(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Form validation
    const errors: { [key: string]: string } = {};
    if (!formValues.industry_id)
      errors.industry_id = "Please select industry type";
    if (!formValues.goods_id) errors.goods_id = "Please select goods";
    if (!formValues.cn_id) errors.cn_id = "Please select CN code";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      industry_type_id: Number(formValues.industry_id),
      goods_id: Number(formValues.goods_id),
      cn_id: Number(formValues.cn_id),
      company_id: companyId,
      ...(existingReportData && {
        reporting_period_start: new Date(
          existingReportData.reporting_period_start
        )
          .toISOString()
          .split("T")[0],
        reporting_period_end: new Date(existingReportData.reporting_period_end)
          .toISOString()
          .split("T")[0],
      }),
    };

    setIsSubmitting(true);

    try {
      let result;
      let finalReportId;

      if (isEditMode && currentReportId) {
        // === EDIT MODE: อัปเดตข้อมูลที่มีอยู่ ===

        const res = await fetch(
          `${apiUrl}/api/cbam/report/${currentReportId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Update failed (${res.status}): ${errorText}`);
        }

        result = await res.json();
        finalReportId = currentReportId;
      } else {
        // === CREATE MODE: สร้างรายงานใหม่ ===

        const res = await fetch(`${apiUrl}/api/cbam/report`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Create failed (${res.status}): ${errorText}`);
        }

        result = await res.json();
        finalReportId = result.id;

        if (finalReportId) {
          setCurrentReportId(finalReportId);

          // ✅ อัปเดต URL เป็น edit mode (optional)
          // navigate(`/cbam/formdev?reportId=${finalReportId}`, { replace: true });
        } else {
          console.warn("⚠️ No ID returned from create API");
          throw new Error("No report ID returned from server");
        }
      }

      if (finalReportId) {
        localStorage.setItem("reportId", String(finalReportId));
      }
      onNextStep();
    } catch (error: any) {
      console.error("❌ Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Loading state
  if (isLoading) {
    return (
      <Container
        maxWidth="md"
        style={{ paddingTop: "2rem", textAlign: "center" }}
      >
        <div>🔍 Loading report data...</div>
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
          <Grid size={12}>
            <Section
              defaultExpanded={true}
              title="CN Code Selection"
              subtitle={
                isEditMode
                  ? `Editing Report #${currentReportId}`
                  : "Create New Report - Select CN Code Information"
              }
              hasError={
                !!formErrors.industry_id ||
                !!formErrors.goods_id ||
                !!formErrors.cn_id
              }
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                {/* Installation Name (if available) */}
                {/* {installationName && (
                  <div
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "#e3f2fd",
                      borderRadius: "4px",
                      border: "1px solid #bbdefb",
                    }}
                  >
                    <strong>🏭 Installation:</strong> {installationName}
                  </div>
                )} */}

                {/* Industry Type Selection */}
                <LabeledAutocompleteMap
                  caption="Industry Type"
                  defination="เลือกประเภทอุตสาหกรรม"
                  label="Select industry type"
                  name="industry_id"
                  required
                  options={industryTypes.map((i) => ({
                    label: i.name,
                    value: String(i.industry_id),
                  }))}
                  value={formValues.industry_id}
                  onChange={(val) =>
                    handleInputChange("industry_id", String(val))
                  }
                  error={formErrors.industry_id}
                />

                {/* Goods Selection */}
                <LabeledAutocompleteMap
                  caption="Goods Category"
                  defination="เลือกหมวดผลิตภัณฑ์"
                  label="Select goods category"
                  name="goods_id"
                  required
                  options={goodsList.map((g) => ({
                    label: g.name,
                    value: String(g.goods_id),
                  }))}
                  value={formValues.goods_id}
                  onChange={(val) => handleInputChange("goods_id", String(val))}
                  error={formErrors.goods_id}
                  disabled={!formValues.industry_id}
                />

                {/* CN Code Selection */}
                <LabeledAutocompleteMap
                  caption="CN Code"
                  defination="เลือกรหัส CN Code"
                  label="Select CN Code"
                  name="cn_id"
                  required
                  options={cncodeList.map((c) => ({
                    label: `${c.cn_code} - ${c.cn_code_name || c.name}`,
                    value: String(c.cn_id),
                  }))}
                  value={formValues.cn_id}
                  onChange={(val) => handleInputChange("cn_id", String(val))}
                  error={formErrors.cn_id}
                  disabled={!formValues.goods_id}
                />
              </div>
            </Section>
          </Grid>

          {/* Submit Button */}
          <Grid size={12}>
            <div
              style={{ display: "flex", justifyContent: "center", gap: "1rem" }}
            >
              <PGButton
                text={isSubmitting ? "Saving..." : isEditMode ? "Save" : "Save"}
                loading={isSubmitting}
                type="submit"
              />
            </div>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default SumupForm;
