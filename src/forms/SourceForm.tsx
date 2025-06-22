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

// Proper type for the ref
type SourceFormRef = {
  submit: () => Promise<boolean>;
};

const SourceForm = forwardRef<SourceFormRef>((props, ref) => {
  const [formValues, setFormValues] = useState({
    report_id: "",
    // Specific embedded 
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
    //Process emissions
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
    //Process emissions
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

    manual_total_indirect_emissions: "",
    manual_fuel_balance: "",
    manual_GHG_emissions_balance: "",
    generatl_info_on_data_quality: "",
    justification_for_use_default_values: "",
    information_quality_ssurance: "",
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Calculate CO2e fossil for process emissions
  const calculateCO2EFossil = () => {
    const ad = parseFloat(formValues.p_activity_data) || 0;
    const ncv = parseFloat(formValues.p_net_calorific_value) || 0;
    const ef = parseFloat(formValues.p_emission_factor) || 0;
    const of = parseFloat(formValues.p_oxidation_factor) || 0;
    const bioC = parseFloat(formValues.p_biomass_content) || 0;

    if (!ad || !ncv || !ef || !of) {
      return 0;
    }

    return (
      ((ad * ncv * ef) / 1000) *
      (of / 100) *
      ((100 - bioC) / 100)
    ).toFixed(4);
  };

  const calculateCO2EBio = () => {
    const ad = parseFloat(formValues.p_activity_data) || 0;
    const ncv = parseFloat(formValues.p_net_calorific_value) || 0;
    const ef = parseFloat(formValues.p_emission_factor) || 0;
    const of = parseFloat(formValues.p_oxidation_factor) || 0;
    const bioC = parseFloat(formValues.p_biomass_content) || 0;

    if (!ad || !ncv || !ef || !of) {
      return 0;
    }

    return (((ad * ncv * ef) / 1000) * (of / 100) * (bioC / 100)).toFixed(4);
  };

  // Calculate Energy Content (fossil) for process emissions
  const calculateEnergyContentFossil = () => {
    const ad = parseFloat(formValues.p_activity_data) || 0;
    const ncv = parseFloat(formValues.p_net_calorific_value) || 0;
    const bioC = parseFloat(formValues.p_biomass_content) || 0;

    if (!ad || !ncv) {
      return 0;
    }

    return (((ad * ncv) / 1000) * ((100 - bioC) / 100)).toFixed(4);
  };

  const calculateEnergyContentBio = () => {
    const ad = parseFloat(formValues.p_activity_data) || 0;
    const ncv = parseFloat(formValues.p_net_calorific_value) || 0;
    const bioC = parseFloat(formValues.p_biomass_content) || 0;

    if (!ad || !ncv) {
      return 0;
    }

    return (((ad * ncv) / 1000) * (bioC / 100)).toFixed(4);
  };

  const calculateMassBalanceCO2EFossil = () => {
    const ad = parseFloat(formValues.m_activity_data) || 0;
    const ncv = parseFloat(formValues.m_net_calorific_value) || 0;
    const cc = parseFloat(formValues.m_carbon_content) || 0;
    const bioC = parseFloat(formValues.m_biomass_content) || 0;

    if (!ad || !ncv || !cc || !bioC) {
      return 0;
    }

    return (ad * cc * 3.664 * ((100 - bioC) / 100)).toFixed(4);
  };

  const calculateMassBalanceCO2EBio = () => {
    const ad = parseFloat(formValues.m_activity_data) || 0;
    const ncv = parseFloat(formValues.m_net_calorific_value) || 0;
    const cc = parseFloat(formValues.m_carbon_content) || 0;
    const bioC = parseFloat(formValues.m_biomass_content) || 0;

    if (!ad || !ncv || !cc || !bioC) {
      return 0;
    }

    return (ad * cc * 3.664 * (bioC / 100)).toFixed(4);
  };

  // Calculate Energy Content (fossil) for process emissions
  const calculateMassBalanceContentFossil = () => {
    const ad = parseFloat(formValues.m_activity_data) || 0;
    const ncv = parseFloat(formValues.m_net_calorific_value) || 0;
    const bioC = parseFloat(formValues.m_biomass_content) || 0;

    if (!ad || !ncv) {
      return 0;
    }

    return (((ad * ncv) / 1000) * ((100 - bioC) / 100)).toFixed(4);
  };

  const calculateMassBalanceContentBio = () => {
    const m_ad = parseFloat(formValues.m_activity_data) || 0;
    const m_ncv = parseFloat(formValues.m_net_calorific_value) || 0;
    const m_bioC = parseFloat(formValues.m_biomass_content) || 0;

    if (!m_ad || !m_ncv) {
      return 0;
    }

    return (((m_ad * m_ncv) / 1000) * (m_bioC / 100)).toFixed(4);
  };

  // Update calculated values when dependencies change
  useEffect(() => {
    setFormValues((prev) => ({
      ...prev,
      p_co2e_fossil: calculateCO2EFossil().toString(),
      p_energy_content_fossil: calculateEnergyContentFossil().toString(),
      p_co2e_bio: calculateCO2EBio().toString(),
      p_energy_content_bio: calculateEnergyContentBio().toLocaleString(),
      m_co2e_fossil: calculateMassBalanceCO2EFossil().toString(),
      m_energy_content_fossil: calculateMassBalanceContentFossil().toString(),
      m_co2e_bio: calculateMassBalanceCO2EBio().toString(),
      m_energy_content_bio: calculateMassBalanceContentBio().toString(),
    }));
  }, [
    formValues.c_method, 
    formValues.c_source_stream_name, 
    formValues.c_activity_data, 
    formValues.c_ad_unit, 
    formValues.c_net_calorific_value, 
    formValues.c_ncv_unit, 
    formValues.c_emission_factor, 
    formValues.c_ef_unit, 
    formValues.c_oxidation_factor, 
    formValues.c_biomass_content, 
    formValues.p_method, 
    formValues.p_source_stream_name, 
    formValues.p_activity_data, 
    formValues.p_ad_unit, 
    formValues.p_net_calorific_value, 
    formValues.p_ncv_unit, 
    formValues.p_emission_factor, 
    formValues.p_ef_unit, 
    formValues.p_oxidation_factor, 
    formValues.p_biomass_content, 
    formValues.p_co2e_fossil, 
    formValues.p_co2e_bio, 
    formValues.p_energy_content_fossil, 
    formValues.p_energy_content_bio, 
    formValues.m_method, 
    formValues.m_source_stream_name, 
    formValues.m_activity_data, 
    formValues.m_ad_unit, 
    formValues.m_net_calorific_value, 
    formValues.m_ncv_unit, 
    formValues.m_carbon_content, 
    formValues.m_biomass_content, 
    formValues.m_co2e_fossil, 
    formValues.m_co2e_bio, 
    formValues.m_energy_content_fossil, 
    formValues.m_energy_content_bio, 
    // formValues.fuel_balance, 
    // formValues.greenhouse_emission, 
    // formValues.general_info, 
    // formValues.justification, 
    formValues.information_quality_ssurance, 
  
  ]);

  const location = useLocation();
  const reportId = location.state?.reportId || null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Fixed handleSubmit function
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cPayload = {
      report_id: reportId,
      method: formValues.c_method,
      source_stream_name: formValues.c_source_stream_name,
      activity_data: formValues.c_activity_data,
      AD_Unit: formValues.c_ad_unit,
      net_calorific_value: formValues.c_net_calorific_value,
      NCV_unit: formValues.c_ncv_unit,
      ef: formValues.c_emission_factor,
      ef_unit: formValues.c_ef_unit,
      oxidation_factor_percentage: formValues.c_oxidation_factor,
      biomass_content_percentage: formValues.c_biomass_content,
    };

    const pPayload = {
      report_id: reportId,
      method: formValues.p_method,
      source_stream_name: formValues.p_source_stream_name,
      activity_data: formValues.p_activity_data,
      AD_Unit: formValues.p_ad_unit,
      net_calorific_value: formValues.p_net_calorific_value,
      NCV_unit: formValues.p_ncv_unit,
      ef: formValues.p_emission_factor,
      ef_unit: formValues.p_ef_unit,
      oxidation_factor_percentage: formValues.p_oxidation_factor,
      biomass_content_percentage: formValues.p_biomass_content,
      CO2e_fossil: formValues.p_co2e_fossil,
      CO2e_bio: formValues.p_co2e_bio,
      energy_content_fossil: formValues.p_energy_content_fossil,
      energy_content_bio: formValues.p_energy_content_bio,
    };

    const mPayload = {
      report_id: reportId,
      method: formValues.m_method,
      source_stream_name: formValues.m_source_stream_name,
      activity_data: formValues.m_activity_data,
      AD_Unit: formValues.m_ad_unit,
      net_calorific_value: formValues.m_net_calorific_value,
      NCV_unit: formValues.m_ncv_unit,
      biomass_content_percentage: formValues.m_biomass_content,
      CO2e_fossil: formValues.m_co2e_fossil,
      CO2e_bio: formValues.m_co2e_bio,
      energy_content_fossil: formValues.m_energy_content_fossil,
      energy_content_bio: formValues.m_energy_content_bio,
    };

    // c_emission_energies
    const cmissionPayload = {
      report_id: reportId,
      manual_total_indirect_emissions: formValues.manual_total_indirect_emissions,
      generatl_info_on_data_quality: formValues.generatl_info_on_data_quality,
      justification_for_use_default_values: formValues.justification_for_use_default_values,
      manual_fuel_balance: formValues.manual_fuel_balance,
      manual_GHG_emissions_balance: formValues.manual_GHG_emissions_balance,
    };
    try {
      const cRes = await fetch("http://localhost:5000/api/cbam/b_emission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cPayload),
      });
      if (!cRes.ok) throw new Error("b_emission POST failed");

      const pRes = await fetch("http://localhost:5000/api/cbam/b_emission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pPayload),
      });
      if (!pRes.ok) throw new Error("b_emission POST failed");

      const mRes = await fetch("http://localhost:5000/api/cbam/b_emission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pPayload),
      });
      if (!mRes.ok) throw new Error("b_emission POST failed");



      const cmisRes = await fetch("http://localhost:5000/api/cbam/c_emission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cmissionPayload),
      });
      if (!cmisRes.ok) throw new Error("c_emission POST failed");

      alert("✅ ส่งข้อมูลสำเร็จ");
    } catch (err: any) {
      alert("❌ เกิดข้อผิดพลาด: " + err.message);
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
          {/* SECTION 1: Specific embedded emissions*/}
          <Section
            title="(a) Source streams and emission sources "
            subtitle="แหล่งปล่อยก๊าซเรือนกระจก"
            defaultExpanded={true}
          >
            {/* Box1: Specific embedded direct emissions */}
            <Box mb={3}>
              <div style={{ textAlign: "left", marginBottom: "1.5rem" }}>
                <strong>
                  {" "}
                  Specific embedded direct emissions (SEE (direct)){" "}
                </strong>
              </div>
              <div
                style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}
              >
                <div style={{ flex: 1 }}>
                  <LabeledAutocomplete
                    type="text"
                    caption="Method"
                    defination="เลือกวิธีกการ"
                    label=""
                    name="c_method"
                    options={emission.map((item) => item.name)}
                    value={formValues.c_method}
                    onChange={(value: string) =>
                      setFormValues((prev) => ({ ...prev, c_method: value }))
                    }
                    error={formErrors.c_method}
                  />
                  <LabeledTextField
                    type="number"
                    caption="Activity Data(AD)"
                    defination="กรอกข้อมูลปริมาณเชื้อเพลิง"
                    label=""
                    name="c_activity_data"
                    value={formValues.c_activity_data}
                    onChange={handleInputChange}
                    error={formErrors.c_activity_data}
                  />
                  <div style={{ marginBottom: "1.5rem" }}></div>
                  <LabeledTextField
                    type="number"
                    caption="Net calorific value (NCV)"
                    defination="กรอกค่าความร้อนของเชื้อเพลิง"
                    label=""
                    name="c_net_calorific_value"
                    value={formValues.c_net_calorific_value}
                    onChange={handleInputChange}
                    error={formErrors.c_net_calorific_value}
                  />
                  <LabeledTextField
                    type="number"
                    caption="Oxidation factor"
                    defination="กรอกค่า Oxidation factor"
                    label=""
                    name="c_oxidation_factor"
                    value={formValues.c_oxidation_factor}
                    onChange={handleInputChange}
                    error={formErrors.c_oxidation_factor}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <LabeledTextField
                    type="text"
                    caption="Source stream name"
                    defination="กรอกข้อมูลชนิดเชื้อเพลิง"
                    label=""
                    name="c_source_stream_name"
                    value={formValues.c_source_stream_name}
                    onChange={handleInputChange}
                    error={formErrors.c_source_stream_name}
                  />
                  <LabeledAutocompleteMap
                    caption="AD Unit"
                    defination="เลือกหน่วยของปริมาณเชื้อเพลิง"
                    label=""
                    name="c_ad_unit"
                    options={adunits.map((unit) => ({
                      label: unit.name,
                      value: unit.name,
                    }))}
                    value={formValues.c_ad_unit}
                    error={formErrors.c_ad_unit}
                    onChange={(val: string | number) => {
                      const value = typeof val === "string" ? val : String(val);
                      setFormValues((prev) => ({
                        ...prev,
                        c_ad_unit: value,
                        c_ncv_unit:
                          value === "t"
                            ? "GJ/t"
                            : value === "1000Nm3"
                              ? "GJ/1000Nm3"
                              : prev.c_ncv_unit,
                      }));
                      // Clear the error for c_ad_unit
                      setFormErrors((prev) => ({ ...prev, c_ad_unit: "" }));
                    }}
                  />
                  <LabeledTextField
                    type="text"
                    caption="Net Calorific Value Unit (NCV Unit)"
                    defination="กรอกหน่วยของค่าความร้อนของเชื้อเพลิง"
                    label=""
                    name="c_ncv_unit"
                    value={formValues.c_ncv_unit}
                    onChange={handleInputChange}
                    error={formErrors.c_ncv_unit}
                    readOnly
                  />
                  <LabeledTextField
                    type="number"
                    caption="Biomass content"
                    defination="กรอกปริมาณของ Biomass"
                    label=""
                    name="c_biomass_content"
                    value={formValues.c_biomass_content}
                    onChange={handleInputChange}
                    error={formErrors.c_biomass_content}
                  />
                </div>
              </div>
            </Box>

            {/* Box2: Process emissions */}
            <Box mb={3}>
              <div style={{ textAlign: "left", marginBottom: "1.5rem" }}>
                <strong> Process emissions </strong>
              </div>
              <div
                style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}
              >
                <div style={{ flex: 1 }}>
                  <LabeledAutocomplete
                    type="text"
                    caption="Method"
                    defination="เลือกวิธีกการ"
                    label=""
                    name="p_method"
                    options={emission.map((item) => item.name)}
                    value={formValues.p_method}
                    onChange={(value: string) =>
                      setFormValues((prev) => ({ ...prev, p_method: value }))
                    }
                    error={formErrors.p_method}
                  />
                  <LabeledTextField
                    type="number"
                    caption="Activity Data(AD)"
                    defination="กรอกข้อมูลปริมาณเชื้อเพลิง"
                    label=""
                    name="p_activity_data"
                    value={formValues.p_activity_data}
                    onChange={handleInputChange}
                    error={formErrors.p_activity_data}
                  />
                  <div style={{ marginBottom: "1.5rem" }}></div>
                  <LabeledTextField
                    type="number"
                    caption="Net calorific value (NCV)"
                    defination="กรอกค่าความร้อนของเชื้อเพลิง"
                    label=""
                    name="p_net_calorific_value"
                    value={formValues.p_net_calorific_value}
                    onChange={handleInputChange}
                    error={formErrors.p_net_calorific_value}
                  />
                  <LabeledTextField
                    type="number"
                    caption="Emission factor (EF)"
                    defination="กรอกค่า Emission factor"
                    label=""
                    name="p_emission_factor"
                    value={formValues.p_emission_factor}
                    onChange={handleInputChange}
                    error={formErrors.p_emission_factor}
                  />
                  <LabeledTextField
                    type="number"
                    caption="Oxidation factor"
                    defination="กรอกค่า Oxidation factor"
                    label=""
                    name="p_oxidation_factor"
                    value={formValues.p_oxidation_factor}
                    onChange={handleInputChange}
                    error={formErrors.p_oxidation_factor}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <LabeledTextField
                    type="text"
                    caption="Source stream name"
                    defination="กรอกข้อมูลชนิดเชื้อเพลิง"
                    label=""
                    name="p_source_stream_name"
                    value={formValues.p_source_stream_name}
                    onChange={handleInputChange}
                    error={formErrors.p_source_stream_name}
                  />
                  <LabeledAutocompleteMap
                    caption="AD Unit"
                    defination="เลือกหน่วยของปริมาณเชื้อเพลิง"
                    label=""
                    name="p_ad_unit"
                    options={adunits.map((unit) => ({
                      label: unit.name,
                      value: unit.name,
                    }))}
                    value={formValues.p_ad_unit}
                    error={formErrors.p_ad_unit}
                    onChange={(val: string | number) => {
                      const value = typeof val === "string" ? val : String(val);
                      setFormValues((prev) => ({
                        ...prev,
                        p_ad_unit: value,
                        p_ncv_unit:
                          value === "t"
                            ? "GJ/t"
                            : value === "1000Nm3"
                              ? "GJ/1000Nm3"
                              : prev.p_ncv_unit,
                      }));
                      // Clear the error for p_ad_unit
                      setFormErrors((prev) => ({ ...prev, p_ad_unit: "" }));
                    }}
                  />
                  <LabeledTextField
                    type="text"
                    caption="Net Calorific Value Unit (NCV Unit)"
                    defination="กรอกหน่วยของค่าความร้อนของเชื้อเพลิง"
                    label=""
                    name="p_ncv_unit"
                    value={formValues.p_ncv_unit}
                    onChange={handleInputChange}
                    error={formErrors.p_ncv_unit}
                    readOnly
                  />
                  <LabeledAutocomplete
                    caption="EF Unit"
                    defination="เลือก หน่วยของค่า Emission factor"
                    label=""
                    name="p_ef_unit"
                    options={efunits.map((unit) => unit.name)}
                    value={formValues.p_ef_unit}
                    error={formErrors.p_ef_unit}
                    onChange={(value: string) =>
                      setFormValues((prev) => ({ ...prev, p_ef_unit: value }))
                    }
                  />
                  <LabeledTextField
                    type="number"
                    caption="Biomass content"
                    defination="กรอกปริมาณของ Biomass"
                    label=""
                    name="p_biomass_content"
                    value={formValues.p_biomass_content}
                    onChange={handleInputChange}
                    error={formErrors.p_biomass_content}
                  />
                </div>
              </div>

              {/* Display calculated values for process emissions */}
              <div
                style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}
              >
                <div style={{ flex: 1 }}>
                  <LabeledTextField
                    type="text"
                    caption="CO2e fossil (t)"
                    defination="ค่า CO2e fossil (t)"
                    label=""
                    name="p_co2e_fossil"
                    value={formValues.p_co2e_fossil}
                    onChange={handleInputChange}
                    error={formErrors.p_co2e_fossil}
                    readOnly
                  />
                  <LabeledTextField
                    type="text"
                    caption="CO2e bio (t)"
                    defination="ค่า CO2e bio (t)"
                    label=""
                    name="p_co2e_bio"
                    value={formValues.p_co2e_bio}
                    onChange={handleInputChange}
                    error={formErrors.p_co2e_bio}
                    readOnly
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <LabeledTextField
                    type="text"
                    caption="Energy content (fossil), TJ"
                    defination="ค่า Energy content (fossil)"
                    label=""
                    name="p_energy_content_fossil"
                    value={formValues.p_energy_content_fossil}
                    onChange={handleInputChange}
                    error={formErrors.p_energy_content_fossil}
                    readOnly
                  />
                  <LabeledTextField
                    type="text"
                    caption="Energy content (bio), TJ"
                    defination="ค่า Energy content (bio)"
                    label=""
                    name="p_energy_content_bio"
                    value={formValues.p_energy_content_bio}
                    onChange={handleInputChange}
                    error={formErrors.p_energy_content_bio}
                    readOnly
                  />
                </div>
              </div>
            </Box>

            {/* Box2: Mass Balance */}
            <Box mb={3}>
              <div style={{ textAlign: "left", marginBottom: "1.5rem" }}>
                <strong> Mass Balance </strong>
              </div>
              <div
                style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}
              >
                <div style={{ flex: 1 }}>
                  <LabeledAutocomplete
                    type="text"
                    caption="Method"
                    defination="เลือกวิธีกการ"
                    label=""
                    name="m_method"
                    options={emission.map((item) => item.name)}
                    value={formValues.m_method}
                    onChange={(value: string) =>
                      setFormValues((prev) => ({ ...prev, m_method: value }))
                    }
                    error={formErrors.m_method}
                  />
                  <LabeledTextField
                    type="number"
                    caption="Activity Data(AD)"
                    defination="กรอกข้อมูลปริมาณเชื้อเพลิง"
                    label=""
                    name="m_activity_data"
                    value={formValues.m_activity_data}
                    onChange={handleInputChange}
                    error={formErrors.m_activity_data}
                  />
                  <div style={{ marginBottom: "1.5rem" }}></div>
                  <LabeledTextField
                    type="number"
                    caption="Net calorific value (NCV)"
                    defination="กรอกค่าความร้อนของเชื้อเพลิง"
                    label=""
                    name="m_net_calorific_value"
                    value={formValues.m_net_calorific_value}
                    onChange={handleInputChange}
                    error={formErrors.m_net_calorific_value}
                  />
                  <LabeledTextField
                    type="number"
                    caption="Carbon content"
                    defination="กรอกค่า Carbon content"
                    label=""
                    name="m_carbon_content"
                    value={formValues.m_carbon_content}
                    onChange={handleInputChange}
                    error={formErrors.m_carbon_content}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <LabeledTextField
                    type="text"
                    caption="Source stream name"
                    defination="กรอกข้อมูลชนิดเชื้อเพลิง"
                    label=""
                    name="m_source_stream_name"
                    value={formValues.m_source_stream_name}
                    onChange={handleInputChange}
                    error={formErrors.m_source_stream_name}
                  />
                  <LabeledAutocompleteMap
                    caption="AD Unit"
                    defination="เลือกหน่วยของปริมาณเชื้อเพลิง"
                    label=""
                    name="m_ad_unit"
                    options={adunits.map((unit) => ({
                      label: unit.name,
                      value: unit.name,
                    }))}
                    value={formValues.m_ad_unit}
                    error={formErrors.m_ad_unit}
                    onChange={(val: string | number) => {
                      const value = typeof val === "string" ? val : String(val);
                      setFormValues((prev) => ({
                        ...prev,
                        m_ad_unit: value,
                        m_ncv_unit:
                          value === "t"
                            ? "GJ/t"
                            : value === "1000Nm3"
                              ? "GJ/1000Nm3"
                              : prev.m_ncv_unit,
                      }));
                      // Clear the error for m_ad_unit
                      setFormErrors((prev) => ({ ...prev, m_ad_unit: "" }));
                    }}
                  />
                  <LabeledTextField
                    type="text"
                    caption="Net Calorific Value Unit (NCV Unit)"
                    defination="กรอกหน่วยของค่าความร้อนของเชื้อเพลิง"
                    label=""
                    name="m_ncv_unit"
                    value={formValues.m_ncv_unit}
                    onChange={handleInputChange}
                    error={formErrors.m_ncv_unit}
                    readOnly
                  />
                  <LabeledTextField
                    type="number"
                    caption="Biomass content"
                    defination="กรอกปริมาณของ Biomass"
                    label=""
                    name="m_biomass_content"
                    value={formValues.m_biomass_content}
                    onChange={handleInputChange}
                    error={formErrors.m_biomass_content}
                  />
                </div>
              </div>

              {/* Display calculated values for process emissions */}
              <div
                style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}
              >
                <div style={{ flex: 1 }}>
                  <LabeledTextField
                    type="text"
                    caption="CO2e fossil (t)"
                    defination="ค่า CO2e fossil (t)"
                    label=""
                    name="m_co2e_fossil"
                    value={formValues.m_co2e_fossil}
                    onChange={handleInputChange}
                    error={formErrors.m_co2e_fossil}
                    readOnly
                  />
                  <LabeledTextField
                    type="text"
                    caption="CO2e bio (t)"
                    defination="ค่า CO2e bio (t)"
                    label=""
                    name="m_co2e_bio"
                    value={formValues.m_co2e_bio}
                    onChange={handleInputChange}
                    error={formErrors.m_co2e_bio}
                    readOnly
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <LabeledTextField
                    type="text"
                    caption="Energy content (fossil), TJ"
                    defination="ค่า Energy content (fossil)"
                    label=""
                    name="m_energy_content_fossil"
                    value={formValues.m_energy_content_fossil}
                    onChange={handleInputChange}
                    error={formErrors.m_energy_content_fossil}
                    readOnly
                  />
                  <LabeledTextField
                    type="text"
                    caption="Energy content (bio), TJ"
                    defination="ค่า Energy content (bio)"
                    label=""
                    name="m_energy_content_bio"
                    value={formValues.m_energy_content_bio}
                    onChange={handleInputChange}
                    error={formErrors.m_energy_content_bio}
                    readOnly
                  />
                </div>
              </div>
            </Box>
          </Section>

          {/* SECTION 2: Installation-level GHG emissions and energy consumption*/}
          <Section
            title="(b) Installation-level GHG emissions and energy consumption "
            subtitle="การปล่อยก๊าซเรือนกระจกและการใช้พลังงานของสถานประกอบการ"
          // hasError={
          //   !!formErrors.auth_rep ||
          //   !!formErrors.email ||
          //   !!formErrors.tel ||
          //   !!formErrors.fax
          // }
          >
            {/* Box1: GHG emissions and energy consumption */}
            <Box mb={3}>
              <div style={{ textAlign: "left", marginBottom: "1.5rem" }}>
                <strong> GHG emissions and energy consumption </strong>
              </div>
              {/* <div
                style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}
              > */}
                {/* <div style={{ flex: 1 }}> */}
                <LabeledTextField
                  type="number"
                  caption="Fuel balance"
                  defination="กรอกปริมาณรวมของการปล่อย Emission ทางอ้อม"
                  label=""
                  name="fuel_balance"
                  value={formValues.fuel_balance}
                  onChange={handleInputChange}
                  error={formErrors.fuel_balance} // Pass the error for the helper text
                  helperText={formErrors.fuel_balance} // Show error as helper text
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
                  name="fuel_balance"
                  value={formValues.fuel_balance}
                  onChange={handleInputChange}
                  error={formErrors.fuel_balance} // Pass the error for the helper text
                  helperText={formErrors.fuel_balance} // Show error as helper text
                  inputProps={{
                    step: "any",
                    placeholder: "Enter amount",
                    className: "appearance-none",
                  }}
                  readOnly
                />
                {/* </div> */}
              {/* </div> */}
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
                defination="ข้อมููลทั่วไปเกี่ยวกับคุณภาพของข้อมูล"
                label=""
                name="generatl_info_on_data_quality"
                value={formValues.generatl_info_on_data_quality}
                onChange={(value: string) => {
                  setFormValues((prev) => ({ ...prev, generatl_info_on_data_quality: value }));
                  // Clear any errors when the field is updated
                  setFormErrors((prev) => ({ ...prev, generatl_info_on_data_quality: "" }));
                }}
                error={formErrors.generatl_info_on_data_quality} // Pass the error for the helper text
                helperText={formErrors.generatl_info_on_data_quality} // Show error as helper text
                options={generalinfo.map((item) => item.name)}
              />
              <LabeledAutocomplete
                caption="Justification for use of default values (if relevant)"
                defination="หตุผลในการใช้ค่ากลาง (ถ้าเกี่ยวข้อง)"
                label=""
                name="justification_for_use_default_values"
                value={formValues.justification_for_use_default_values}
                onChange={(value: string) => {
                  setFormValues((prev) => ({ ...prev, justification_for_use_default_values: value }));
                  // Clear any errors when the field is updated
                  setFormErrors((prev) => ({ ...prev, justification_for_use_default_values: "" }));
                }}
                error={formErrors.justification_for_use_default_values} // Pass the error for the helper text
                helperText={formErrors.justification_for_use_default_valuesa} // Show error as helper text
                options={justification.map((item: { name: string }) => item.name)}
              />
              <LabeledAutocomplete
                caption="Information on quality assurance"
                defination="ข้อมูลการประกันคุณภาพ "
                label=""
                name="information_quality_assurance"
                value={formValues.information_quality_ssurance}
                onChange={(value: string) => {
                  setFormValues((prev) => ({ ...prev, information_quality_ssurance: value }));
                  // Clear any errors when the field is updated
                  setFormErrors((prev) => ({ ...prev, information_quality_ssurance: "" }));
                }}
                error={formErrors.information_quality_ssurance} // Pass the error for the helper text
                helperText={formErrors.information_quality_ssurancea} // Show error as helper text
                options={qualityassurance.map((item) => item.name)}
              />
            </Box>
          </Section>

          <PGButton />
        </Grid>
      </form>
    </Container>
  );
});

export default SourceForm;
