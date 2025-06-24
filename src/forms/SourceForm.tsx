import React, { useState, useEffect } from "react";
import { Container, Typography, Grid, Box } from "@mui/material";
import { useNavigate, useLocation, redirect } from "react-router-dom";
import Section from "../components/Section";
import PGButton from "../components/FormButton";
import Source_sec1, {
  ProcessEmissionSection,
} from "./formsections/Source/Source_sec1";
import Source_sec2 from "./formsections/Source/Source_sec2";
import Report from "../pages/Report";

// เพิ่ม interface สำหรับ props
interface SourceFormProps {
  formValues: {
    p_method?: string;
    p_source_stream_name?: string;
    p_activity_data?: string;
    p_ad_unit?: string;
    p_net_calorific_value?: string;
    p_ncv_unit?: string;
    p_emission_factor?: string;
    p_ef_unit?: string;
    p_oxidation_factor?: string;
    p_biomass_content?: string;
    p_co2e_fossil?: string;
    p_co2e_bio?: string;
    p_energy_content_fossil?: string;
    p_energy_content_bio?: string;
    generatl_info_on_data_quality?: string;
    justification_for_use_default_values?: string;
    manual_fuel_balance?: string;
    manual_GHG_emissions_balance?: string;
    info_qty_assurance?: string;
  };
  onChange?: (formValues: SourceFormProps["formValues"]) => void;
  onNextStep?: () => void;
}

const SourceForm: React.FC<SourceFormProps> = ({
  formValues: externalFormValues = {},
  onChange,
  onNextStep,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  // const reportId = localStorage.getItem("reportId");
  const reportId = 13;
  const apiUrl = process.env.REACT_APP_API_URL;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State สำหรับ section 1b: Process emissions
  const [processEmissionSections, setProcessEmissionSections] = useState<
    ProcessEmissionSection[]
  >([
    {
      id: Date.now(),
      p_method: externalFormValues.p_method || "",
      p_source_stream_name: externalFormValues.p_source_stream_name || "",
      p_activity_data: externalFormValues.p_activity_data || "",
      p_ad_unit: externalFormValues.p_ad_unit || "",
      p_net_calorific_value: externalFormValues.p_net_calorific_value || "",
      p_ncv_unit: externalFormValues.p_ncv_unit || "",
      p_emission_factor: externalFormValues.p_emission_factor || "",
      p_ef_unit: externalFormValues.p_ef_unit || "",
      p_oxidation_factor: externalFormValues.p_oxidation_factor || "",
      p_biomass_content: externalFormValues.p_biomass_content || "",
      p_co2e_fossil: externalFormValues.p_co2e_fossil || "",
      p_co2e_bio: externalFormValues.p_co2e_bio || "",
      p_energy_content_fossil: externalFormValues.p_energy_content_fossil || "",
      p_energy_content_bio: externalFormValues.p_energy_content_bio || "",
    },
  ]);

  const [formValues, setFormValues] = useState({
    reportId: "",
    manual_fuel_balance: externalFormValues.manual_fuel_balance || "",
    manual_GHG_emissions_balance:
      externalFormValues.manual_GHG_emissions_balance || "",
    generatl_info_on_data_quality:
      externalFormValues.generatl_info_on_data_quality || "",
    justification_for_use_default_values:
      externalFormValues.justification_for_use_default_values || "",
    information_quality_ssurance: externalFormValues.info_qty_assurance || "",
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (externalFormValues) {
      const hasExternalValuesChanged = Object.keys(externalFormValues).some(
        (key) =>
          externalFormValues[key as keyof typeof externalFormValues] !==
          formValues[key as keyof typeof formValues]
      );

      if (hasExternalValuesChanged) {
        setFormValues((existingValues) => ({
          ...existingValues,
          reportId: "",
          manual_fuel_balance:
            externalFormValues.manual_fuel_balance ||
            existingValues.manual_fuel_balance,
          manual_GHG_emissions_balance:
            externalFormValues.manual_GHG_emissions_balance ||
            existingValues.manual_GHG_emissions_balance,
          generatl_info_on_data_quality:
            externalFormValues.generatl_info_on_data_quality ||
            existingValues.generatl_info_on_data_quality,
          justification_for_use_default_values:
            externalFormValues.justification_for_use_default_values ||
            existingValues.justification_for_use_default_values,
          information_quality_ssurance:
            externalFormValues.info_qty_assurance ||
            existingValues.information_quality_ssurance,
        }));

        // อัปเดต processEmissionSections ถ้ามีข้อมูล
        if (
          externalFormValues.p_method ||
          externalFormValues.p_source_stream_name ||
          externalFormValues.p_activity_data
        ) {
          setProcessEmissionSections((prevSections) => [
            {
              ...prevSections[0],
              // p_method: externalFormValues.p_method || prevSections[0].p_method,
              // p_source_stream_name: externalFormValues.p_source_stream_name || prevSections[0].p_source_stream_name,
              p_activity_data:
                externalFormValues.p_activity_data ||
                prevSections[0].p_activity_data,
              // p_ad_unit: externalFormValues.p_ad_unit || prevSections[0].p_ad_unit,
              p_net_calorific_value:
                externalFormValues.p_net_calorific_value ||
                prevSections[0].p_net_calorific_value,
              // p_ncv_unit: externalFormValues.p_ncv_unit || prevSections[0].p_ncv_unit,
              p_emission_factor:
                externalFormValues.p_emission_factor ||
                prevSections[0].p_emission_factor,
              p_ef_unit:
                externalFormValues.p_ef_unit || prevSections[0].p_ef_unit,
              p_oxidation_factor:
                externalFormValues.p_oxidation_factor ||
                prevSections[0].p_oxidation_factor,
              p_biomass_content:
                externalFormValues.p_biomass_content ||
                prevSections[0].p_biomass_content,
              // p_co2e_fossil:  externalFormValues.p_co2e_fossil || prevSections[0].p_co2e_fossil,
              // p_co2e_bio: externalFormValues.p_co2e_bio || prevSections[0].p_co2e_bio,
              // p_energy_content_fossil: externalFormValues.p_energy_content_fossil || prevSections[0].p_energy_content_fossil,
              // p_energy_content_bio: externalFormValues.p_energy_content_bio || prevSections[0].p_energy_content_bio,
            },
            ...prevSections.slice(1),
          ]);
        }
      }
    }
  }, [externalFormValues]);

  // แจ้งเตือนเมื่อไม่มี reportId
  useEffect(() => {
    if (!reportId) {
      console.error(
        "❌ reportId ไม่ถูกส่งมา - ไม่พบใน localStorage หรือ state"
      );
      alert("ไม่พบรหัสรายงาน กรุณากลับไปเลือกรายงานก่อน");
    }
  }, [reportId]);

  // คอยอัปเดต parent component เมื่อข้อมูลเปลี่ยน
  useEffect(() => {
    // ส่งข้อมูลขึ้นไปยัง parent component
    const section = processEmissionSections[0];
    if (onChange) {
      onChange({
        p_method: section.p_method,
        p_source_stream_name: section.p_source_stream_name,
        p_activity_data: section.p_activity_data,
        p_ad_unit: section.p_ad_unit,
        p_net_calorific_value: section.p_net_calorific_value,
        p_ncv_unit: section.p_ncv_unit,
        p_emission_factor: section.p_emission_factor,
        p_ef_unit: section.p_ef_unit,
        p_oxidation_factor: section.p_oxidation_factor,
        p_biomass_content: section.p_biomass_content,
        p_co2e_fossil: section.p_co2e_fossil,
        p_co2e_bio: section.p_co2e_bio,
        p_energy_content_fossil: section.p_energy_content_fossil,
        p_energy_content_bio: section.p_energy_content_bio,
        manual_fuel_balance: formValues.manual_fuel_balance,
        manual_GHG_emissions_balance: formValues.manual_GHG_emissions_balance,
        generatl_info_on_data_quality: formValues.generatl_info_on_data_quality,
        justification_for_use_default_values:
          formValues.justification_for_use_default_values,
        info_qty_assurance: formValues.information_quality_ssurance,
      });
    }
  }, [formValues, processEmissionSections, onChange]);

  // ฟังก์ชั่น validation สำหรับฟอร์ม
  const processRequiredFields = [
    "p_method",
    "p_source_stream_name",
    "p_activity_data",
    "p_ad_unit",
    "p_emission_factor",
    "p_ef_unit",
    "p_oxidation_factor",
  ];

  const formValuesRequiredFields = [
    "manual_fuel_balance",
    "manual_GHG_emissions_balance",
    "generatl_info_on_data_quality",
    "justification_for_use_default_values",
    "information_quality_ssurance",
  ];

  // เพิ่ม process section ใหม่
  const addNewProcessSection = () => {
    setProcessEmissionSections([
      ...processEmissionSections,
      {
        id: Date.now(),
        p_method: "",
        p_source_stream_name: "",
        p_activity_data: "",
        p_ad_unit: "",
        p_net_calorific_value: "",
        p_ncv_unit: "",
        p_emission_factor: "",
        p_ef_unit: "",
        p_oxidation_factor: "",
        p_biomass_content: "",
        p_co2e_fossil: "",
        p_co2e_bio: "",
        p_energy_content_fossil: "",
        p_energy_content_bio: "",
      },
    ]);
  };

  // ลบ process section
  const removeProcessSection = (idToRemove: number) => {
    if (processEmissionSections.length <= 1) return;
    setProcessEmissionSections(
      processEmissionSections.filter((section) => section.id !== idToRemove)
    );
  };

  // อัปเดต input ใน process section
  const handleProcessInputChange = (
    id: number,
    field: string,
    value: string
  ) => {
    setProcessEmissionSections((prevSections) => {
      const updatedSections = prevSections.map((section) => {
        if (section.id !== id) return section;
        const updatedSection = { ...section, [field]: value };
        // คำนวณค่าอัตโนมัติเมื่อข้อมูลที่เกี่ยวข้องเปลี่ยน
        if (
          [
            "p_activity_data",
            "p_net_calorific_value",
            "p_emission_factor",
            "p_oxidation_factor",
            "p_biomass_content",
          ].includes(field)
        ) {
          const ad = parseFloat(updatedSection.p_activity_data) || 0;
          const ncv = parseFloat(updatedSection.p_net_calorific_value) || 0;
          const ef = parseFloat(updatedSection.p_emission_factor) || 0;
          const of = parseFloat(updatedSection.p_oxidation_factor) || 0;
          const bioC = parseFloat(updatedSection.p_biomass_content) || 0;
          if (ad && ncv && ef && of) {
            // คำนวณ CO2e fossil
            updatedSection.p_co2e_fossil = (
              ((ad * ncv * ef) / 1000) *
              (of / 100) *
              ((100 - bioC) / 100)
            ).toFixed(4);
            // คำนวณ CO2e bio
            updatedSection.p_co2e_bio = (
              ((ad * ncv * ef) / 1000) *
              (of / 100) *
              (bioC / 100)
            ).toFixed(4);
          }
          if (ad && ncv) {
            // คำนวณ Energy Content fossil
            updatedSection.p_energy_content_fossil = (
              ((ad * ncv) / 1000) *
              ((100 - bioC) / 100)
            ).toFixed(4);
            // คำนวณ Energy Content bio
            updatedSection.p_energy_content_bio = (
              ((ad * ncv) / 1000) *
              (bioC / 100)
            ).toFixed(4);
          }
        }
        return updatedSection;
      });
      return updatedSections;
    });
    if (formErrors[`p_${id}_${field}`]) {
      setFormErrors((prev) => ({ ...prev, [`p_${id}_${field}`]: "" }));
    }
  };

  // อัปเดต AD Unit ใน process section
  const handleProcessADUnitChange = (id: number, value: string | number) => {
    const stringValue = typeof value === "string" ? value : String(value);
    setProcessEmissionSections(
      processEmissionSections.map((section) =>
        section.id === id
          ? {
              ...section,
              p_ad_unit: stringValue,
              p_ncv_unit:
                stringValue === "t"
                  ? "GJ/t"
                  : stringValue === "1000Nm3"
                  ? "GJ/1000Nm3"
                  : section.p_ncv_unit,
            }
          : section
      )
    );
    if (formErrors[`p_${id}_p_ad_unit`]) {
      setFormErrors((prev) => ({ ...prev, [`p_${id}_p_ad_unit`]: "" }));
    }
  };

  // อัปเดต input ใน form values (สำหรับส่วนอื่นๆ)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));

    // เคลียร์ข้อผิดพลาดเมื่อผู้ใช้แก้ไขข้อมูล
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ป้องกันการ submit ซ้ำ
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (!reportId) {
        alert("❌ ไม่พบรหัสรายงาน (reportId) กรุณากลับไปสร้างรายงานก่อน");
        setIsSubmitting(false);
        return;
    }
    // ตรวจสอบความถูกต้องของข้อมูล
    const newErrors: { [key: string]: string } = {};
    // ตรวจสอบแต่ละ section สำหรับ process
    processEmissionSections.forEach((section) => {
        processRequiredFields.forEach((field) => {
            const fieldValue = section[field as keyof ProcessEmissionSection];
            if (!fieldValue) {
                newErrors[`p_${section.id}_${field}`] = "กรุณากรอกข้อมูล";
            }
        });
    });
    // ตรวจสอบ formValues
    formValuesRequiredFields.forEach((field) => {
        if (!formValues[field as keyof typeof formValues]) {
            newErrors[field] = "กรุณากรอกข้อมูล";
        }
    });
    // ถ้ามีข้อผิดพลาด อัปเดต state และไม่ส่งข้อมูล
    if (Object.keys(newErrors).length > 0) {
        setFormErrors(newErrors);
        // เลื่อนไปยังฟิลด์แรกที่มีข้อผิดพลาด
        const firstErrorField = Object.keys(newErrors)[0];
        const errorElement = document.getElementsByName(firstErrorField)[0];
        if (errorElement) {
            errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        setIsSubmitting(false);
        return;
    }
    try {
        console.log("Sending API requests...");
        // แปลงข้อมูลสำหรับส่งไปยังเซิร์ฟเวอร์
        // 1. ข้อมูล section 1b (Process emissions)
        for (const section of processEmissionSections) {
            const payload = {
                report_id: reportId,
                method: section.p_method,
                source_stream_name: section.p_source_stream_name,
                activity_data: section.p_activity_data,
                AD_Unit: section.p_ad_unit,
                net_calorific_value: section.p_net_calorific_value || null,
                NCV_unit: section.p_ncv_unit,
                ef: section.p_emission_factor,
                ef_unit: section.p_ef_unit,
                oxidation_factor_percentage: section.p_oxidation_factor,
                biomass_content_percentage: section.p_biomass_content || null,
                CO2e_fossil: section.p_co2e_fossil,
                CO2e_bio: section.p_co2e_bio,
                energy_content_fossil: section.p_energy_content_fossil,
                energy_content_bio: section.p_energy_content_bio,
            };
            console.log("Sending process emission data:", payload);
            const response = await fetch(`${apiUrl}/api/cbam/b_emission`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Process emission API error:", errorText);
                throw new Error(
                    `Failed to submit process emissions data: ${errorText}`
                );
            }
        }
        // 2. ข้อมูล section 2 (Installation-level GHG emissions)
        const emissionsDataPayload = {
            report_id: reportId,
            generatl_info_on_data_quality: formValues.generatl_info_on_data_quality,
            justification_for_use_default_values:
                formValues.justification_for_use_default_values,
            manual_fuel_balance: formValues.manual_fuel_balance,
            manual_GHG_emissions_balance: formValues.manual_GHG_emissions_balance,
            info_qty_assurance: formValues.information_quality_ssurance,
        };
        console.log("Sending emissions data:", emissionsDataPayload);
        const emissionsDataResponse = await fetch(
            `${apiUrl}/api/cbam/c_emission`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(emissionsDataPayload),
            }
        );

        if (!emissionsDataResponse.ok) {
            const errorText = await emissionsDataResponse.text();
            console.error("Emissions data API error:", errorText);
            throw new Error(`Failed to submit emissions data: ${errorText}`);
        }
        console.log("All data submitted successfully");
        alert("✅ ส่งข้อมูลสำเร็จ");

        // นำทางไปยังหน้ารายงานหลังจากส่งข้อมูลสำเร็จ
        navigate(`/report?reportId=${reportId}`);
        
        // ไปยังขั้นตอนถัดไป
        localStorage.removeItem("cbam_report_id");
    } catch (error: any) {
        console.error("❌ Form submission error:", error);
        alert(`❌ เกิดข้อผิดพลาด: ${error.message || "โปรดลองใหม่อีกครั้ง"}`);
    } finally {
        setIsSubmitting(false);
    }
};

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <form onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3} alignItems="stretch">
          <Box>
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              color="#1976d2"
            >
              Installation's emission at source stream and emission source level
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              การปล่อยก๊าซเรือนกระจกของสถานประกอบการ
            </Typography>
          </Box>

          {/* SECTION 1: Source stream and emission source */}
          <Section
            title="Source stream and emission source"
            subtitle=""
            defaultExpanded={true}
          >
            <Source_sec1
              processEmissionSections={processEmissionSections}
              formErrors={formErrors}
              handleProcessInputChange={handleProcessInputChange}
              handleProcessADUnitChange={handleProcessADUnitChange}
              removeProcessSection={removeProcessSection}
              addNewProcessSection={addNewProcessSection}
            />
          </Section>

          {/* SECTION 2: Installation-level GHG emissions and energy consumption */}
          <Section
            title="(d) Installation-level GHG emissions and energy consumption"
            subtitle="การปล่อยก๊าซเรือนกระจกและการใช้พลังงานของสถานประกอบการ"
          >
            <Source_sec2
              formValues={formValues}
              formErrors={formErrors}
              handleInputChange={handleInputChange}
              setFormValues={setFormValues}
              setFormErrors={setFormErrors}
            />
          </Section>

          {/* ปุ่มบันทึก */}
          <PGButton />
        </Grid>
      </form>
    </Container>
  );
};

export default SourceForm;
