import React, { useState, useEffect } from "react";
import { Container, Grid, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { useNavigate, useLocation } from "react-router-dom";
import Section from "../components/Section";
import PGButton from "../components/FormButton";
import LabeledAutocomplete from "../components/LabeledAutoComplete";
import LabeledTextField from "../components/LabeledTextField";
import LabeledAutocompleteMap from "../components/LabeledAutoCompleteMap";


import {
  fetchCountries,
  CountryOption,
} from "../components/dropdown/contriesmap";

interface VerifierFormProps {
  data: {
    installation_name: string,
    address: string,
    city: string,
    country_id: string,
    post_code: string,
    authorized_rep_id: string,
    accreditation_state: string,
    accreditation_national_body: string,
    registration_no: string,
    name: string,
    email: string,
    phone: string,
    fax: string,

  }
  onChange: (data: any) => void;
  onNextStep: () => void;
}



const VerifierForm: React.FC<VerifierFormProps> = ({ data, onChange, onNextStep }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const reportId = location.state?.reportId;
  const [formValues, setFormValues] = useState({
    installation_name: "",
    address: "",
    city: "",
    country_id: "",
    post_code: "",
    authorized_rep_id: "",
    accreditation_state: "",
    accreditation_national_body: "",
    registration_no: "",
    name: "",
    email: "",
    phone: "",
    fax: "",
  });



  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [countries, setCountries] = useState<CountryOption[]>([]);

  useEffect(() => {
    setFormValues(data);
  }, [data]);

  useEffect(() => {
    const loadCountries = async () => {
      const fetched = await fetchCountries();
      setCountries(fetched);
      const defaultThailand = fetched.find((c) => c.label === "Thailand");
      if (defaultThailand) {
        setFormValues((prev) => ({
          ...prev,
          country_id: String(defaultThailand.value),
        }));
      }
    };
    loadCountries();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => {
      const newData = { ...prev, [name]: value };
      onChange(newData);  // แจ้ง parent
      return newData;
    });
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAutocompleteChange = (name: string, val: string) => {
    setFormValues((prev) => {
      const newData = { ...prev, [name]: val };
      onChange(newData);  // แจ้ง parent
      return newData;
    });
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields = [
      "installation_name",
      "address",
      "city",
      "post_code",
      "country_id",
      "name",
      "email",
      "phone",
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
      if (errorElement) errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    try {
      // POST authorised representative
      const authorisedRes = await fetch("http://localhost:5000/api/cbam/authorised", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formValues.name,
          email: formValues.email,
          phone: formValues.phone,
          fax: formValues.fax,
        }),
      });

      if (!authorisedRes.ok) throw new Error("Failed to create authorised representative");
      const authorisedData = await authorisedRes.json();
      const authorisedId = authorisedData.id;
      console.log("✅ Authorised Representative Created:", authorisedId);

      // POST verifier with authorised_rep_id
      const verifierRes = await fetch("http://localhost:5000/api/cbam/verifier/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formValues.installation_name,
          address: formValues.address || null,
          city: formValues.city,
          country_id: Number(formValues.country_id),
          post_code: formValues.post_code,
          authorized_rep_id: authorisedId,
          accreditation_state: formValues.accreditation_state || null,
          accreditation_national_body: formValues.accreditation_national_body || null,
          registration_no: formValues.registration_no || null,
        }),
      });

      if (!verifierRes.ok) throw new Error("Failed to create verifier");
      const verifierData = await verifierRes.json();
      const verifierId = verifierData.id;
      console.log("✅ Verifier Created:", verifierId);

      // GET verifier details
      const getVerifier = await fetch(
        `http://localhost:5000/api/cbam/verifier/detail/${verifierId}`
      );
      const verifierDetails = await getVerifier.json();
      console.log("📥 Verifier Details:", verifierDetails);

      // PUT update report
      const putRes = await fetch(`http://localhost:5000/api/cbam/report/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verifier_id: verifierId }),
      });

      if (!putRes.ok) throw new Error("Failed to update report with verifier_id");
      console.log("✅ Report updated with verifier_id");

      // navigate(redirectPath);
    } catch (error) {
      console.error("❌ Error:", error);
    }
    onNextStep?.();
  };

  return (
    <Container maxWidth="md" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="#1976d2">
              Verifier of the report
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Only if available and not required during transitional period
            </Typography>
          </Box>

          <Section title="Verifier Info" subtitle="ชื่อและที่อยู่ผู้ทวนสอบ" hasError={false}>
            <LabeledTextField
              caption="Name of the verifier"
              label=""
              name="installation_name"
              value={formValues.installation_name}
              onChange={handleInputChange}
              error={formErrors.installation_name}
            />
            <LabeledTextField
              caption="Street, Number"
              label=""
              name="address"
              value={formValues.address}
              onChange={handleInputChange}
              error={formErrors.address}
            />
            <LabeledTextField
              caption="City"
              label=""
              name="city"
              value={formValues.city}
              onChange={handleInputChange}
              error={formErrors.city}
            />
            <LabeledTextField
              caption="Post Code"
              label=""
              name="post_code"
              value={formValues.post_code}
              onChange={handleInputChange}
              error={formErrors.post_code}
            />
            <LabeledAutocompleteMap
              caption="Country"
              label=""
              defination="ประเทศ"
              name="country_id"
              options={countries.map((c) => ({ ...c, value: String(c.value) }))}
              value={formValues.country_id}
              onChange={(val) =>
                setFormValues((prev) => ({
                  ...prev,
                  country_id: String(val),
                }))
              }
              error={formErrors.country_id}
            />
          </Section>

          <Section title="Authorised Representative" subtitle="" hasError={false}>
            <LabeledTextField
              caption="Name"
              label=""
              name="name"
              value={formValues.name}
              onChange={handleInputChange}
              error={formErrors.name}
            />
            <LabeledTextField
              caption="Email"
              label=""
              name="email"
              value={formValues.email}
              onChange={handleInputChange}
              error={formErrors.email}
            />
            <LabeledTextField
              caption="Phone"
              label=""
              name="phone"
              value={formValues.phone}
              onChange={handleInputChange}
              error={formErrors.phone}
            />
            <LabeledTextField
              caption="Fax"
              label=""
              name="fax"
              value={formValues.fax}
              onChange={handleInputChange}
              error={formErrors.fax}
            />
          </Section>

          <Section title="Accreditation Info" subtitle="" hasError={false}>
            <LabeledAutocomplete
              caption="Accreditation Member State"
              label=""
              name="accreditation_state"
              value={formValues.accreditation_state}
              options={countries.map((c) => c.label)}
              onChange={(val) => handleAutocompleteChange("accreditation_state", val)}
              error={formErrors.accreditation_state}
            />
            <LabeledTextField
              caption="National Accreditation Body"
              label=""
              name="accreditation_national_body"
              value={formValues.accreditation_national_body}
              onChange={handleInputChange}
              error={formErrors.accreditation_national_body}
            />
            <LabeledTextField
              caption="Registration Number"
              label=""
              name="registration_no"
              value={formValues.registration_no}
              onChange={handleInputChange}
              error={formErrors.registration_no}
            />
          </Section>

          <PGButton />
        </Grid>
      </form>
    </Container>
  );
};

export default VerifierForm;
