import React, { useState, useEffect, useCallback } from "react";
import { Container, Grid } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import Section from "../components/Section";
import PGButton from "../components/FormButton";
import LabeledAutocompleteMap from "../components/LabeledAutoCompleteMap";

interface CNcodeFormProps {
  data: {
    // ไม่มี reportId ใน data เพราะจะสร้างใหม่
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

const SumupForm: React.FC<CNcodeFormProps> = ({ 
  data, 
  onChange, 
  onNextStep
}) => {
  const navigate = useNavigate();
  const { reportId: urlReportId } = useParams(); // สำหรับกรณีแก้ไขเท่านั้น
  
  // ตรวจสอบโหมด: ถ้ามี reportId ใน URL = แก้ไข, ไม่มี = สร้างใหม่
  const isEditMode = !!urlReportId;
  const reportIdFromUrl = urlReportId ? parseInt(urlReportId, 10) : null;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [industryTypes, setIndustryTypes] = useState<IndustryItem[]>([]);
  const [goodsList, setGoodsList] = useState<GoodsItem[]>([]);
  const [cncodeList, setCncodeList] = useState<CncodeItem[]>([]);
  const [selectedCncode, setSelectedCncode] = useState<{ name: string; cn_code: string } | null>(null);
  const [currentReportId, setCurrentReportId] = useState<number | null>(reportIdFromUrl);
  
  // Initialize formValues (ไม่มี reportId)
  const [formValues, setFormValues] = useState({
    industry_id: data.industry_id || "",
    goods_id: data.goods_id || "",
    cn_id: data.cn_id || "",
  });
  
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [installationName, setInstallationName] = useState<string>("");
  const apiUrl = process.env.REACT_APP_API_URL;
  
  // Keep formValues in sync with parent (ไม่ส่ง reportId)
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
          console.log(`✅ Loaded ${data.length} industry types`);
        }
      } catch (err) {
        console.error("❌ Failed to fetch industry types", err);
      }
    };
    fetchIndustryTypes();
  }, [apiUrl]);

  // Fetch existing report data (เฉพาะกรณีแก้ไขเท่านั้น)
  useEffect(() => {
    const fetchExistingReport = async () => {
      if (!isEditMode || !reportIdFromUrl) return;
      
      try {
        console.log(`🔍 Fetching existing report data for ID: ${reportIdFromUrl}`);
        const res = await fetch(`${apiUrl}/api/cbam/report/${reportIdFromUrl}`);
        
        if (!res.ok) {
          if (res.status === 404) {
            console.warn(`⚠️ Report ID ${reportIdFromUrl} not found`);
            alert(`Report ID ${reportIdFromUrl} not found. Redirecting to create new report.`);
            navigate('/create-report', { replace: true });
            return;
          }
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const dataArr = await res.json();
        if (!Array.isArray(dataArr) || dataArr.length === 0) {
          console.log(`⚠️ No data found for report ID: ${reportIdFromUrl}`);
          return;
        }
        
        const report = dataArr[0];
        console.log("✅ Found existing report data:", report);
        
        // อัปเดต form values ด้วยข้อมูลที่มีอยู่
        const existingData = {
          industry_id: String(report.industry_type_id || ""),
          goods_id: String(report.goods_id || ""),
          cn_id: String(report.cn_id || ""),
        };
        
        setFormValues(existingData);
        setInstallationName(report.installation_name?.trim() || "");
        setCurrentReportId(reportIdFromUrl);
        
        // เก็บ reportId ลง localStorage เมื่อแก้ไข
        localStorage.setItem("reportId", String(reportIdFromUrl));
        localStorage.setItem("cbam_report_id", String(reportIdFromUrl));
        console.log(`💾 Stored reportId to localStorage: ${reportIdFromUrl}`);
        
      } catch (err) {
        console.error("❌ Error loading existing report:", err);
        // alert(`Error loading report: ${err.message}`);
      }
    };
    
    fetchExistingReport();
  }, [isEditMode, reportIdFromUrl, apiUrl, navigate]);

  // Fetch goods list when industry changes
  useEffect(() => {
    const fetchGoods = async () => {
      if (!formValues.industry_id) {
        setGoodsList([]);
        return;
      }
      
      try {
        console.log(`🔍 Fetching goods for industry ID: ${formValues.industry_id}`);
        const res = await fetch(`${apiUrl}/api/cbam/goods/${formValues.industry_id}`);
        if (res.ok) {
          const data = await res.json();
          setGoodsList(data);
          console.log(`✅ Loaded ${data.length} goods items`);
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
        console.log(`🔍 Fetching CN codes for goods ID: ${formValues.goods_id}`);
        const res = await fetch(`${apiUrl}/api/cbam/cncodes/${formValues.goods_id}`);
        if (res.ok) {
          const data = await res.json();
          setCncodeList(data);
          console.log(`✅ Loaded ${data.length} CN codes`);
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
    
    const selected = cncodeList.find(item => String(item.cn_id) === String(formValues.cn_id));
    if (selected) {
      setSelectedCncode({
        name: selected.cn_code_name || selected.name,
        cn_code: selected.cn_code,
      });
      console.log(`✅ Selected CN code:`, selected);
    }
  }, [formValues.cn_id, cncodeList]);

  // Handle input changes
  const handleInputChange = (name: string, value: string) => {
    console.log(`🔄 Changing ${name} to ${value}`);
    
    setFormValues(prev => ({
      ...prev,
      [name]: value,
      // รีเซ็ตค่าที่ขึ้นอยู่กับ dropdown ที่เปลี่ยน
      ...(name === "industry_id" && { goods_id: "", cn_id: "" }),
      ...(name === "goods_id" && { cn_id: "" }),
    }));
    
    // ลบ error message
    setFormErrors(prev => ({ ...prev, [name]: "" }));
    
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
    if (!formValues.industry_id) errors.industry_id = "Please select industry type";
    if (!formValues.goods_id) errors.goods_id = "Please select goods";
    if (!formValues.cn_id) errors.cn_id = "Please select CN code";
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      console.log("❌ Validation errors:", errors);
      return;
    }
    
    const payload = {
      industry_type_id: Number(formValues.industry_id),
      goods_id: Number(formValues.goods_id),
      cn_id: Number(formValues.cn_id),
      company_id: 1, // หรือดึงจาก context/localStorage
    };
    
    setIsSubmitting(true);
    
    try {
      if (isEditMode && currentReportId) {
        // === EDIT MODE: อัปเดตข้อมูลที่มีอยู่ ===
        console.log(`🔄 Updating existing report ID: ${currentReportId}`);
        console.log("Payload:", payload);
        
        const res = await fetch(`${apiUrl}/api/cbam/report/${currentReportId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Update failed (${res.status}): ${errorText}`);
        }
        
        const result = await res.json();
        console.log("✅ Report updated successfully:", result);
        
        // ตรวจสอบว่า reportId ยังคงเป็นค่าเดิมใน localStorage
        localStorage.setItem("reportId", String(currentReportId));
        localStorage.setItem("cbam_report_id", String(currentReportId));
        
        alert(`✅ Report updated successfully! Report ID: ${currentReportId}`);
        
      } else {
        // === CREATE MODE: สร้างรายงานใหม่ ===
        console.log("🆕 Creating new report");
        console.log("Payload:", payload);
        
        const res = await fetch(`${apiUrl}/api/cbam/report`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Create failed (${res.status}): ${errorText}`);
        }
        
        const result = await res.json();
        console.log("✅ New report created successfully:", result);
        
        // เก็บ reportId ใหม่ลง localStorage
        const newReportId = result.id;
        if (newReportId) {
          setCurrentReportId(newReportId);
          localStorage.setItem("reportId", String(newReportId));
          localStorage.setItem("cbam_report_id", String(newReportId));
          console.log(`💾 New reportId stored in localStorage: ${newReportId}`);
          
          alert(`✅ New report created successfully! Report ID: ${newReportId}`);
          
          // อัปเดต URL เพื่อเปลี่ยนเป็น edit mode (optional)
          // navigate(`/edit-report/${newReportId}`, { replace: true });
        } else {
          console.warn("⚠️ No ID returned from create API");
        }
      }
      
      // ไปขั้นตอนถัดไป
      onNextStep();
      
    } catch (error: any) {
      console.error("❌ Form submission error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
      <form onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Section
              defaultExpanded={true}
              title="CN Code Selection"
              subtitle={
                isEditMode 
                  ? `Editing Report #${reportIdFromUrl}` 
                  : "Create New Report - Select CN Code Information"
              }
              hasError={!!formErrors.industry_id || !!formErrors.goods_id || !!formErrors.cn_id}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                
                {/* Installation Name (if available) */}
                {installationName && (
                  <div style={{ 
                    padding: "0.75rem", 
                    backgroundColor: "#e3f2fd", 
                    borderRadius: "4px",
                    border: "1px solid #bbdefb"
                  }}>
                                        <strong>Installation:</strong> {installationName}
                  </div>
                )}
                
                {/* Mode indicator */}
                {isEditMode ? (
                  <div style={{ 
                    color: "#1976d2", 
                    padding: "0.75rem", 
                    backgroundColor: "#f3e5f5", 
                    borderRadius: "4px",
                    border: "1px solid #ce93d8"
                  }}>
                    <strong>🔄 Edit Mode:</strong> You are editing report #{reportIdFromUrl}
                  </div>
                ) : (
                  <div style={{ 
                    color: "#2e7d32", 
                    padding: "0.75rem", 
                    backgroundColor: "#e8f5e8", 
                    borderRadius: "4px",
                    border: "1px solid #a5d6a7"
                  }}>
                    <strong>🆕 Create Mode:</strong> Creating a new report
                  </div>
                )}
                
                {/* Industry Type Selection */}
                <LabeledAutocompleteMap
                  caption="Industry Type"
                  defination="เลือกประเภทอุตสาหกรรม"
                  label="Select industry type"
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
                
                {/* Goods Selection */}
                <LabeledAutocompleteMap
                  caption="Goods Category"
                  defination="เลือกหมวดหมู่สินค้า"
                  label="Select goods category"
                  name="goods_id"
                  required
                  options={goodsList.map(g => ({
                    label: g.name,
                    value: String(g.goods_id),
                  }))}
                  value={formValues.goods_id}
                  onChange={val => handleInputChange("goods_id", String(val))}
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
                  options={cncodeList.map(c => ({
                    label: `${c.cn_code} - ${c.cn_code_name || c.name}`,
                    value: String(c.cn_id),
                  }))}
                  value={formValues.cn_id}
                  onChange={val => handleInputChange("cn_id", String(val))}
                  error={formErrors.cn_id}
                  disabled={!formValues.goods_id}
                />
                
                {/* Selected CN Code Details */}
                {selectedCncode && (
                  <div style={{ 
                    padding: "1rem", 
                    backgroundColor: "#f0f7ff", 
                    borderRadius: "8px",
                    border: "1px solid #2196f3"
                  }}>
                    <div style={{ marginBottom: "0.5rem" }}>
                      <strong>Selected CN Code:</strong> {selectedCncode.cn_code}
                    </div>
                    <div>
                      <strong>Description:</strong> {selectedCncode.name}
                    </div>
                  </div>
                )}
                
                {/* Progress Indicator */}
                <div style={{ 
                  padding: "0.75rem", 
                  backgroundColor: "#fff3e0", 
                  borderRadius: "4px",
                  border: "1px solid #ffcc02",
                  fontSize: "0.9rem"
                }}>
                  <strong>Next Step:</strong> After saving, you'll configure installation details
                </div>
              </div>
            </Section>
          </Grid>
          
          {/* Submit Button */}
          <Grid size={12}>
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
              <PGButton 
                text={isEditMode ? "Update Report" : "Create Report & Continue"} 
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