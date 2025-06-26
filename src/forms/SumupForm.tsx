import React, { useState, useEffect, useCallback, useRef } from "react";
import { Container, Grid } from "@mui/material";
import Section from "../components/Section";
import PGButton from "../components/FormButton";
import LabeledAutocompleteMap from "../components/LabeledAutoCompleteMap";
import { useRef as reactUseRef } from "react";
import { useNavigate } from "react-router-dom";

interface CNcodeFormProps {
  data: {
    industry_id: string;
    goods_id: string;
    cn_id: string;
  };
  onChange: (data: CNcodeFormProps["data"]) => void;
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
const SumupForm: React.FC<CNcodeFormProps> = ({ data, onChange, onNextStep }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [industryTypes, setIndustryTypes] = useState<IndustryItem[]>([]);
  const [goodsList, setGoodsList] = useState<GoodsItem[]>([]);
  const [cncodeList, setCncodeList] = useState<CncodeItem[]>([]);
  const [selectedCncode, setSelectedCncode] = useState<{ name: string; cn_code: string } | null>(null);
  const [formValues, setFormValues] = useState(data);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [reportId, setReportId] = useState<string | null>(null);
  const [installationName, setInstallationName] = useState<string>("");
  const reportIdRef = useRef<string | null>(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  // 🔄 Keep formValues in sync with parent
  useEffect(() => {
    onChange(formValues);
  }, [formValues]);

  // 📦 Load industry types once
  useEffect(() => {
    const fetchIndustryTypes = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/cbam/industry_types`);
        if (res.ok) {
          const data = await res.json();
          setIndustryTypes(data);
        }
      } catch (err) {
        console.error("Failed to fetch industry types", err);
      }
    };
    fetchIndustryTypes();
  }, [apiUrl]);

  useEffect(() => {
  const storedId = localStorage.getItem("cbam_report_id");
  if (storedId) {
    setReportId(storedId);
    reportIdRef.current = storedId;
  }
}, []);
  // 🏭 Fetch goods list when industry changes
  useEffect(() => {
    const fetchGoods = async () => {
      if (!formValues.industry_id) return;
      try {
        const res = await fetch(`${apiUrl}/api/cbam/goods/${formValues.industry_id}`);
        if (res.ok) {
          const data = await res.json();
          setGoodsList(data);
        }
      } catch (err) {
        console.error("Failed to fetch goods list", err);
      }
    };
    fetchGoods();
  }, [formValues.industry_id, apiUrl]);

  // 📦 Fetch cncodelist when goods changes
  useEffect(() => {
    const fetchCncodes = async () => {
      if (!formValues.goods_id) return;
      try {
        const res = await fetch(`${apiUrl}/api/cbam/cncodes/${formValues.goods_id}`);
        if (res.ok) {
          const data = await res.json();
          setCncodeList(data);
        }
      } catch (err) {
        console.error("Failed to fetch cn codes", err);
      }
    };
    fetchCncodes();
  }, [formValues.goods_id, apiUrl]);

  // 🔁 Auto-select CN Code details
  useEffect(() => {
    if (!formValues.cn_id || cncodeList.length === 0) return;
    const selected = cncodeList.find(item => String(item.cn_id) === String(formValues.cn_id));
    if (selected) {
      setSelectedCncode({
        name: selected.cn_code_name || selected.name,
        cn_code: selected.cn_code,
      });
    }
  }, [formValues.cn_id, cncodeList]);

  // 📄 Fetch report detail if reportId exists
  useEffect(() => {
    if (!reportId) return;
    const fetchReport = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/cbam/report/${reportId}`);
        if (!res.ok) throw new Error("Error fetching report");
        const dataArr = await res.json();
        if (!Array.isArray(dataArr) || dataArr.length === 0) return;

        const report = dataArr[0];
        const updated = {
          industry_id: String(report.industry_type_id || ""),
          goods_id: String(report.goods_id || ""),
          cn_id: String(report.cn_id || ""),
        };
        setFormValues(updated);
        setInstallationName(report.installation_name?.trim() || "");
      } catch (err) {
        console.error("Error loading report:", err);
      }
    };
    fetchReport();
  }, [reportId, apiUrl]);

  // 📝 Handle select changes
  const handleInputChange = (name: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [name]: value,
      ...(name === "industry_id" && { goods_id: "", cn_id: "" }),
      ...(name === "goods_id" && { cn_id: "" }),
    }));
    setFormErrors(prev => ({ ...prev, [name]: "" }));
    if (name === "industry_id") {
      setGoodsList([]);
      setCncodeList([]);
    } else if (name === "goods_id") {
      setCncodeList([]);
    }
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (isSubmitting) return;

  // validate เหมือนเดิม...

  const payload = {
    industry_type_id: Number(formValues.industry_id),
    goods_id: Number(formValues.goods_id),
    cn_id: Number(formValues.cn_id),
    company_id: 1,
  };

  setIsSubmitting(true);
  try {
    const isUpdate = !!reportIdRef.current;
    const url = isUpdate
      ? `${apiUrl}/api/cbam/report/${reportIdRef.current}`
      : `${apiUrl}/api/cbam/report`;
    const method = isUpdate ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(await res.text());

    const result = await res.json();

    if (!isUpdate) {
      const newId = String(result.id);
      reportIdRef.current = newId;
      setReportId(newId);
      localStorage.setItem("cbam_report_id", newId); // ✅ เก็บไว้เลย
    }

    alert(`✅ บันทึกสำเร็จ! Report ID: ${reportIdRef.current}`);
    onNextStep();
  } catch (error: any) {
    alert(`เกิดข้อผิดพลาด: ${error.message}`);
  } finally {
    setIsSubmitting(false);
  }
  // navigate(`\report?reportId=${reportId}`)
};

  return (
    <Container maxWidth="md" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
      <form onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          <Section
            defaultExpanded={true}
            title="CN Code form"
            hasError={!!formErrors.industry_id || !!formErrors.goods_id || !!formErrors.cn_id}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {installationName && (
                <div><strong>Installation Name:</strong> {installationName}</div>
              )}

              <LabeledAutocompleteMap
                caption="Industry Type"
                defination="ประเภทอุตสาหกรรม"
                label="เลือกประเภทอุตสาหกรรม"
                name="industry_id"
                required
                options={industryTypes.map(i => ({
                  label: i.name,
                  value: String(i.industry_id),
                }))}
                value={formValues.industry_id}
                onChange={val => handleInputChange("industry_id", String(val))}
                error={formErrors.industry_id}
              />

              <LabeledAutocompleteMap
                caption="Goods"
                defination="วัตถุดิบตั้งต้น"
                label="เลือกวัตถุดิบ"
                name="goods_id"
                required
                options={goodsList.map(g => ({
                  label: g.name,
                  value: String(g.goods_id),
                }))}
                value={formValues.goods_id}
                onChange={val => handleInputChange("goods_id", String(val))}
                error={formErrors.goods_id}
              />

              <LabeledAutocompleteMap
                caption="CN Code"
                defination="CN Code"
                label="เลือก CN Code"
                name="cn_id"
                required
                options={cncodeList.map(c => ({
                  label: `${c.cn_code} - ${c.cn_code_name || c.name}`,
                  value: String(c.cn_id),
                }))}
                value={formValues.cn_id}
                onChange={val => handleInputChange("cn_id", String(val))}
                error={formErrors.cn_id}
              />

              {selectedCncode && (
                <div style={{ color: "#1976d2" }}>
                  <strong>CN Code:</strong> {selectedCncode.cn_code} <br />
                  <strong>CN Code Name:</strong> {selectedCncode.name}
                </div>
              )}
            </div>
          </Section>
           <PGButton /> 
        </Grid>
      </form>
    </Container>
  );
};

export default SumupForm;
