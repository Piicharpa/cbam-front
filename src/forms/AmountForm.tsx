import React, { useEffect, useState } from "react";
import { Container, Typography, Grid, Box } from "@mui/material";
import Section from "../components/Section";
import PGButton from "../components/FormButton";

import { useNavigate, useLocation } from "react-router-dom";
import LabeledAutocomplete from "../components/LabeledAutoComplete";
import LabeledTextField from "../components/LabeledTextField";
import LabeledAutocompleteMap from "../components/LabeledAutoCompleteMap";


interface VerifierFormProps {
  redirectPath?: string;
  onNextStep: () => void;
}

const AmountForm: React.FC<VerifierFormProps> = ({ onNextStep }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const reportId = location.state?.reportId || null;
  // const percursorId = location.state?.percursorId || null;
  const percursorId = location.state?.precursorId || localStorage.getItem("precursorId");


  const [formValues, setFormValues] = useState({

    id: "",
    embedded_direct_emissions_value: "",
    source_embedded_direct_emissions: "",
    embedded_indirection_emissions_value: "",
    source_embedded_indirect_emissions: "",
    justification_for_use_default_values: "",

  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Submit formValues:", formValues); //

    const requiredFields = [
      "id",
      "embedded_direct_emissions_value",
      "source_embedded_direct_emissions",
      "embedded_indirection_emissions_value",
      "source_embedded_indirect_emissions",
      "justification_for_use_default_values"
    ];

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

    try {
      const updateId = percursorId; // 👈 ใส่ ID ที่จะอัปเดตตรงนี้ (อาจได้มาจาก POST ก่อนหน้า)
      console.log("📦 PUT updateId:", updateId);


      const payload = {
        id: updateId,
        embedded_direct_emissions_value: formValues.embedded_direct_emissions_value || "",
        source_embedded_direct_emissions: formValues.source_embedded_direct_emissions || "",
        embedded_indirection_emissions_value: formValues.embedded_indirection_emissions_value || "",
        source_embedded_indirect_emissions: formValues.source_embedded_indirect_emissions || "",
        justification_for_use_default_values: formValues.justification_for_use_default_values || "",
      };

      console.log("📦 PUT Payload:", payload);
      console.log("📦 PUT updateId:", updateId);

      // 🔄 PUT เพื่ออัปเดต
      const response = await fetch(`http://178.128.123.212:5000/api/cbam/e_precursors/${updateId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`PUT Error: ${errText}`);
      }

      console.log("✅ PUT สำเร็จ");

      // 🔍 ดึงข้อมูลล่าสุดจาก ID นั้น
      const getRes = await fetch(`http://178.128.123.212:5000/api/cbam/e_precursors/${updateId}`);
      if (!getRes.ok) {
        const errText = await getRes.text();
        throw new Error(`GET Error: ${errText}`);
      }

      const detailData = await getRes.json();
      console.log("📄 ข้อมูลหลังอัปเดต:", detailData);

    } catch (error: any) {
      console.error("❌ Error ใน PUT หรือ GET:", error.message || error);
    }
    onNextStep?.();

    // console.log('✅ Submitted:', formValues);
    // navigate(redirectPath);
  };

//   const handleAutocompleteChange = (name: string, value: string) => {
//   setFormValues((prev) => ({
//     ...prev,
//     [name]: value,
//   }));

//   setFormErrors((prev) => ({
//     ...prev,
//     [name]: "", // เคลียร์ error เมื่อมีการเลือกใหม่
//   }));
// };

  return (
    <Container
      maxWidth="md"
      style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
    >
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3} alignItems="stretch">
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="#1976d2">
              Purchased precursors
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              รายะเอียดของวัตถุดิบที่ซื้อเข้ามาใช้ในกระบวนการผลิต
            </Typography>
          </Box>


          {/* SECTION 1: Specific embedded emissions*/}
          <Section
            title="(c) Specific embedded emissions"
            subtitle="ปริมาณการปล่อยก๊าซเรือนกระจก"
            defaultExpanded={true}
            hasError={Object.keys(formErrors).length > 0}
          >
            <div style={{ textAlign: "left", marginBottom: "1.5rem" }}>
              <strong>
                {" "}
                Specific embedded direct emissions (SEE (direct)) Unit: tCO2e/t {" "}
              </strong>

            </div>
            <Box mb={3}>
              <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <LabeledTextField
                    type="number"

                    caption=""
                    defination="กรอกเป็นตัวเลขของค่า SEE direct ของวัตถุดิบตั้งต้น"
                    label="Value"
                    name="embedded_direct_emissions_value"
                    value={formValues.embedded_direct_emissions_value}
                    onChange={handleInputChange}
                    error={formErrors.embedded_direct_emissions_value}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <LabeledAutocompleteMap
                    caption=""
                    defination="ระบุแหล่งที่มาของข้อมูล"
                    label="Source"
                    name="source_embedded_direct_emissions"
                    options={[
                      { label: "", value: "Source" },
                      { label: "Measured", value: "Measured" },
                      { label: "Default", value: "Default" },
                      { label: "Unknown", value: "Unknown" },
                    ]}
                    value={formValues.source_embedded_direct_emissions}
                    error={formErrors.source_embedded_direct_emissions}
                    onChange={(val: string | number) => {
                      const value = typeof val === "string" ? val : String(val);
                      setFormValues((prev) => ({
                        ...prev,
                        source_embedded_direct_emissions: value,
                      }));
                      setFormErrors((prev) => ({
                        ...prev,
                        source_embedded_direct_emissions: "",
                      }));
                    }}
                  />
                </div>
              </div>
            </Box>


            <div style={{ textAlign: "left", marginBottom: "1.5rem" }}>
              <strong>
                {" "}
                Specific electricity consumption (for SEE (indirect)) Unit: MWh/t {" "}

              </strong>
            </div>
            <Box mb={3}>
              <div
                style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <LabeledTextField
                    type="number"
                    caption="Amount"
                    defination="กรอกเป็นค่าตัวเลขของ SEE indirect ของวัตถุดิบตั้งต้น"

                    label="Value"
                    name="embedded_indirection_emissions_value"
                    value={formValues.embedded_indirection_emissions_value}

                    onChange={handleInputChange}
                    error={formErrors.electric_consumption_amount}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <LabeledAutocompleteMap
                    caption=""
                    defination="ระบุแหล่งที่มาของข้อมูล"
                    label="Source"
                    name="source_embedded_indirect_emissions"
                    options={[
                      { label: "", value: "Source" },
                      { label: "Measured", value: "Measured" },
                      { label: "Default", value: "Default" },
                      { label: "Unknown", value: "Unknown" },
                    ]}
                    value={formValues.source_embedded_indirect_emissions}
                    error={formErrors.source_embedded_indirect_emissions}
                    onChange={(val: string | number) => {
                      const value = typeof val === "string" ? val : String(val);
                      setFormValues((prev) => ({
                        ...prev,
                        source_embedded_indirect_emissions: value,
                      }));
                      setFormErrors((prev) => ({
                        ...prev,
                        source_embedded_indirect_emissions: "",
                      }));
                    }}

                  />
                </div>
              </div>
            </Box>

            <div style={{ textAlign: "left", marginBottom: "1.5rem" }}>
              <strong>Electricity emission factor (for SEE (indirect))</strong>
            </div>
            {/* <Box mb={3}>
              <div
                style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}
              >
                <div style={{ flex: 1 }}>
                  <LabeledTextField
                    type="number"
                    caption="Amount"
                    defination="กรอกเป็นค่าตัวเลขของ SEE indirect ของไฟฟ้าที่ใช้ในการผลิตวัตถุดิบตั้งต้น"
                    label=""
                    name="electricity_emission_amount"
                    value={formValues.electricity_emission_amount}
                    onChange={handleInputChange}
                    error={formErrors.electricity_emission_amount}
                  />
                  <div style={{ flex: 1 }}>
                    <LabeledAutocomplete
                      caption="Specific embedded indirect emissions (SEE (indirect))"
                      defination="การปล่อยก๊าซเรือนกระจกทางอ้อมเฉพาะ"
                      label=""
                      name="electricity_emission_source"
                      value={formValues.electricity_emission_source}
                      options={electricitys.map((c) => c.name)}
                      onChange={(val) =>
                        handleAutocompleteChange("electricity_emission_source", val)
                      }
                      error={formErrors.electricity_emission_source}
                    />
                  </div>
                </div>
              </div>

            </Box> */}

            <Box mb={3}>
              <div
                style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}
              >
                <div style={{ flex: 1 }}>
                  <LabeledTextField
                    type="text"
                    caption=" Justification for use of default values (if relevant) "
                    defination="กรอกเหตุผลในการใช้ค่ากลาง (ถ้าเกี่ยวข้อง)"
                    label="Name"
                    name="justification_for_use_default_values"
                    value={formValues.justification_for_use_default_values}
                    onChange={handleInputChange}
                    error={formErrors.auth_justification_for_use_default_valuesrep}
                  />
                </div>
              </div>
            </Box>
          </Section>

          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
              mt: 2,
            }}
          >
            <PGButton />
          </Box>
        </Grid>
      </form>
    </Container>
  );
};

export default AmountForm;
