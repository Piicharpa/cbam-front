import React, {
  forwardRef,
  useState,
  useEffect,
  useImperativeHandle,
  FormEvent,
} from "react";
import { Container, Typography, Grid, Box } from "@mui/material";
import Section from "../components/Section";
import LabeledTextField from "../components/LabeledTextField";
import LabeledAutocompleteMap from "../components/LabeledAutoCompleteMap";
import PGButton from "../components/FormButton";
import { adunits } from "../components/dropdown/adunits";
import { efunits } from "../components/dropdown/efunits";
import { emission } from "../components/dropdown/emission";
import LabeledAutocomplete from "../components/LabeledAutoComplete";
import { generalinfo } from "../components/dropdown/generalinfo";
import { justification } from "../components/dropdown/justification";
import { qualityassurance } from "../components/dropdown/qualityassurance";
import { useNavigate, useLocation } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";

// สำหรับแต่ละ emission section
interface EmissionSection {
  id: number;
  c_method: string;
  c_source_stream_name: string;
  c_activity_data: string;
  c_ad_unit: string;
  c_net_calorific_value: string;
  c_ncv_unit: string;
  c_emission_factor: string;
  c_ef_unit: string;
  c_oxidation_factor: string;
  c_biomass_content: string;
}

// สำหรับแต่ละ process emission section
interface ProcessEmissionSection {
  id: number;
  p_method: string;
  p_source_stream_name: string;
  p_activity_data: string;
  p_ad_unit: string;
  p_net_calorific_value: string;
  p_ncv_unit: string;
  p_emission_factor: string;
  p_ef_unit: string;
  p_oxidation_factor: string;
  p_biomass_content: string;
  p_co2e_fossil: string;
  p_co2e_bio: string;
  p_energy_content_fossil: string;
  p_energy_content_bio: string;
}

// สำหรับแต่ละ mass balance section
interface MassBalanceSection {
  id: number;
  m_method: string;
  m_source_stream_name: string;
  m_activity_data: string;
  m_ad_unit: string;
  m_net_calorific_value: string;
  m_ncv_unit: string;
  m_carbon_content: string;
  m_biomass_content: string;
  m_co2e_fossil: string;
  m_co2e_bio: string;
  m_energy_content_fossil: string;
  m_energy_content_bio: string;
}

// Proper type for the ref
type SourceFormRef = {
  submit: () => Promise<boolean>;
};

const SourceForm = forwardRef<SourceFormRef>((props, ref) => {
  // State สำหรับ section 1a: Specific embedded emissions
  const [emissionSections, setEmissionSections] = useState<EmissionSection[]>([
    {
      id: Date.now(),
      c_method: "",
      c_source_stream_name: "",
      c_activity_data: "",
      c_ad_unit: "",
      c_net_calorific_value: "",
      c_ncv_unit: "",
      c_emission_factor: "",
      c_ef_unit: "",
      c_oxidation_factor: "",
      c_biomass_content: "",
    }
  ]);
  
  // State สำหรับ section 1b: Process emissions
  const [processEmissionSections, setProcessEmissionSections] = useState<ProcessEmissionSection[]>([
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
    }
  ]);
  
  // State สำหรับ section 1c: Mass Balance
  const [massBalanceSections, setMassBalanceSections] = useState<MassBalanceSection[]>([
    {
      id: Date.now(),
      m_method: "",
      m_source_stream_name: "",
      m_activity_data: "",
      m_ad_unit: "",
      m_net_calorific_value: "",
      m_ncv_unit: "",
      m_carbon_content: "",
      m_biomass_content: "",
      m_co2e_fossil: "",
      m_co2e_bio: "",
      m_energy_content_fossil: "",
      m_energy_content_bio: "",
    }
  ]);
  
  // State สำหรับส่วนอื่นๆ
  const [formValues, setFormValues] = useState({
    report_id: "",
    manual_total_indirect_emissions: "",
    manual_fuel_balance: "",
    manual_GHG_emissions_balance: "",
    generatl_info_on_data_quality: "",
    justification_for_use_default_values: "",
    information_quality_ssurance: "",
  });
  
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  
  // -- Section 1a: Specific embedded emissions --
  // เพิ่ม section ใหม่
  const addNewSection = () => {
    setEmissionSections([
      ...emissionSections,
      {
        id: Date.now(),
        c_method: "",
        c_source_stream_name: "",
        c_activity_data: "",
        c_ad_unit: "",
        c_net_calorific_value: "",
        c_ncv_unit: "",
        c_emission_factor: "",
        c_ef_unit: "",
        c_oxidation_factor: "",
        c_biomass_content: "",
      }
    ]);
  };
  
  // ลบ section
  const removeSection = (idToRemove: number) => {
    if (emissionSections.length <= 1) return;
    setEmissionSections(emissionSections.filter(section => section.id !== idToRemove));
  };
  
  // อัปเดต input
  const handleSectionInputChange = (id: number, field: string, value: string) => {
    setEmissionSections(emissionSections.map(section => 
      section.id === id ? { ...section, [field]: value } : section
    ));
    
    if (formErrors[`${id}_${field}`]) {
      setFormErrors(prev => ({ ...prev, [`${id}_${field}`]: "" }));
    }
  };
  
    // อัปเดต AD Unit
  const handleADUnitChange = (id: number, value: string | number) => {
    const stringValue = typeof value === "string" ? value : String(value);
    
    setEmissionSections(emissionSections.map(section => 
      section.id === id ? { 
        ...section, 
        c_ad_unit: stringValue,
        c_ncv_unit: stringValue === "t" ? "GJ/t" : stringValue === "1000Nm3" ? "GJ/1000Nm3" : section.c_ncv_unit,
      } : section
    ));
    
    if (formErrors[`${id}_c_ad_unit`]) {
      setFormErrors(prev => ({ ...prev, [`${id}_c_ad_unit`]: "" }));
    }
  };

  // -- Section 1b: Process emissions --
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
      }
    ]);
  };
  
  // ลบ process section
  const removeProcessSection = (idToRemove: number) => {
    if (processEmissionSections.length <= 1) return;
    setProcessEmissionSections(processEmissionSections.filter(section => section.id !== idToRemove));
  };
  
  // อัปเดต input ใน process section
  const handleProcessInputChange = (id: number, field: string, value: string) => {
    setProcessEmissionSections(prevSections => {
      const updatedSections = prevSections.map(section => {
        if (section.id !== id) return section;
        
        const updatedSection = { ...section, [field]: value };
        
        // คำนวณค่าอัตโนมัติเมื่อข้อมูลที่เกี่ยวข้องเปลี่ยน
        if (['p_activity_data', 'p_net_calorific_value', 'p_emission_factor', 'p_oxidation_factor', 'p_biomass_content'].includes(field)) {
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
      setFormErrors(prev => ({ ...prev, [`p_${id}_${field}`]: "" }));
    }
  };
  
  // อัปเดต AD Unit ใน process section
  const handleProcessADUnitChange = (id: number, value: string | number) => {
    const stringValue = typeof value === "string" ? value : String(value);
    
    setProcessEmissionSections(processEmissionSections.map(section => 
      section.id === id ? { 
        ...section, 
        p_ad_unit: stringValue,
        p_ncv_unit: stringValue === "t" ? "GJ/t" : stringValue === "1000Nm3" ? "GJ/1000Nm3" : section.p_ncv_unit,
      } : section
    ));
    
    if (formErrors[`p_${id}_p_ad_unit`]) {
      setFormErrors(prev => ({ ...prev, [`p_${id}_p_ad_unit`]: "" }));
    }
  };

  // -- Section 1c: Mass Balance --
  // เพิ่ม mass balance section ใหม่
  const addNewMassBalanceSection = () => {
    setMassBalanceSections([
      ...massBalanceSections,
      {
        id: Date.now(),
        m_method: "",
        m_source_stream_name: "",
        m_activity_data: "",
        m_ad_unit: "",
        m_net_calorific_value: "",
        m_ncv_unit: "",
        m_carbon_content: "",
        m_biomass_content: "",
        m_co2e_fossil: "",
        m_co2e_bio: "",
        m_energy_content_fossil: "",
        m_energy_content_bio: "",
      }
    ]);
  };
  
  // ลบ mass balance section
  const removeMassBalanceSection = (idToRemove: number) => {
    if (massBalanceSections.length <= 1) return;
    setMassBalanceSections(massBalanceSections.filter(section => section.id !== idToRemove));
  };
  
  // อัปเดต input ใน mass balance section
    // อัปเดต input ใน mass balance section
  const handleMassBalanceInputChange = (id: number, field: string, value: string) => {
    setMassBalanceSections(prevSections => {
      const updatedSections = prevSections.map(section => {
        if (section.id !== id) return section;
        
        const updatedSection = { ...section, [field]: value };
        
        // คำนวณค่าอัตโนมัติเมื่อข้อมูลที่เกี่ยวข้องเปลี่ยน
        if (['m_activity_data', 'm_net_calorific_value', 'm_carbon_content', 'm_biomass_content'].includes(field)) {
          const ad = parseFloat(updatedSection.m_activity_data) || 0;
          const ncv = parseFloat(updatedSection.m_net_calorific_value) || 0;
          const cc = parseFloat(updatedSection.m_carbon_content) || 0;
          const bioC = parseFloat(updatedSection.m_biomass_content) || 0;
          
          if (ad && cc) {
            // คำนวณ CO2e fossil
            updatedSection.m_co2e_fossil = (
              ad * cc * 3.664 * ((100 - bioC) / 100)
            ).toFixed(4);
            
            // คำนวณ CO2e bio
            updatedSection.m_co2e_bio = (
              ad * cc * 3.664 * (bioC / 100)
            ).toFixed(4);
          }
          
          if (ad && ncv) {
            // คำนวณ Energy Content fossil
            updatedSection.m_energy_content_fossil = (
              ((ad * ncv) / 1000) *
              ((100 - bioC) / 100)
            ).toFixed(4);
            
            // คำนวณ Energy Content bio
            updatedSection.m_energy_content_bio = (
              ((ad * ncv) / 1000) *
              (bioC / 100)
            ).toFixed(4);
          }
        }
        
        return updatedSection;
      });
      
      return updatedSections;
    });
    
    if (formErrors[`m_${id}_${field}`]) {
      setFormErrors(prev => ({ ...prev, [`m_${id}_${field}`]: "" }));
    }
  };
  
  // อัปเดต AD Unit ใน mass balance section
  const handleMassBalanceADUnitChange = (id: number, value: string | number) => {
    const stringValue = typeof value === "string" ? value : String(value);
    
    setMassBalanceSections(massBalanceSections.map(section => 
      section.id === id ? { 
        ...section, 
        m_ad_unit: stringValue,
        m_ncv_unit: stringValue === "t" ? "GJ/t" : stringValue === "1000Nm3" ? "GJ/1000Nm3" : section.m_ncv_unit,
      } : section
    ));
    
    if (formErrors[`m_${id}_m_ad_unit`]) {
      setFormErrors(prev => ({ ...prev, [`m_${id}_m_ad_unit`]: "" }));
    }
  };

  // -- For section 2 --
  // อัปเดต input ใน form values (สำหรับส่วนอื่นๆ)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: "" }));
  };
  
  // อัปเดต autocomplete
  const handleAutocompleteChange = (name: string, value: string) => {
    setFormValues(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: "" }));
  };
  
  // เพื่อให้ parent component สามารถเรียกใช้ submit ได้
  useImperativeHandle(ref, () => ({
    async submit() {
      try {
        await handleSubmit();
        return true;
      } catch (error) {
        return false;
      }
    },
  }));
  
  // ดึง report ID จาก location state
  const location = useLocation();
  const reportId = location.state?.reportId || null;
  
  // ฟังก์ชัน submit form
  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    if (event) {
      event.preventDefault();
    }

    try {
      // แปลงข้อมูลสำหรับส่งไปยังเซิร์ฟเวอร์
      
      // 1. ข้อมูล section 1a (Specific embedded direct emissions)
      for (const section of emissionSections) {
        const payload = {
          report_id: reportId,
          method: section.c_method,
          source_stream_name: section.c_source_stream_name,
          activity_data: section.c_activity_data,
          AD_Unit: section.c_ad_unit,
          net_calorific_value: section.c_net_calorific_value,
          NCV_unit: section.c_ncv_unit,
          ef: section.c_emission_factor,
          ef_unit: section.c_ef_unit,
          oxidation_factor_percentage: section.c_oxidation_factor,
          biomass_content_percentage: section.c_biomass_content,
          section_type: "direct_emissions"
        };
        
        const response = await fetch("http://localhost:5000/api/cbam/b_emission", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
          throw new Error("Failed to submit direct emissions data");
        }
      }
      
      // 2. ข้อมูล section 1b (Process emissions)
      for (const section of processEmissionSections) {
        const payload = {
          report_id: reportId,
          method: section.p_method,
          source_stream_name: section.p_source_stream_name,
          activity_data: section.p_activity_data,
          AD_Unit: section.p_ad_unit,
          net_calorific_value: section.p_net_calorific_value,
          NCV_unit: section.p_ncv_unit,
          ef: section.p_emission_factor,
          ef_unit: section.p_ef_unit,
          oxidation_factor_percentage: section.p_oxidation_factor,
          biomass_content_percentage: section.p_biomass_content,
          CO2e_fossil: section.p_co2e_fossil,
          CO2e_bio: section.p_co2e_bio,
          energy_content_fossil: section.p_energy_content_fossil,
          energy_content_bio: section.p_energy_content_bio,
          section_type: "process_emissions"
        };
        
                const response = await fetch("http://localhost:5000/api/cbam/b_emission", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
          throw new Error("Failed to submit process emissions data");
        }
      }
      
      // 3. ข้อมูล section 1c (Mass Balance)
      for (const section of massBalanceSections) {
        const payload = {
          report_id: reportId,
          method: section.m_method,
          source_stream_name: section.m_source_stream_name,
          activity_data: section.m_activity_data,
          AD_Unit: section.m_ad_unit,
          net_calorific_value: section.m_net_calorific_value,
          NCV_unit: section.m_ncv_unit,
          carbon_content: section.m_carbon_content,
          biomass_content_percentage: section.m_biomass_content,
          CO2e_fossil: section.m_co2e_fossil,
          CO2e_bio: section.m_co2e_bio,
          energy_content_fossil: section.m_energy_content_fossil,
          energy_content_bio: section.m_energy_content_bio,
          section_type: "mass_balance"
        };
        
        const response = await fetch("http://localhost:5000/api/cbam/b_emission", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
          throw new Error("Failed to submit mass balance data");
        }
      }
      
      // 4. ข้อมูล section 2 (Installation-level GHG emissions)
      const emissionsDataPayload = {
        report_id: reportId,
        manual_total_indirect_emissions: formValues.manual_total_indirect_emissions,
        generatl_info_on_data_quality: formValues.generatl_info_on_data_quality,
        justification_for_use_default_values: formValues.justification_for_use_default_values,
        manual_fuel_balance: formValues.manual_fuel_balance,
        manual_GHG_emissions_balance: formValues.manual_GHG_emissions_balance,
      };
      
      const emissionsDataResponse = await fetch("http://localhost:5000/api/cbam/c_emission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emissionsDataPayload),
      });
      
      if (!emissionsDataResponse.ok) {
        throw new Error("Failed to submit emissions data");
      }
      
      alert("✅ ส่งข้อมูลสำเร็จ");
      return true;
    } catch (err: any) {
      alert(`❌ เกิดข้อผิดพลาด: ${err.message}`);
      return false;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <form onSubmit={handleSubmit}>
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
          
          {/* SECTION 1a: Specific embedded emissions */}
          <Section
            title="(a) Specific embedded direct emissions (SEE (direct))"
            subtitle="แหล่งปล่อยก๊าซเรือนกระจก"
            defaultExpanded={true}
          >
            {emissionSections.map((section, index) => (
              <Box 
                key={section.id} 
                mb={4} 
                p={2} 
                sx={{ 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '8px',
                  position: 'relative',
                  backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white'
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                  แหล่งปล่อยมลพิษ #{index + 1}
                </Typography>
                
                {emissionSections.length > 1 && (
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      right: '10px', 
                      top: '10px',
                      cursor: 'pointer',
                      color: 'error.main',
                      '&:hover': {
                        color: 'error.dark'
                      }
                    }}
                    onClick={() => removeSection(section.id)}
                  >
                    <DeleteIcon />
                  </Box>
                )}
               
                <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <LabeledAutocomplete
                      type="text"
                      caption="Method"
                      defination="เลือกวิธีการ"
                      label=""
                      name={`method_${section.id}`}
                      options={emission.map((item) => item.name)}
                      value={section.c_method}
                      onChange={(value: string) => 
                        handleSectionInputChange(section.id, "c_method", value)
                      }
                      error={formErrors[`${section.id}_c_method`]}
                    />
                    <LabeledTextField
                      type="number"
                      caption="Activity Data(AD)"
                      defination="กรอกข้อมูลปริมาณเชื้อเพลิง"
                      label=""
                      name={`activity_data_${section.id}`}
                      value={section.c_activity_data}
                      onChange={(e) => 
                        handleSectionInputChange(section.id, "c_activity_data", e.target.value)
                      }
                      error={formErrors[`${section.id}_c_activity_data`]}
                    />
                    <div style={{ marginBottom: "1.5rem" }}></div>
                    <LabeledTextField
                      type="number"
                      caption="Net calorific value (NCV)"
                      defination="กรอกค่าความร้อนของเชื้อเพลิง"
                      label=""
                      name={`net_calorific_value_${section.id}`}
                      value={section.c_net_calorific_value}
                      onChange={(e) => 
                        handleSectionInputChange(section.id, "c_net_calorific_value", e.target.value)
                      }
                      error={formErrors[`${section.id}_c_net_calorific_value`]}
                    />
                    <LabeledTextField
                      type="number"
                      caption="Oxidation factor"
                      defination="กรอกค่า Oxidation factor"
                      label=""
                      name={`oxidation_factor_${section.id}`}
                      value={section.c_oxidation_factor}
                      onChange={(e) => 
                        handleSectionInputChange(section.id, "c_oxidation_factor", e.target.value)
                      }
                                            error={formErrors[`${section.id}_c_oxidation_factor`]}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <LabeledTextField
                      type="text"
                      caption="Source stream name"
                      defination="กรอกข้อมูลชนิดเชื้อเพลิง"
                      label=""
                      name={`source_stream_name_${section.id}`}
                      value={section.c_source_stream_name}
                      onChange={(e) => 
                        handleSectionInputChange(section.id, "c_source_stream_name", e.target.value)
                      }
                      error={formErrors[`${section.id}_c_source_stream_name`]}
                    />
                    <LabeledAutocompleteMap
                      caption="AD Unit"
                      defination="เลือกหน่วยของปริมาณเชื้อเพลิง"
                      label=""
                      name={`ad_unit_${section.id}`}
                      options={adunits.map((unit) => ({
                        label: unit.name,
                        value: unit.name,
                      }))}
                      value={section.c_ad_unit}
                      error={formErrors[`${section.id}_c_ad_unit`]}
                      onChange={(val: string | number) => handleADUnitChange(section.id, val)}
                    />
                    <LabeledTextField
                      type="text"
                      caption="Net Calorific Value Unit (NCV Unit)"
                      defination="กรอกหน่วยของค่าความร้อนของเชื้อเพลิง"
                      label=""
                      name={`ncv_unit_${section.id}`}
                      value={section.c_ncv_unit}
                      onChange={(e) => 
                        handleSectionInputChange(section.id, "c_ncv_unit", e.target.value)
                      }
                      error={formErrors[`${section.id}_c_ncv_unit`]}
                      readOnly
                    />
                    <LabeledTextField
                      type="number"
                      caption="Biomass content"
                      defination="กรอกปริมาณของ Biomass"
                      label=""
                      name={`biomass_content_${section.id}`}
                      value={section.c_biomass_content}
                      onChange={(e) => 
                        handleSectionInputChange(section.id, "c_biomass_content", e.target.value)
                      }
                      error={formErrors[`${section.id}_c_biomass_content`]}
                    />
                  </div>
                </div>
              </Box>
            ))}
            
            {/* ปุ่มเพิ่มส่วนใหม่ */}
            <Box textAlign="center" mb={2}>
              <button
                type="button"
                style={{
                  backgroundColor: "#0190c3",
                  color: "#fff",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  margin: "0 auto",
                  boxShadow: "0 2px 6px rgba(1, 144, 195, 0.3)",
                  transition: "all 0.2s ease"
                }}
                onClick={addNewSection}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#07b8dd";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(1, 144, 195, 0.4)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#0190c3";
                  e.currentTarget.style.boxShadow = "0 2px 6px rgba(1, 144, 195, 0.3)";
                }}
              >
                <span style={{ marginRight: "8px", fontSize: "20px" }}>+</span> 
                เพิ่มแหล่งปล่อยมลพิษ
              </button>
            </Box>
          </Section>
          
          {/* SECTION 1b: Process emissions */}
          <Section
            title="(b) Process emissions"
            subtitle=""
            defaultExpanded={true}
          >
            {processEmissionSections.map((section, index) => (
              <Box 
                key={section.id} 
                mb={4} 
                p={2} 
                sx={{ 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '8px',
                  position: 'relative',
                  backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white'
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                  Process Emission #{index + 1}
                </Typography>
                
                {processEmissionSections.length > 1 && (
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      right: '10px', 
                      top: '10px',
                      cursor: 'pointer',
                      color: 'error.main',
                      '&:hover': {
                        color: 'error.dark'
                      }
                    }}
                    onClick={() => removeProcessSection(section.id)}
                  >
                    <DeleteIcon />
                  </Box>
                )}
                
                <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <LabeledAutocomplete
                      type="text"
                      caption="Method"
                      defination="เลือกวิธีการ"
                      label=""
                      name={`p_method_${section.id}`}
                      options={emission.map((item) => item.name)}
                      value={section.p_method}
                      onChange={(value: string) => 
                        handleProcessInputChange(section.id, "p_method", value)
                      }
                      error={formErrors[`p_${section.id}_p_method`]}
                    />
                    <LabeledTextField
                      type="number"
                      caption="Activity Data(AD)"
                      defination="กรอกข้อมูลปริมาณเชื้อเพลิง"
                      label=""
                      name={`p_activity_data_${section.id}`}
                      value={section.p_activity_data}
                      onChange={(e) => 
                        handleProcessInputChange(section.id, "p_activity_data", e.target.value)
                      }
                      error={formErrors[`p_${section.id}_p_activity_data`]}
                    />
                    <div style={{ marginBottom: "1.5rem" }}></div>
                                        <LabeledTextField
                      type="number"
                      caption="Net calorific value (NCV)"
                      defination="กรอกค่าความร้อนของเชื้อเพลิง"
                      label=""
                      name={`p_net_calorific_value_${section.id}`}
                      value={section.p_net_calorific_value}
                      onChange={(e) => 
                        handleProcessInputChange(section.id, "p_net_calorific_value", e.target.value)
                      }
                      error={formErrors[`p_${section.id}_p_net_calorific_value`]}
                    />
                    <LabeledTextField
                      type="number"
                      caption="Emission factor (EF)"
                      defination="กรอกค่า Emission factor"
                      label=""
                      name={`p_emission_factor_${section.id}`}
                      value={section.p_emission_factor}
                      onChange={(e) => 
                        handleProcessInputChange(section.id, "p_emission_factor", e.target.value)
                      }
                      error={formErrors[`p_${section.id}_p_emission_factor`]}
                    />
                    <LabeledTextField
                      type="number"
                      caption="Oxidation factor"
                      defination="กรอกค่า Oxidation factor"
                      label=""
                      name={`p_oxidation_factor_${section.id}`}
                      value={section.p_oxidation_factor}
                      onChange={(e) => 
                        handleProcessInputChange(section.id, "p_oxidation_factor", e.target.value)
                      }
                      error={formErrors[`p_${section.id}_p_oxidation_factor`]}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <LabeledTextField
                      type="text"
                      caption="Source stream name"
                      defination="กรอกข้อมูลชนิดเชื้อเพลิง"
                      label=""
                      name={`p_source_stream_name_${section.id}`}
                      value={section.p_source_stream_name}
                      onChange={(e) => 
                        handleProcessInputChange(section.id, "p_source_stream_name", e.target.value)
                      }
                      error={formErrors[`p_${section.id}_p_source_stream_name`]}
                    />
                    <LabeledAutocompleteMap
                      caption="AD Unit"
                      defination="เลือกหน่วยของปริมาณเชื้อเพลิง"
                      label=""
                      name={`p_ad_unit_${section.id}`}
                      options={adunits.map((unit) => ({
                        label: unit.name,
                        value: unit.name,
                      }))}
                      value={section.p_ad_unit}
                      error={formErrors[`p_${section.id}_p_ad_unit`]}
                      onChange={(val: string | number) => handleProcessADUnitChange(section.id, val)}
                    />
                    <LabeledTextField
                      type="text"
                      caption="Net Calorific Value Unit (NCV Unit)"
                      defination="กรอกหน่วยของค่าความร้อนของเชื้อเพลิง"
                      label=""
                      name={`p_ncv_unit_${section.id}`}
                      value={section.p_ncv_unit}
                      onChange={(e) => 
                        handleProcessInputChange(section.id, "p_ncv_unit", e.target.value)
                      }
                      error={formErrors[`p_${section.id}_p_ncv_unit`]}
                      readOnly
                    />
                    <LabeledAutocomplete
                      caption="EF Unit"
                      defination="เลือก หน่วยของค่า Emission factor"
                      label=""
                      name={`p_ef_unit_${section.id}`}
                      options={efunits.map((unit) => unit.name)}
                      value={section.p_ef_unit}
                      error={formErrors[`p_${section.id}_p_ef_unit`]}
                      onChange={(value: string) => 
                        handleProcessInputChange(section.id, "p_ef_unit", value)
                      }
                    />
                    <LabeledTextField
                      type="number"
                      caption="Biomass content"
                      defination="กรอกปริมาณของ Biomass"
                      label=""
                      name={`p_biomass_content_${section.id}`}
                      value={section.p_biomass_content}
                      onChange={(e) => 
                        handleProcessInputChange(section.id, "p_biomass_content", e.target.value)
                      }
                      error={formErrors[`p_${section.id}_p_biomass_content`]}
                    />
                  </div>
                </div>
                
                {/* Display calculated values for process emissions */}
                <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <LabeledTextField
                      type="text"
                      caption="CO2e fossil (t)"
                      defination="ค่า CO2e fossil (t)"
                      label=""
                      name={`p_co2e_fossil_${section.id}`}
                      value={section.p_co2e_fossil}
                      readOnly
                      error={formErrors[`p_${section.id}_p_co2e_fossil`]} onChange={function (e: React.ChangeEvent<HTMLInputElement>): void {
                        throw new Error("Function not implemented.");
                      } }                    />
                    <LabeledTextField
                      type="text"
                      caption="CO2e bio (t)"
                      defination="ค่า CO2e bio (t)"
                      label=""
                      name={`p_co2e_bio_${section.id}`}
                      value={section.p_co2e_bio}
                      readOnly
                      error={formErrors[`p_${section.id}_p_co2e_bio`]} onChange={function (e: React.ChangeEvent<HTMLInputElement>): void {
                        throw new Error("Function not implemented.");
                      } }                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <LabeledTextField
                      type="text"
                      caption="Energy content (fossil), TJ"
                      defination="ค่า Energy content (fossil)"
                      label=""
                      name={`p_energy_content_fossil_${section.id}`}
                      value={section.p_energy_content_fossil}
                      readOnly
                      error={formErrors[`p_${section.id}_p_energy_content_fossil`]} onChange={function (e: React.ChangeEvent<HTMLInputElement>): void {
                        throw new Error("Function not implemented.");
                      } }                    />
                                        <LabeledTextField
                      type="text"
                      caption="Energy content (bio), TJ"
                      defination="ค่า Energy content (bio)"
                      label=""
                      name={`p_energy_content_bio_${section.id}`}
                      value={section.p_energy_content_bio}
                      readOnly
                      error={formErrors[`p_${section.id}_p_energy_content_bio`]} onChange={function (e: React.ChangeEvent<HTMLInputElement>): void {
                        throw new Error("Function not implemented.");
                      } }                    />
                  </div>
                </div>
              </Box>
            ))}
            
            {/* ปุ่มเพิ่มส่วนใหม่สำหรับ Process emissions */}
            <Box textAlign="center" mb={2}>
              <button
                type="button"
                style={{
                  backgroundColor: "#0190c3",
                  color: "#fff",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  margin: "0 auto",
                  boxShadow: "0 2px 6px rgba(1, 144, 195, 0.3)",
                  transition: "all 0.2s ease"
                }}
                onClick={addNewProcessSection}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#07b8dd";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(1, 144, 195, 0.4)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#0190c3";
                  e.currentTarget.style.boxShadow = "0 2px 6px rgba(1, 144, 195, 0.3)";
                }}
              >
                <span style={{ marginRight: "8px", fontSize: "20px" }}>+</span> 
                เพิ่มแหล่งปล่อยมลพิษกระบวนการ
              </button>
            </Box>
          </Section>
          
          {/* SECTION 1c: Mass Balance */}
          <Section
            title="(c) Mass Balance"
            subtitle="แหล่งปล่อยก๊าซเรือนกระจก"
            defaultExpanded={true}
          >
            {massBalanceSections.map((section, index) => (
              <Box 
                key={section.id} 
                mb={4} 
                p={2} 
                sx={{ 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '8px',
                  position: 'relative',
                  backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white'
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                  Mass Balance #{index + 1}
                </Typography>
                
                {massBalanceSections.length > 1 && (
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      right: '10px', 
                      top: '10px',
                      cursor: 'pointer',
                      color: 'error.main',
                      '&:hover': {
                        color: 'error.dark'
                      }
                    }}
                    onClick={() => removeMassBalanceSection(section.id)}
                  >
                    <DeleteIcon />
                  </Box>
                )}
                
                <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <LabeledAutocomplete
                      type="text"
                      caption="Method"
                      defination="เลือกวิธีการ"
                      label=""
                      name={`m_method_${section.id}`}
                      options={emission.map((item) => item.name)}
                      value={section.m_method}
                      onChange={(value: string) => 
                        handleMassBalanceInputChange(section.id, "m_method", value)
                      }
                      error={formErrors[`m_${section.id}_m_method`]}
                    />
                    <LabeledTextField
                      type="number"
                      caption="Activity Data(AD)"
                      defination="กรอกข้อมูลปริมาณเชื้อเพลิง"
                      label=""
                      name={`m_activity_data_${section.id}`}
                      value={section.m_activity_data}
                      onChange={(e) => 
                        handleMassBalanceInputChange(section.id, "m_activity_data", e.target.value)
                      }
                      error={formErrors[`m_${section.id}_m_activity_data`]}
                    />
                    <div style={{ marginBottom: "1.5rem" }}></div>
                    <LabeledTextField
                      type="number"
                      caption="Net calorific value (NCV)"
                      defination="กรอกค่าความร้อนของเชื้อเพลิง"
                      label=""
                      name={`m_net_calorific_value_${section.id}`}
                      value={section.m_net_calorific_value}
                      onChange={(e) => 
                        handleMassBalanceInputChange(section.id, "m_net_calorific_value", e.target.value)
                      }
                      error={formErrors[`m_${section.id}_m_net_calorific_value`]}
                    />
                    <LabeledTextField
                      type="number"
                      caption="Carbon content"
                      defination="กรอกค่า Carbon content"
                      label=""
                      name={`m_carbon_content_${section.id}`}
                      value={section.m_carbon_content}
                      onChange={(e) => 
                        handleMassBalanceInputChange(section.id, "m_carbon_content", e.target.value)
                      }
                      error={formErrors[`m_${section.id}_m_carbon_content`]}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <LabeledTextField
                      type="text"
                      caption="Source stream name"
                      defination="กรอกข้อมูลชนิดเชื้อเพลิง"
                      label=""
                      name={`m_source_stream_name_${section.id}`}
                      value={section.m_source_stream_name}
                      onChange={(e) => 
                        handleMassBalanceInputChange(section.id, "m_source_stream_name", e.target.value)
                      }
                      error={formErrors[`m_${section.id}_m_source_stream_name`]}
                    />
                                        <LabeledAutocompleteMap
                      caption="AD Unit"
                      defination="เลือกหน่วยของปริมาณเชื้อเพลิง"
                      label=""
                      name={`m_ad_unit_${section.id}`}
                      options={adunits.map((unit) => ({
                        label: unit.name,
                        value: unit.name,
                      }))}
                      value={section.m_ad_unit}
                      error={formErrors[`m_${section.id}_m_ad_unit`]}
                      onChange={(val: string | number) => handleMassBalanceADUnitChange(section.id, val)}
                    />
                    <LabeledTextField
                      type="text"
                      caption="Net Calorific Value Unit (NCV Unit)"
                      defination="กรอกหน่วยของค่าความร้อนของเชื้อเพลิง"
                      label=""
                      name={`m_ncv_unit_${section.id}`}
                      value={section.m_ncv_unit}
                      onChange={(e) => 
                        handleMassBalanceInputChange(section.id, "m_ncv_unit", e.target.value)
                      }
                      error={formErrors[`m_${section.id}_m_ncv_unit`]}
                      readOnly
                    />
                    <LabeledTextField
                      type="number"
                      caption="Biomass content"
                      defination="กรอกปริมาณของ Biomass"
                      label=""
                      name={`m_biomass_content_${section.id}`}
                      value={section.m_biomass_content}
                      onChange={(e) => 
                        handleMassBalanceInputChange(section.id, "m_biomass_content", e.target.value)
                      }
                      error={formErrors[`m_${section.id}_m_biomass_content`]}
                    />
                  </div>
                </div>
                
                {/* Display calculated values for mass balance */}
                <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <LabeledTextField
                      type="text"
                      caption="CO2e fossil (t)"
                      defination="ค่า CO2e fossil (t)"
                      label=""
                      name={`m_co2e_fossil_${section.id}`}
                      value={section.m_co2e_fossil}
                      readOnly
                      error={formErrors[`m_${section.id}_m_co2e_fossil`]} onChange={function (e: React.ChangeEvent<HTMLInputElement>): void {
                        throw new Error("Function not implemented.");
                      } }                    />
                    <LabeledTextField
                      type="text"
                      caption="CO2e bio (t)"
                      defination="ค่า CO2e bio (t)"
                      label=""
                      name={`m_co2e_bio_${section.id}`}
                      value={section.m_co2e_bio}
                      readOnly
                      error={formErrors[`m_${section.id}_m_co2e_bio`]} onChange={function (e: React.ChangeEvent<HTMLInputElement>): void {
                        throw new Error("Function not implemented.");
                      } }                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <LabeledTextField
                      type="text"
                      caption="Energy content (fossil), TJ"
                      defination="ค่า Energy content (fossil)"
                      label=""
                      name={`m_energy_content_fossil_${section.id}`}
                      value={section.m_energy_content_fossil}
                      readOnly
                      error={formErrors[`m_${section.id}_m_energy_content_fossil`]} onChange={function (e: React.ChangeEvent<HTMLInputElement>): void {
                        throw new Error("Function not implemented.");
                      } }                    />
                    <LabeledTextField
                      type="text"
                      caption="Energy content (bio), TJ"
                      defination="ค่า Energy content (bio)"
                      label=""
                      name={`m_energy_content_bio_${section.id}`}
                      value={section.m_energy_content_bio}
                      readOnly
                      error={formErrors[`m_${section.id}_m_energy_content_bio`]} onChange={function (e: React.ChangeEvent<HTMLInputElement>): void {
                        throw new Error("Function not implemented.");
                      } }                    />
                  </div>
                </div>
              </Box>
            ))}
            
            {/* ปุ่มเพิ่มส่วนใหม่สำหรับ Mass Balance */}
            <Box textAlign="center" mb={2}>
              <button
                type="button"
                style={{
                  backgroundColor: "#0190c3",
                  color: "#fff",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  margin: "0 auto",
                  boxShadow: "0 2px 6px rgba(1, 144, 195, 0.3)",
                  transition: "all 0.2s ease"
                }}
                onClick={addNewMassBalanceSection}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#07b8dd";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(1, 144, 195, 0.4)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#0190c3";
                  e.currentTarget.style.boxShadow = "0 2px 6px rgba(1, 144, 195, 0.3)";
                }}
              >
                <span style={{ marginRight: "8px", fontSize: "20px" }}>+</span> 
                เพิ่มแหล่งปล่อยมลพิษสมดุลมวล
              </button>
            </Box>
          </Section>
          
          {/* SECTION 2: Installation-level GHG emissions and energy consumption */}
          <Section
            title="(d) Installation-level GHG emissions and energy consumption"
            subtitle="การปล่อยก๊าซเรือนกระจกและการใช้พลังงานของสถานประกอบการ"
            defaultExpanded={true}
          >
            {/* Box1: GHG emissions and energy consumption */}
            <Box mb={3}>
              <div style={{ textAlign: "left", marginBottom: "1.5rem" }}>
                <strong> GHG emissions and energy consumption </strong>
              </div>
              <LabeledTextField
                type="number"
                caption="Fuel balance"
                defination="กรอกปริมาณรวมของการปล่อย Emission ทางอ้อม"
                label=""
                name="manual_fuel_balance"
                value={formValues.manual_fuel_balance}
                onChange={handleInputChange}
                error={formErrors.manual_fuel_balance}
                helperText={formErrors.manual_fuel_balance}
                inputProps={{
                  step: "any",
                  placeholder: "Enter amount",
                  className: "appearance-none",
                }}
              />
              <LabeledTextField
                type="number"
                caption="Greenhouse gas emissions balance & information on data quality"
                defination=""
                label=""
                name="manual_GHG_emissions_balance"
                value={formValues.manual_GHG_emissions_balance}
                onChange={handleInputChange}
                error={formErrors.manual_GHG_emissions_balance}
                helperText={formErrors.manual_GHG_emissions_balance}
                inputProps={{
                  step: "any",
                  placeholder: "Enter amount",
                  className: "appearance-none",
                }}
                readOnly
              />
            </Box>
            
            {/* Box2: Information on the data quality and quality assurance  */}
            <Box mb={3}>
              <div style={{ textAlign: "left", marginBottom: "1.5rem" }}>
                <strong>
                  {" "}
                  Information on the data quality and quality assurance{" "}
                </strong>
              </div>
              <LabeledAutocomplete
                caption="General information on data quality"
                defination="ข้อมูลทั่วไปเกี่ยวกับคุณภาพของข้อมูล"
                label=""
                name="generatl_info_on_data_quality"
                value={formValues.generatl_info_on_data_quality}
                onChange={(value: string) => {
                  setFormValues((prev) => ({
                    ...prev,
                    generatl_info_on_data_quality: value,
                  }));
                  // Clear any errors when the field is updated
                  setFormErrors((prev) => ({
                    ...prev,
                    generatl_info_on_data_quality: "",
                  }));
                }}
                error={formErrors.generatl_info_on_data_quality}
                helperText={formErrors.generatl_info_on_data_quality}
                options={generalinfo.map((item) => item.name)}
              />
              <LabeledAutocomplete
                caption="Justification for use of default values (if relevant)"
                defination="เหตุผลในการใช้ค่าปกติ (ถ้าเกี่ยวข้อง)"
                label=""
                name="justification_for_use_default_values"
                value={formValues.justification_for_use_default_values}
                onChange={(value: string) => {
                  setFormValues((prev) => ({
                    ...prev,
                    justification_for_use_default_values: value,
                  }));
                  // Clear any errors when the field is updated
                  setFormErrors((prev) => ({
                    ...prev,
                    justification_for_use_default_values: "",
                  }));
                }}
                error={formErrors.justification_for_use_default_values}
                helperText={formErrors.justification_for_use_default_values}
                options={justification.map(
                  (item: { name: string }) => item.name
                )}
              />
              <LabeledAutocomplete
                caption="Information on quality assurance"
                defination="ข้อมูลการประกันคุณภาพ "
                label=""
                name="information_quality_ssurance"
                value={formValues.information_quality_ssurance}
                onChange={(value: string) => {
                  setFormValues((prev) => ({
                    ...prev,
                    information_quality_ssurance: value,
                  }));
                  // Clear any errors when the field is updated
                  setFormErrors((prev) => ({
                    ...prev,
                    information_quality_ssurance: "",
                  }));
                }}
                error={formErrors.information_quality_ssurance}
                helperText={formErrors.information_quality_ssurance}
                options={qualityassurance.map((item) => item.name)}
              />
            </Box>
          </Section>
          
          {/* ปุ่มบันทึก */}
          <PGButton />
        </Grid>
      </form>
    </Container>
  );
});

export default SourceForm;