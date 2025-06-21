import React, { useEffect, useState } from "react";
import { Container, Typography, Grid, Box } from "@mui/material";
import Section from "../components/Section";
import PGButton from "../components/FormButton";
import { useNavigate } from "react-router-dom";
import LabeledTextField from "../components/LabeledTextField";
import { justification } from "../components/dropdown/justification";
import { eleconsumption } from "../components/dropdown/eleconsumption";
import { electricitys } from "../components/dropdown/electricitys";
import LabeledAutocomplete from "../components/LabeledAutoComplete";

interface VerifierFormProps {
  redirectPath?: string;
}

const AmountForm: React.FC<VerifierFormProps> = ({ redirectPath = "/" }) => {
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    embedded_direct_amount: "",
    embedded_direct_source: "",
    electric_consumption_amount: "",
    electric_consumption_source: "", // Fixed typo in property name
    electricity_emission_amount: "",
    electricity_emission_source: "",
    embedded_indirect_amount: "", // Fixed typo in property name
    justification: "",
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const calculateIndirectEmission = () => {
    const ec = parseFloat(formValues.electric_consumption_amount) || 0;
    const ef = parseFloat(formValues.electricity_emission_amount) || 0;

    if (!ec|| !ef) {
      return 0;
    }

    return (ec*ef).toFixed(4);
  };

   useEffect(() => {
      setFormValues((prev) => ({
        ...prev,
        embedded_indirect_amount: calculateIndirectEmission().toString()
      }));
    }, [
      formValues.embedded_indirect_amount
    ]);

    
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields = [
      "embedded_direct_amount",
      "embedded_direct_source",
      "electric_consumption_amount",
      "electric_consumption_source",
      "electricity_emission_amount",
      "electricity_emission_source",
      "embedded_indirect_amount", 
      "justification",
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

    // console.log('✅ Submitted:', formValues);
    navigate(redirectPath);
  };

  const handleAutocompleteChange = (name: string, value: string) => {
  setFormValues((prev) => ({
    ...prev,
    [name]: value,
  }));

  setFormErrors((prev) => ({
    ...prev,
    [name]: "", // เคลียร์ error เมื่อมีการเลือกใหม่
  }));
};

  return (
    <Container
      maxWidth="md"
      style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
    >
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3} alignItems="stretch">
          <Box width="100%">
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              color="#1976d2"
            >
              Purchased precursors
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              รายละเอียดของวัตถุดิบที่ซื้อเข้ามาใช้ในกระบวนการผลิต
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
              <strong>Specific embedded direct emissions (SEE (direct))</strong>
            </div>
            <Box mb={3}>
              <div
                style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}
              >
                <div style={{ flex: 1 }}>
                  <LabeledTextField
                    type="number"
                    caption="Amount"
                    defination="กรอกเป็นตัวเลขของค่า SEE direct ของวัตถุดิบตั้งต้น"
                    label=""
                    name="embedded_direct_amount"
                    value={formValues.embedded_direct_amount}
                    onChange={handleInputChange}
                    error={formErrors.embedded_direct_amount}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <LabeledTextField
                    type="text"
                    caption="Source"
                    defination="ระบุแหล่งที่มาของข้อมูล"
                    label=""
                    name="embedded_direct_source"
                    value={formValues.embedded_direct_source}
                    onChange={handleInputChange}
                    error={formErrors.embedded_direct_source}
                  />
                </div>
              </div>
            </Box>

            <div style={{ textAlign: "left", marginBottom: "1.5rem" }}>
              <strong>
                Specific electricity consumption (for SEE (indirect))
              </strong>
            </div>
            <Box mb={3}>
              <div
                style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}
              >
                <div style={{ flex: 1 }}>
                  <LabeledTextField
                    type="number"
                    caption="Amount"
                    defination="กรอกเป็นค่าตัวเลขของ SEE indirect ของวัตถุดิบตั้งต้น"
                    label=""
                    name="electric_consumption_amount"
                    value={formValues.electric_consumption_amount}
                    onChange={handleInputChange}
                    error={formErrors.electric_consumption_amount}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <LabeledAutocomplete
                    caption="Source"
                    defination="ระบุแหล่งที่มาของข้อมูล"
                    label=""
                    name="electric_consumption_source"
                    value={formValues.electric_consumption_source}
                    options={eleconsumption.map((c) => c.name)}
                    onChange={(val) =>
                      handleAutocompleteChange(
                        "electric_consumption_source",
                        val
                      )
                    }
                    error={formErrors.electric_consumption_source}
                  />
                </div>
              </div>
            </Box>

            <div style={{ textAlign: "left", marginBottom: "1.5rem" }}>
              <strong>Electricity emission factor (for SEE (indirect))</strong>
            </div>
            <Box mb={3}>
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
            </Box>
            <Box mb={3}>
              <LabeledTextField
                caption="Source"
                defination="ระบุแหล่งที่มาของข้อมูล"
                label=""
                name="embedded_indirect_amount"
                value={formValues.embedded_indirect_amount}
                onChange={handleInputChange}
                error={formErrors.electricity_emission_source}
                readOnly
              />

              <LabeledAutocomplete
                caption="Justification for use of default values (if relevant)"
                defination="กรอกเหตุผลในการใช้ค่ากลาง (ถ้าเกี่ยวข้อง)"
                label=""
                name="justification"
                value={formValues.justification}
                options={justification.map((c) => c.name)}
                onChange={(val) =>
                  handleAutocompleteChange("justification", val)
                }
                error={formErrors.justification}
              />
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
