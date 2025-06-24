import React, { useState, useEffect } from "react";
import { Container, Typography, Grid, Box } from "@mui/material";
import Section from "../components/Section";
import PGButton from "../components/FormButton";
import { useNavigate, useLocation } from "react-router-dom";
import LabeledTextField from "../components/LabeledTextField";
import LabeledAutocompleteMap from "../components/LabeledAutoCompleteMap";
import { justification } from "../components/dropdown/justification";
import LabeledAutoComplete from "../components/LabeledAutoComplete";

interface AmountFormProps {
  data: {
    id: string;
    embedded_direct_emissions_value: string;
    source_embedded_direct_emissions: string;
    embedded_indirection_emissions_value: string;
    source_embedded_indirect_emissions: string;
    justification_for_use_default_values: string;
  };
  onChange: (data: AmountFormProps["data"]) => void;
  onNextStep: () => void;
}

const AmountForm: React.FC<AmountFormProps> = ({
  data,
  onChange,
  onNextStep,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const reportId = localStorage.getItem("reportId");
  const percursorId =
    location.state?.precursorId || localStorage.getItem("precursorId");

  const [formValues, setFormValues] = useState({
    id: data.id || "",
    embedded_direct_emissions_value: data.embedded_direct_emissions_value || "",
    source_embedded_direct_emissions: data.source_embedded_direct_emissions || "",
    embedded_indirection_emissions_value: data.embedded_indirection_emissions_value || "",
    source_embedded_indirect_emissions: data.source_embedded_indirect_emissions || "",
    justification_for_use_default_values: data.justification_for_use_default_values || "",
  });
  
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;

  // โหลดข้อมูลจาก localStorage เมื่อเริ่มต้น
  useEffect(() => {
    const savedData = localStorage.getItem("amountFormData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormValues(prev => ({
          ...prev,
          ...parsedData,
        }));
      } catch (e) {
        console.error("Error parsing saved amount data", e);
      }
    }
  }, [percursorId]);

  // บันทึกข้อมูลไปยัง localStorage เมื่อ formValues เปลี่ยนแปลง
  useEffect(() => {
    if (formValues) {
      localStorage.setItem("amountFormData", JSON.stringify(formValues));
    }
  }, [formValues]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
    onChange({ ...formValues, [name]: value });
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const requiredFields = [
      "embedded_direct_emissions_value",
      "source_embedded_direct_emissions",
      "embedded_indirection_emissions_value",
      "source_embedded_indirect_emissions",
      "justification_for_use_default_values",
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
      const updateId = percursorId;
      const payload = {
        id: updateId,
        embedded_direct_emissions_value: formValues.embedded_direct_emissions_value || "",
        source_embedded_direct_emissions: formValues.source_embedded_direct_emissions || "",
        embedded_indirection_emissions_value: formValues.embedded_indirection_emissions_value || "",
        source_embedded_indirect_emissions: formValues.source_embedded_indirect_emissions || "",
        justification_for_use_default_values: formValues.justification_for_use_default_values || "",
      };

      const response = await fetch(
        `${apiUrl}/api/cbam/e_precursors/${updateId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`PUT Error: ${errText}`);
      }

      onNextStep?.();

      const getRes = await fetch(`${apiUrl}/api/cbam/e_precursors/${updateId}`);
      if (!getRes.ok) {
        const errText = await getRes.text();
        throw new Error(`GET Error: ${errText}`);
      }

      const detailData = await getRes.json();
    } catch (error: any) {
      console.error("❌ Error ใน PUT หรือ GET:", error.message || error);
    }
  };

  // Utility function to update formValues state
  function setValues(
    updater: (prev: typeof formValues) => typeof formValues
  ): void {
    setFormValues(updater);
  }

  return (
    <Container
      maxWidth="md"
      style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
    >
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3} alignItems="stretch">
          <Box>
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              color="#1976d2"
            >
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
                Specific embedded direct emissions (SEE (direct)) Unit: tCO2e/t{" "}
              </strong>
            </div>
            <Box mb={3}>
              <div
                style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <LabeledTextField
                    type="number"
                    caption=""
                    defination="กรอกเป็นตัวเลขของค่า SEE direct ของวัตถุดิบตั้งต้น"
                    label=""
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
                    label=""
                    name="source_embedded_direct_emissions"
                    options={[
                      { label: "", value: "Source" },
                      { label: "Measured", value: "Measured" },
                      { label: "Default", value: "Default" },
                      { label: "Unknown", value: "Unknown" },
                    ]}
                    value={formValues.source_embedded_direct_emissions}
                    error={formErrors.source_embedded_direct_emissions}
                    onChange={(val: string | number | (string | number)[]) => {
                      let value: string;
                      if (Array.isArray(val)) {
                        value = val.length > 0 ? String(val[0]) : "";
                      } else {
                        value = typeof val === "string" ? val : String(val);
                      }
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
                Specific electricity consumption (for SEE (indirect)) Unit:
                MWh/t{" "}
              </strong>
            </div>
            <Box mb={3}>
              <div
                style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <LabeledTextField
                    type="number"
                    caption=""
                    defination="กรอกเป็นค่าตัวเลขของ SEE indirect ของวัตถุดิบตั้งต้น"
                    label=""
                    name="embedded_indirection_emissions_value"
                    value={formValues.embedded_indirection_emissions_value}
                    onChange={handleInputChange}
                    error={formErrors.embedded_indirection_emissions_value}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <LabeledAutocompleteMap
                    caption=""
                    defination="ระบุแหล่งที่มาของข้อมูล"
                    label=""
                    name="source_embedded_indirect_emissions"
                    options={[
                      { label: "", value: "Source" },
                      { label: "Measured", value: "Measured" },
                      { label: "Default", value: "Default" },
                      { label: "Unknown", value: "Unknown" },
                    ]}
                    value={formValues.source_embedded_indirect_emissions}
                    error={formErrors.source_embedded_indirect_emissions}
                    onChange={(val: string | number | (string | number)[]) => {
                      let value: string;
                      if (Array.isArray(val)) {
                        value = val.length > 0 ? String(val[0]) : "";
                      } else {
                        value = typeof val === "string" ? val : String(val);
                      }
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

            <Box mb={3}>
              <div
                style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}
              >
                <div style={{ flex: 1 }}>
                  <LabeledAutoComplete
                    caption=" Justification for use of default values (if relevant) "
                    defination="กรอกเหตุผลในการใช้ค่ากลาง (ถ้าเกี่ยวข้อง)"
                    label=""
                    name="justification_for_use_default_values"
                    options={justification.map((item) => item.name)}
                    value={formValues.justification_for_use_default_values}
                    error={formErrors.justification_for_use_default_values}
                    onChange={(val: string | number | (string | number)[]) => {
                      let value: string;
                      if (Array.isArray(val)) {
                        value = val.length > 0 ? String(val[0]) : "";
                      } else {
                        value = typeof val === "string" ? val : String(val);
                      }
                      setFormValues((prev) => ({
                        ...prev,
                        justification_for_use_default_values: value,
                      }));
                      setFormErrors((prev) => ({
                        ...prev,
                        justification_for_use_default_values: "",
                      }));
                    }}
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
