// forms/Section3.tsx
// import React from "react";
import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import Section from "../../components/Section";
import LabeledTextField from "../../components/LabeledTextField";
import LabeledAutoComplete from "../../components/LabeledAutoComplete";
import SectionButton from "../../components/SectionButton";
import Typography from "@mui/material/Typography";
import LabeledCheckbox from "../../components/LabeledCheckBox";

interface Props {
  values: any;
  errors: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // onNext: () => void;
  setValues: React.Dispatch<React.SetStateAction<any>>;
  countries: any[]; // options for autocomplete
}

const Section3: React.FC<Props> = ({
  values,
  errors,
  onChange,
  // onNext,
  setValues,
  countries,
}) => {
  const [electricitySources, setElectricitySources] = useState<
    { id: number; name: string }[]
  >([]);

  useEffect(() => {
    const fetchElectricitySources = async () => {
      try {
        const res = await fetch("http://178.128.123.212:5000/api/cbam/srcefelectricitys");
        const name = await res.json();
        setElectricitySources(name);
      } catch (error) {
        console.error("โหลดข้อมูลแหล่ง EF ไฟฟ้าไม่สำเร็จ:", error);
      }
    };

    fetchElectricitySources();
  }, []);

  return (
    <Section
      title="(c) Calculation of the attributed emissions"
      subtitle="การคำนวณการปล่อยก๊าซเรือนกระจกจากกระบวนการผลิต"
      hasError={
        !!errors.auth_rep || !!errors.email || !!errors.tel || !!errors.fax
      }
    >
      {/* Box 1: Measurable Heat */}
      <Box mb={3}>
        <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
          <div style={{ flex: 1 }}>
            <LabeledCheckbox
              caption="Measurable heat"
              defination="ความร้อนที่สามารถวัดได้"
              name="has_heat"
              checked={values.has_heat === "True"}
              onChange={(e) =>
                setValues((prev: any) => ({
                  ...prev,
                  has_heat: e.target.checked ? "True" : "False",
                }))
              }
            />
          </div>
        </div>

        {values.has_heat === "True" && (
          <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
            <div style={{ flex: 1 }}>
              <LabeledTextField
                type="number"
                caption="Emissions factor (Imported)"
                label=""
                defination="ค่า Emission factor ของค่าความร้อน (จากการซื้อมาใช้)"
                name="measurable_emission_imported"
                value={values.measurable_emission_imported}
                onChange={onChange}
                error={errors.measurable_emission_imported}
              />
              <LabeledTextField
                type="number"
                caption="Emissions factor (Exported)"
                defination="ค่า Emission factor ของค่าความร้อน (จากการขาย)"
                label=""
                name="measurable_emission_exported"
                value={values.measurable_emission_exported}
                onChange={onChange}
                error={errors.measurable_emission_exported}
              />
            </div>

            <div style={{ flex: 1 }}>
              <LabeledTextField
                type="number"
                caption="Amount of net measurable heat (Imported)"
                defination="กรอกปริมาณความร้อนสุทธิ์ที่ได้จากการวัด (จากการซื้อมาใช้)"
                label=""
                name="measurable_heat_imported"
                value={values.measurable_heat_imported}
                onChange={onChange}
                error={errors.measurable_heat_imported}
              />
              <LabeledTextField
                type="number"
                caption="Amount of net measurable heat (Exported)"
                defination="กรอกปริมาณความร้อนสุทธิ์ที่ได้จากการวัด (จากการขาย)"
                label=""
                name="measurable_heat_exported"
                value={values.measurable_heat_exported}
                onChange={onChange}
                error={errors.measurable_heat_exported}
              />
            </div>
          </div>
        )}
      </Box>

      {/* Box 2: Waste gases */}
      <Box mb={3}>
        <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
          <LabeledCheckbox
            caption="Waste gases"
            defination="ก๊าซไอเสีย"
            name="has_waste_gases"
            checked={values.has_waste_gases === "True"}
            onChange={(e) =>
              setValues((prev: any) => ({
                ...prev,
                has_waste_gases: e.target.checked ? "True" : "False",
              }))
            }
          />
        </div>

        {values.has_waste_gases === "True" && (
          <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
            <div style={{ flex: 1 }}>
              <LabeledTextField
                type="number"
                caption="Emissions factor (Imported)"
                defination="ค่า Emission factor ของค่าความร้อนทิ้ง (จากการซื้อมาใช้)"
                label=""
                name="waste_emission_imported"
                value={values.waste_emission_imported}
                onChange={onChange}
                error={errors.waste_emission_imported}
              />
              <LabeledTextField
                type="number"
                caption="Emissions factor (Exported)"
                defination="ค่า Emission factor ของค่าความร้อนทิ้ง (จากการขาย)"
                label=""
                name="waste_emission_exported"
                value={values.waste_emission_exported}
                onChange={onChange}
                error={errors.waste_emission_exported}
              />
            </div>

            <div style={{ flex: 1 }}>
              <LabeledTextField
                type="number"
                caption="Amount of waste gas (Imported)"
                defination="กรอกค่าปริมาณความร้อนทิ้ง (จากการซื้อมาใช้)"
                label=""
                name="waste_amount_imported"
                value={values.waste_amount_imported}
                onChange={onChange}
                error={errors.waste_amount_imported}
              />
              <LabeledTextField
                type="number"
                caption="Amount of waste gas (Exported)"
                defination="กรอกค่าปริมาณความร้อนทิ้ง (จากการขาย)"
                label=""
                name="waste_amount_exported"
                value={values.waste_amount_exported}
                onChange={onChange}
                error={errors.waste_amount_exported}
              />
              <LabeledTextField
                type="number"
                caption="Directly attributable emissions (DirEm*)"
                defination="กรอกตัวเลขค่าปริมาณการปล่อยก๊าซเรือนกระจกทางตรง"
                label=""
                name="direct_emissions"
                value={values.direct_emissions}
                onChange={onChange}
                error={errors.direct_emissions}
              />
            </div>
          </div>
        )}
      </Box>

      {/* Box 3: Indirect emissions from electricity consumption"*/}
      <div style={{ textAlign: "left", marginBottom: "1.5rem" }}>
        <strong> Indirect emissions from electricity consumption </strong>
        <p style={{ marginTop: "0.25rem", color: "#666", fontSize: "0.9rem" }}>
          ปริมาณการปล่อยก๊าซเรือนกระจกทางอ้อมจากไฟฟ้า
        </p>
      </div>
      <Box mb={3}>
        <LabeledTextField
          type="number"
          caption="Electricity consumption"
          defination="กรอกปริมาณการใช้ไฟฟ้ารวมของกระบวนการผลิต"
          label=""
          name="electricity_consumption_value"
          value={values.electricity_consumption_value}
          onChange={onChange}
          error={errors.electricity_consumption_value}
        />
      </Box>
      <Box mb={3}>
        <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
          <div style={{ flex: 1 }}>
            <LabeledTextField
              type="number"
              caption="Emission factor of the electricity"
              defination="กรอกค่า Emission factor ของไฟฟ้า"
              label=""
              name="electricity_emission_factor_2"
              value={values.electricity_emission_factor_2}
              onChange={onChange}
              error={errors.electricity_emission_factor_2}
            />
          </div>

          <div style={{ flex: 1 }}>
            <LabeledAutoComplete
              caption="Source of the emission factor"
              defination="เลือกแหล่งที่มาของค่า Emission factor ของไฟฟ้า"
              label=""
              name="electricity_source"
              options={electricitySources.map((item) => item.name)}
              value={values.electricity_source}
              error={errors.electricity_source}
              onChange={(val) =>
                setValues((prev: any) => ({ ...prev, electricity_source: val }))
              }
            />
          </div>
        </div>
      </Box>

      {/* Box 4: Electricity exported from the production process*/}
      <div style={{ textAlign: "left", marginBottom: "1.5rem" }}>
        <strong> Electricity exported from the production process</strong>
        <p style={{ marginTop: "0.25rem", color: "#666", fontSize: "0.9rem" }}>
          ปริมาณไฟฟ้าที่ส่งออกจากกระบวนการผลิต
        </p>
      </div>

      <Box mb={3}>
        <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
          <div style={{ flex: 1 }}>
            <LabeledTextField
              type="number"
              caption="Emission factor of the electricity"
              defination="กรอกค่า Emission factor ของไฟฟ้าที่ส่งออกจากกระบวนการผลิต"
              label=""
              name="electricity_emission_factor"
              value={values.electricity_emission_factor}
              onChange={onChange}
              error={errors.electricity_emission_factor}
            />
          </div>
          <div style={{ flex: 1 }}>
            <LabeledTextField
              type="number"
              caption="Amounts exported"
              defination="กรอกค่าไฟฟ้าที่ส่งออกจากกระบวนการผลิต"
              label=""
              name="electricity_exported"
              value={values.electricity_exported}
              onChange={onChange}
              error={errors.electricity_exported}
            />
          </div>
        </div>
      </Box>

      {/* <div style={{ display: "flex", justifyContent: "right" }}>
        <SectionButton onValidate={() => true} onSuccess={onNext} />
      </div> */}
    </Section>
  );
};

export default Section3;
