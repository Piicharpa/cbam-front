import React from "react";
import { Box } from "@mui/material";
import LabeledTextField from "../../../components/LabeledTextField";
import LabeledAutocompleteMap from "../../../components/LabeledAutoCompleteMap";
import LabeledAutocomplete from "../../../components/LabeledAutoComplete";
import DeleteIcon from "@mui/icons-material/Delete";
import { emission } from "../../../components/dropdown/emission";
import { adunits } from "../../../components/dropdown/adunits";
import { efunits } from "../../../components/dropdown/efunits";

// In Source_sec1.tsx
export interface ProcessEmissionSection {
  id: number;       // Client-side ID for React rendering
  db_id?: number;   // Database ID for records that exist in the database
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

interface SourceFormSection1Props {
  processEmissionSections: ProcessEmissionSection[];
  formErrors: { [key: string]: string };
  handleProcessInputChange: (id: number, field: string, value: string) => void;
  handleProcessADUnitChange: (id: number, value: string | number) => void;
  removeProcessSection: (idToRemove: number) => void;
  addNewProcessSection: () => void;
}

const Source_sec1: React.FC<SourceFormSection1Props> = ({
  processEmissionSections,
  formErrors,
  handleProcessInputChange,
  handleProcessADUnitChange,
  removeProcessSection,
  addNewProcessSection,
}) => {
  return (
    <>
      {processEmissionSections.map((section, index) => (
        <Box
          key={section.id}
          mb={4}
          p={2}
          sx={{
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            position: "relative",
            backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white",
          }}
        >
          {processEmissionSections.length > 1 && (
            <Box
              sx={{
                position: "absolute",
                right: "10px",
                top: "10px",
                cursor: "pointer",
                color: "error.main",
                "&:hover": {
                  color: "error.dark",
                },
              }}
              onClick={() => removeProcessSection(section.id)}
            >
              <DeleteIcon />
            </Box>
          )}
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              marginBottom: "1rem",
            }}
          >
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
                required
              />
              <LabeledTextField
                type="number"
                caption="Activity Data(AD)"
                defination="กรอกข้อมูลปริมาณเชื้อเพลิง"
                label=""
                name={`p_activity_data_${section.id}`}
                value={section.p_activity_data}
                onChange={(e) =>
                  handleProcessInputChange(
                    section.id,
                    "p_activity_data",
                    e.target.value
                  )
                }
                error={formErrors[`p_${section.id}_p_activity_data`]}
                required
              />
           
              <LabeledTextField
                type="number"
                caption="Net calorific value (NCV)"
                defination="กรอกค่าความร้อนของเชื้อเพลิง"
                label=""
                name={`p_net_calorific_value_${section.id}`}
                value={section.p_net_calorific_value}
                onChange={(e) =>
                  handleProcessInputChange(
                    section.id,
                    "p_net_calorific_value",
                    e.target.value
                  )
                }
                error={
                  formErrors[`p_${section.id}_p_net_calorific_value`]
                }
              />
              <LabeledTextField
                type="number"
                caption="Emission factor (EF)"
                defination="กรอกค่า Emission factor"
                label=""
                name={`p_emission_factor_${section.id}`}
                value={section.p_emission_factor}
                onChange={(e) =>
                  handleProcessInputChange(
                    section.id,
                    "p_emission_factor",
                    e.target.value
                  )
                }
                error={formErrors[`p_${section.id}_p_emission_factor`]}
                required
              />
              <LabeledTextField
                type="number"
                caption="Oxidation factor"
                defination="กรอกค่า Oxidation factor"
                label=""
                name={`p_oxidation_factor_${section.id}`}
                value={section.p_oxidation_factor}
                onChange={(e) =>
                  handleProcessInputChange(
                    section.id,
                    "p_oxidation_factor",
                    e.target.value
                  )
                }
                error={formErrors[`p_${section.id}_p_oxidation_factor`]}
                required
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
                  handleProcessInputChange(
                    section.id,
                    "p_source_stream_name",
                    e.target.value
                  )
                }
                error={formErrors[`p_${section.id}_p_source_stream_name`]}
                required
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
                onChange={(val: string | number | (string | number)[]) => {
                  // Ensure value is string or number before passing
                  let value: string | number;
                  if (Array.isArray(val)) {
                    value = val.length > 0 ? val[0] : "";
                  } else {
                    value = val;
                  }
                  handleProcessADUnitChange(section.id, value);
                }}
                required
              />
              <LabeledTextField
                type="text"
                caption="Net Calorific Value Unit (NCV Unit)"
                defination="กรอกหน่วยของค่าความร้อนของเชื้อเพลิง"
                label=""
                name={`p_ncv_unit_${section.id}`}
                value={section.p_ncv_unit}
                onChange={(e) =>
                  handleProcessInputChange(
                    section.id,
                    "p_ncv_unit",
                    e.target.value
                  )
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
                required
              />
              <LabeledTextField
                type="number"
                caption="Biomass content"
                defination="กรอกปริมาณของ Biomass"
                label=""
                name={`p_biomass_content_${section.id}`}
                value={section.p_biomass_content}
                onChange={(e) =>
                  handleProcessInputChange(
                    section.id,
                    "p_biomass_content",
                    e.target.value
                  )
                }
                error={formErrors[`p_${section.id}_p_biomass_content`]}
              />
            </div>
          </div>
          {/* Display calculated values for process emissions */}
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              marginBottom: "1rem",
            }}
          >
            <div style={{ flex: 1 }}>
              <LabeledTextField
                type="text"
                caption="CO2e fossil (t)"
                defination="ค่า CO2e fossil (t)"
                label=""
                name={`p_co2e_fossil_${section.id}`}
                value={section.p_co2e_fossil}
                readOnly
                error={formErrors[`p_${section.id}_p_co2e_fossil`]}
                onChange={() => {}} // Empty function for readOnly field
              />
              <LabeledTextField
                type="text"
                caption="CO2e bio (t)"
                defination="ค่า CO2e bio (t)"
                label=""
                name={`p_co2e_bio_${section.id}`}
                value={section.p_co2e_bio}
                readOnly
                error={formErrors[`p_${section.id}_p_co2e_bio`]}
                onChange={() => {}} // Empty function for readOnly field
              />
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
                error={formErrors[`p_${section.id}_p_energy_content_fossil`]}
                onChange={() => {}} // Empty function for readOnly field
              />
              <LabeledTextField
                type="text"
                caption="Energy content (bio), TJ"
                defination="ค่า Energy content (bio)"
                label=""
                name={`p_energy_content_bio_${section.id}`}
                value={section.p_energy_content_bio}
                readOnly
                error={formErrors[`p_${section.id}_p_energy_content_bio`]}
                onChange={() => {}} // Empty function for readOnly field
              />
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
            transition: "all 0.2s ease",
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
    </>
  );
};

export default Source_sec1;