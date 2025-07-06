// forms/Section3.tsx
// import React from "react";
import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import Section from "../../../components/Section";
import LabeledTextField from "../../../components/LabeledTextField";
import LabeledCheckbox from "../../../components/LabeledCheckBox";
import LabeledAutocomplete from "../../../components/LabeledAutoComplete";

interface Props {
  values: any;
  errors: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setValues: React.Dispatch<React.SetStateAction<any>>;
  countries: any[]; // options for autocomplete
}

const Section3: React.FC<Props> = ({ values, errors, onChange, setValues }) => {
  const [electricitySources, setElectricitySources] = useState<
    { id: number; name: string }[]
  >([]);
  const apiUrl = process.env.REACT_APP_API_URL;
  useEffect(() => {
    const fetchElectricitySources = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/cbam/srcefelectricitys`);
        const name = await res.json();
        setElectricitySources(name);
      } catch (error) {
        console.error("โหลดข้อมูลแหล่ง EF ไฟฟ้าไม่สำเร็จ:", error);
      }
    };

    fetchElectricitySources();
  }, []);

  function onNext(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <Section
      title = "Calculation of the attributed emissions"
      subtitle="การคำนวณการปล่อยก๊าซเรือนกระจกจากกระบวนการผลิต"
      hasError={!!errors.source_of_ef_electricity}
    >
      {/* Box 1: Measurable Heat */}
      <Box mb={3}>
        <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
          <div style={{ flex: 1 }}>
            <LabeledCheckbox
              caption="Measurable heat"
              defination="ความร้อนที่สามารถวัดได้"
              name="has_heat"
              checked={values.has_heat === 1}
              onChange={(e) =>
                setValues((prev: any) => ({
                  ...prev,
                  has_heat: e.target.checked ? 1 : 0, // Changed from "True"/"False" to 1/0
                }))
              }
            />
          </div>
        </div>

        {values.has_heat === 1 && (
          <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
            <div style={{ flex: 1 }}>
              <LabeledTextField
                type="number"
                caption="Emissions factor (Imported)"
                label=""
                defination="ค่า Emission factor ของค่าความร้อน (จากการซื้อมาใช้)"
                name="ef_imported_heat"
                value={values.ef_imported_heat}
                onChange={onChange}
                error={errors.ef_imported_heat}
              />
              <LabeledTextField
                type="number"
                caption="Emissions factor (Exported)"
                defination="ค่า Emission factor ของค่าความร้อน (จากการขาย)"
                label=""
                name="ef_exported_heat"
                value={values.ef_exported_heat}
                onChange={onChange}
                error={errors.ef_exported_heat}
              />
            </div>

            <div style={{ flex: 1 }}>
              <LabeledTextField
                type="number"
                caption="Amount of net measurable heat (Imported)"
                defination="กรอกปริมาณความร้อนสุทธิ์ที่ได้จากการวัด (จากการซื้อมาใช้)"
                label=""
                name="imported_heat_value"
                value={values.imported_heat_value}
                onChange={onChange}
                error={errors.imported_heat_value}
              />
              <LabeledTextField
                type="number"
                caption="Amount of net measurable heat (Exported)"
                defination="กรอกปริมาณความร้อนสุทธิ์ที่ได้จากการวัด (จากการขาย)"
                label=""
                name="exported_heat_value"
                value={values.exported_heat_value}
                onChange={onChange}
                error={errors.exported_heat_value}
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
            checked={values.has_waste_gases === 1} // Use numeric comparison
            onChange={(e) =>
              setValues((prev: any) => ({
                ...prev,
                has_waste_gases: e.target.checked ? 1 : 0, // Change to use numeric values
              }))
            }
          />
        </div>

        {values.has_waste_gases === 1 && (
          <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
            <div style={{ flex: 1 }}>
              <LabeledTextField
                type="number"
                caption="Emissions factor (Imported)"
                defination="ค่า Emission factor ของค่าความร้อนทิ้ง (จากการซื้อมาใช้)"
                label=""
                name="ef_imported_wgases"
                value={values.ef_imported_wgases}
                onChange={onChange}
                error={errors.ef_imported_wgases}
              />
              <LabeledTextField
                type="number"
                caption="Emissions factor (Exported)"
                defination="ค่า Emission factor ของค่าความร้อนทิ้ง (จากการขาย)"
                label=""
                name="ef_exported_wgases"
                value={values.ef_exported_wgases}
                onChange={onChange}
                error={errors.ef_exported_wgases}
              />
            </div>

            <div style={{ flex: 1 }}>
              <LabeledTextField
                type="number"
                caption="Amount of waste gas (Imported)"
                defination="กรอกค่าปริมาณความร้อนทิ้ง (จากการซื้อมาใช้)"
                label=""
                name="imported_wgases_amount"
                value={values.imported_wgases_amount}
                onChange={onChange}
                error={errors.imported_wgases_amount}
              />
              <LabeledTextField
                type="number"
                caption="Amount of waste gas (Exported)"
                defination="กรอกค่าปริมาณความร้อนทิ้ง (จากการขาย)"
                label=""
                name="exported_wgases_amount"
                value={values.exported_wgases_amount}
                onChange={onChange}
                error={errors.exported_wgases_amount}
              />
            </div>
          </div>
        )}
      </Box>

      <div style={{ textAlign: "left", marginBottom: "1.5rem", fontSize: "18px" }}>
        <strong> Directly attributable emissions (DirEm*) </strong>
      </div>
      <Box mb={3}>
        <LabeledTextField
          type="number"
          caption="Directly attributable emissions (DirEm*)"
          defination="กรอกตัวเลขค่าปริมาณการปล่อยก๊าซเรือนกระจกทางตรง"
          label=""
          name="direct_emissions"
          value={values.direct_emissions}
          onChange={onChange}
          error={errors.direct_emissions}
          required
        />
      </Box>

      {/* Box 3: Indirect emissions from electricity consumption"*/}
      <div style={{ textAlign: "left", marginBottom: "1.5rem" ,fontSize: "18px"}}>
        <strong> Indirect emissions from electricity consumption </strong>
        <p style={{ marginTop: "0.25rem", color: "#666", fontSize: "14px" }}>
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
          required
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
              name="ef_exported_electricity"
              value={values.ef_exported_electricity}
              onChange={onChange}
              error={errors.ef_exported_electricity}
              required
            />
          </div>

          <div style={{ flex: 1 }}>
            <LabeledAutocomplete
              caption="Source of the emission factor"
              defination="เลือกแหล่งที่มาของค่า Emission factor ของไฟฟ้า"
              label=""
              name="source_of_ef_electricity"
              options={electricitySources.map((item) => item.name)}
              value={values.source_of_ef_electricity}
              error={errors.source_of_ef_electricity}
              onChange={(val) =>
                setValues((prev: any) => ({
                  ...prev,
                  source_of_ef_electricity: val,
                }))
              }
            />
          </div>
        </div>
      </Box>

      {/* Box 4: Electricity exported from the production process*/}
      <div style={{ textAlign: "left", marginBottom: "1.5rem", fontSize: "18px"}}>
        <strong> Electricity exported from the production process</strong>
        <p style={{ marginTop: "0.25rem", color: "#666", fontSize: "14px" }}>
          ปริมาณไฟฟ้าที่ส่งออกจากกระบวนการผลิต
        </p>
      </div>

      <Box mb={3}>
        <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
          <div style={{ flex: 1 }}>
            <LabeledTextField
              type="number"
              caption="Emission factor of the electricity"
              defination="กรอกค่า Emission factor ที่ส่งออกจากกระบวนการผลิต"
              label=""
              name="ef_electricity"
              value={values.ef_electricity}
              onChange={onChange}
              error={errors.ef_electricity}
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <LabeledTextField
              type="number"
              caption="Amounts exported"
              defination="กรอกค่าไฟฟ้าที่ส่งออกจากกระบวนการผลิต"
              label=""
              name="exported_electricity_value"
              value={values.exported_electricity_value}
              onChange={onChange}
              error={errors.exported_electricity_value}
              required
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
