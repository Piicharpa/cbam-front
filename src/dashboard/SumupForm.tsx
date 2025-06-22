import React, { useState, useEffect } from "react";
import { Container, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Section from "../components/Section";
import PGButton from "../components/FormButton";
import LabeledAutocompleteMap from "../components/LabeledAutoCompleteMap";


interface InstallationFormProps {
  redirectPath?: string;
  onNextStep?: () => void;
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

const SumupForm: React.FC<InstallationFormProps> = ({
  // redirectPath = "/Verifier",
  onNextStep,
}) => {
  const navigate = useNavigate();
const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionType, setActionType] = useState<"save" | "submit">("save");
  const [industryTypes, setIndustryTypes] = useState<IndustryItem[]>([]);
  const [goodsList, setGoodsList] = useState<GoodsItem[]>([]);
  const [cncodeList, setCncodeList] = useState<CncodeItem[]>([]);
  const [selectedCncode, setSelectedCncode] = useState<{
    name: string;
    cn_code: string;
  } | null>(null);

  const [formValues, setFormValues] = useState({
    industry_id: "",
    goods_id: "",
    cn_id: "",
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [reportId, setReportId] = useState<string | null>(null);
  const [installationName, setInstallationName] = useState<string>("");

  const apiUrl = process.env.REACT_APP_API_URL;
  

  // Load industry types
  useEffect(() => {
    const fetchIndustryTypes = async () => {
      try {
        const res = await fetch(
          `${apiUrl}/api/cbam/industry_types`
        );
        const data = await res.json();
        setIndustryTypes(data);
      } catch (err) {
        console.error("Failed to fetch industry types", err);
      }
    };
    fetchIndustryTypes();
  }, []);



  // Submit handler
  
     const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ป้องกันการกดส่งซ้ำ
    if (isSubmitting) return;
    
    const requiredFields = ["industry_id", "goods_id", "cn_id"];
    const newErrors: { [key: string]: string } = {};
    
    requiredFields.forEach((field) => {
      if (!formValues[field as keyof typeof formValues]) {
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
      industry_type_id: Number(formValues.industry_id),
      goods_id: Number(formValues.goods_id),
      cn_id: Number(formValues.cn_id),
      company_id: 1,
    };

    if (isNaN(payload.cn_id)) {
      alert("CN Code ไม่ถูกต้อง");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${apiUrl}/api/cbam/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      
      const responseData = await res.json();
      const newReportId = responseData.id;
      
      setReportId(String(newReportId));
      localStorage.setItem("reportId", String(newReportId));
     

      // ทำการบันทึกข้อมูลอื่นๆ เพิ่มเติมที่เกี่ยวข้องกับการเลือกสินค้า
      // เช่น บันทึก industry_type และ goods_id ไว้ใน localStorage
      localStorage.setItem("selectedIndustry", formValues.industry_id);
      localStorage.setItem("selectedGoods", formValues.goods_id);
      localStorage.setItem("selectedCnCode", formValues.cn_id);
      
      // แสดง alert เมื่อบันทึกสำเร็จ
      alert(`✅ บันทึกสำเร็จ! Report ID: ${newReportId}`);
      
      // เรียกใช้ onNextStep เพื่อไปยังขั้นตอนต่อไป
      if (onNextStep) {
        onNextStep();
      }

    } catch (error: any) {
      console.error("Failed to submit report:", error);
      alert(`เกิดข้อผิดพลาดในการส่งข้อมูล: ${error.message || "โปรดลองอีกครั้ง"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch report details after POST
  useEffect(() => {
    if (!reportId) return;

    const fetchReport = async () => {
      try {
        const res = await fetch(
          `${apiUrl}/api/cbam/report/${reportId}`
        );
        if (!res.ok) {
          throw new Error(
            `Error fetching report ${reportId}: ${res.statusText}`
          );
        }
        const dataArr = await res.json();
        if (!Array.isArray(dataArr) || dataArr.length === 0) {
          throw new Error("No data found");
        }

        const data = dataArr[0];
        setFormValues({
          industry_id: String(data.industry_type_id || ""),
          goods_id: String(data.goods_id || ""),
          cn_id: String(data.cn_id || ""),
        });

        setInstallationName(data.installation_name?.trim() || "");

        // Fetch goods list for dropdown
        const goodsRes = await fetch(
          `${apiUrl}/api/cbam/goods/${data.industry_type_id}`
        );
        const goodsData = await goodsRes.json();
        setGoodsList(goodsData);

        // Fetch cncode list for dropdown
        const cnRes = await fetch(
          `${apiUrl}/api/cbam/cncodes/${data.goods_id}`
        );
        const cnData = await cnRes.json();
        setCncodeList(cnData);
      } catch (error) {
        console.error(error);
        alert("เกิดข้อผิดพลาดในการโหลดข้อมูลรายงาน");
      }
    };

    fetchReport();
  }, [reportId]);

  // Sync selectedCncode after cncodeList loaded
  useEffect(() => {
    if (!formValues.cn_id || cncodeList.length === 0) return;
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

  return (
    <Container
      maxWidth="md"
      style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
    >
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Section
            defaultExpanded={true}
            title="Installation form"
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
              {installationName && (
                <div>
                  <strong>Installation Name:</strong> {installationName}
                </div>
              )}

              {/* Industry Type */}
              <LabeledAutocompleteMap
                caption="Industry Type"
                defination="ประเภทอุตสาหกรรม"
                label="Pls choose Industry"
                name="industry_id"
                options={industryTypes.map((item) => ({
                  label: item.name,
                  value: String(item.industry_id),
                }))}
                value={formValues.industry_id}
                onChange={async (val) => {
                  setFormValues({
                    industry_id: String(val),
                    goods_id: "",
                    cn_id: "",
                  });
                  setGoodsList([]);
                  setCncodeList([]);
                  setSelectedCncode(null);

                  try {
                    const res = await fetch(
                      `${apiUrl}/api/cbam/goods/${val}`
                    );
                    const data = await res.json();
                    setGoodsList(data);
                  } catch (err) {
                    console.error("Failed to fetch goods list", err);
                  }
                }}
                error={formErrors.industry_id}
              />

              {/* Goods */}
              <LabeledAutocompleteMap
                caption="Goods"
                defination="วัตถุดิบตั้งต้น"
                label="Pls choose Goods"
                name="goods_id"
                options={goodsList.map((item) => ({
                  label: item.name,
                  value: String(item.goods_id),
                }))}
                value={formValues.goods_id}
                onChange={async (val) => {
                  setFormValues((prev) => ({
                    ...prev,
                    goods_id: String(val),
                    cn_id: "",
                  }));
                  setCncodeList([]);
                  setSelectedCncode(null);

                  try {
                    const res = await fetch(
                      `${apiUrl}/api/cbam/cncodes/${val}`
                    );
                    const data = await res.json();
                    setCncodeList(data);
                  } catch (err) {
                    console.error("Failed to fetch cncodes list", err);
                  }
                }}
                error={formErrors.goods_id}
              />

              {/* CN Code */}
              <LabeledAutocompleteMap
                caption="CN Code"
                defination="CN Code"
                label="Pls choose CN Code"
                name="cn_id"
                options={cncodeList.map((item) => ({
                  label: `${item.cn_code} - ${item.cn_code_name || item.name}`,
                  value: String(item.cn_id),
                }))}
                value={formValues.cn_id}
                onChange={(val) => {
                  setFormValues((prev) => ({
                    ...prev,
                    cn_id: String(val),
                  }));

                  const selected = cncodeList.find(
                    (item) => String(item.cn_id) === String(val)
                  );
                  if (selected) {
                    setSelectedCncode({
                      name: selected.cn_code_name || selected.name,
                      cn_code: selected.cn_code,
                    });
                  }
                }}
                error={formErrors.cn_id}
              />

              {/* CN Code Info */}
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
