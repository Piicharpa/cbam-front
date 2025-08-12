import React, { useState, useEffect } from "react";
import { Container, Grid, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
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
    installation_name: string;
    address: string;
    city: string;
    country_id: string;
    post_code: string;
    authorized_rep_id: string;
    accreditation_state: string;
    accreditation_national_body: string;
    registration_no: string;
    name: string;
    email: string;
    phone: string;
    fax: string;
  };
  onChange: (data: any) => void;
  onSave?: () => void; // ✅ เพิ่ม onSave callback
  onNextStep: () => void;
}

const VerifierForm: React.FC<VerifierFormProps> = ({
  data,
  onChange,
  onSave, // ✅ รับ onSave prop
  onNextStep,
}) => {
  const navigate = useNavigate();
  // Get reportId from localStorage (same as InstallationForm)
  const storedReportId = localStorage.getItem("reportId");
  const reportId = storedReportId ? parseInt(storedReportId) : null;
  const companyId = (() => {
  const data = localStorage.getItem("user_account");
  if (!data) return null;
  try {
    const parsed = JSON.parse(data);
    return parsed.company?.[0]?.company_id || null;
  } catch {
    return null;
  }
})();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [existingData, setExistingData] = useState<any>(null);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formMode, setFormMode] = useState<"edit" | "create" | "empty">(
    "empty"
  );

  // Initialize form values
  const [formValues, setFormValues] = useState({
    installation_name: data.installation_name || "",
    address: data.address || "",
    city: data.city || "",
    country_id: data.country_id || "",
    post_code: data.post_code || "",
    authorized_rep_id: data.authorized_rep_id || "",
    accreditation_state: data.accreditation_state || "",
    accreditation_national_body: data.accreditation_national_body || "",
    registration_no: data.registration_no || "",
    name: data.name || "",
    email: data.email || "",
    phone: data.phone || "",
    fax: data.fax || "",
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // ✅ ฟังก์ชันสำหรับดึงข้อมูล authorized representative
  const fetchAuthorizedRepresentative = async (authorizedRepId: number) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/cbam/authorised/${authorizedRepId}`
      );

      if (!response.ok) {
        throw new Error(
          `Error fetching authorized representative: ${response.statusText}`
        );
      }

      const authorizedData = await response.json();

      // Return the authorized data (could be array or object)
      return Array.isArray(authorizedData) ? authorizedData[0] : authorizedData;
    } catch (error) {
      console.error("❌ Error fetching authorized representative:", error);
      return null;
    }
  };

  // 🔍 Fetch specific verifier data (for EDIT mode)
  const fetchVerifierData = async (verifierId: number) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/cbam/verifier/detail/${verifierId}`
      );

      if (!response.ok) {
        throw new Error(`Error fetching verifier: ${response.statusText}`);
      }

      const verifierDataArray = await response.json();

      if (verifierDataArray && verifierDataArray.length > 0) {
        const verifierData = verifierDataArray[0];

        // ✅ ดึงข้อมูล authorized representative ถ้ามี authorized_rep_id
        let authorizedRepData = null;
        if (verifierData.authorized_rep_id) {
          authorizedRepData = await fetchAuthorizedRepresentative(
            verifierData.authorized_rep_id
          );
        }

        // Update form values with existing verifier data
        const updatedFormValues = {
          installation_name: verifierData.name || "",
          address: verifierData.address || "",
          city: verifierData.city || "",
          country_id: verifierData.country_id
            ? String(verifierData.country_id)
            : "",
          post_code: verifierData.post_code || "",
          authorized_rep_id: verifierData.authorized_rep_id
            ? String(verifierData.authorized_rep_id)
            : "",
          accreditation_state: verifierData.accreditation_state || "",
          accreditation_national_body:
            verifierData.accreditation_national_body || "",
          registration_no: verifierData.registration_no || "",
          // ✅ ใช้ข้อมูลจาก authorized representative ที่ดึงมา
          name:
            authorizedRepData?.name || verifierData.authorizedRep?.name || "",
          email:
            authorizedRepData?.email || verifierData.authorizedRep?.email || "",
          phone:
            authorizedRepData?.phone || verifierData.authorizedRep?.phone || "",
          fax: authorizedRepData?.fax || verifierData.authorizedRep?.fax || "",
        };

        setFormValues(updatedFormValues);
        onChange(updatedFormValues);
        setFormMode("edit");
        return verifierData.id;
      }
    } catch (error) {
      console.error("❌ Error fetching verifier data:", error);
    }
    return null;
  };

  // 🏢 Fetch latest verifier from company (for CREATE mode)
  const fetchLatestCompanyVerifier = async (companyId: number) => {
    try {
      // Get all company reports first
      const response = await fetch(
        `${apiUrl}/api/cbam/report/company/${companyId}`
      );

      if (!response.ok) {
        throw new Error(
          `Error fetching company reports: ${response.statusText}`
        );
      }

      const reports = await response.json();

      if (reports && reports.length > 0) {
        // Take the last item as requested
        const latestreport = reports[reports.length - 1];

        // ✅ เช็คว่ามี verifier_id หรือไม่
        const latestVerifierId = latestreport.verifier_id; // แก้ชื่อตัวแปร

        if (!latestVerifierId) {
          setFormMode("empty");
          return;
        }

        // ✅ ดึงข้อมูล verifier
        const latestdata_response = await fetch(
          `${apiUrl}/api/cbam/verifier/${latestVerifierId}`
        );

        if (!latestdata_response.ok) {
          throw new Error(
            `Error fetching latest verifier: ${latestdata_response.statusText}`
          );
        }

        const latestdata = await latestdata_response.json();

        // ✅ ดึงข้อมูล authorized representative สำหรับ CREATE mode
        let authorizedRepData = null;
        if (latestdata.authorized_rep_id) {
          authorizedRepData = await fetchAuthorizedRepresentative(
            latestdata.authorized_rep_id
          );
        }

        // Update form with basic info but set dates to today
        const updatedFormValues = {
          installation_name: latestdata.name || "",
          address: latestdata.address || "",
          city: latestdata.city || "",
          country_id: latestdata.country_id
            ? String(latestdata.country_id)
            : "",
          post_code: latestdata.post_code || "",
          authorized_rep_id: latestdata.authorized_rep_id
            ? String(latestdata.authorized_rep_id)
            : "",
          accreditation_state: latestdata.accreditation_state || "",
          accreditation_national_body:
            latestdata.accreditation_national_body || "",
          registration_no: latestdata.registration_no || "",
          // ✅ ใช้ข้อมูลจาก authorized representative ที่ดึงมา
          name: authorizedRepData?.name || latestdata.authorizedRep?.name || "",
          email:
            authorizedRepData?.email || latestdata.authorizedRep?.email || "",
          phone:
            authorizedRepData?.phone || latestdata.authorizedRep?.phone || "",
          fax: authorizedRepData?.fax || latestdata.authorizedRep?.fax || "",
        };

        setFormValues(updatedFormValues);
        onChange(updatedFormValues);
        setFormMode("create");
      } else {
        setFormMode("empty");
      }
    } catch (error) {
      console.error("❌ Error fetching latest verifier:", error);
      setFormMode("empty");
    }
  };

  // 🔍 Main data loading logic (same pattern as InstallationForm)
  useEffect(() => {
    const loadVerifierData = async () => {
      setIsLoading(true);
      try {
        // Case 1: No reportId - show empty form
        if (!reportId) {
          setFormMode("empty");
          setIsLoading(false);
          return;
        }

        // Case 2: Fetch report data to check if it has verifier_id
        const reportResponse = await fetch(
          `${apiUrl}/api/cbam/report/${reportId}`
        );

        if (!reportResponse.ok) {
          throw new Error(
            `Failed to fetch report: ${reportResponse.statusText}`
          );
        }

        const reportData = await reportResponse.json();

        if (reportData && reportData.length > 0) {
          const report = reportData[0];
          setExistingData(report);

          if (report.verifier_id) {
            // ✅ SCENARIO 1: EDIT MODE - Report has verifier_id

            await fetchVerifierData(report.verifier_id);
          } else {
            // ✅ SCENARIO 2: CREATE MODE - Report has no verifier_id

            await fetchLatestCompanyVerifier(companyId);
          }
        } else {
          setFormMode("empty");
        }
      } catch (error) {
        console.error("❌ Error in main data loading:", error);
        await fetchLatestCompanyVerifier(companyId);
      } finally {
        setIsLoading(false);
      }
    };

    loadVerifierData();
  }, [apiUrl, reportId, companyId]);

  // Load countries
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const result = (await fetchCountries()) as {
          countries: CountryOption[];
          defaultCountry: CountryOption | null;
        };
        setCountries(result.countries);

        // Auto-select Thailand as default if none selected
        const defaultThailand = result.countries.find(
          (c) => c.label === "Thailand"
        );
        if (defaultThailand && !formValues.country_id) {
          const defaultCountryData = {
            ...formValues,
            country_id: String(defaultThailand.value),
          };
          setFormValues((prev) => ({
            ...prev,
            country_id: String(defaultThailand.value),
          }));
          onChange(defaultCountryData);
        }
      } catch (error) {
        console.error("❌ Error loading countries:", error);
      }
    };
    loadCountries();
  }, []);

  // Handle form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Update parent component
    const updatedFormValues = {
      ...formValues,
      [name]: value,
    };
    onChange(updatedFormValues);
  };

  // Handle country selection
  const handleCountryChange = (
    countryValue: string | number | (string | number)[]
  ) => {
    const value = String(countryValue);
    const updatedFormValues = {
      ...formValues,
      country_id: value,
    };
    setFormValues(updatedFormValues);
    onChange(updatedFormValues);

    // Clear country error
    if (formErrors.country_id) {
      setFormErrors((prev) => ({ ...prev, country_id: "" }));
    }
  };

  // Handle other field changes (for autocomplete, etc.)
  const handleFieldChange = (name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
    const updatedFormValues = {
      ...formValues,
      [name]: value,
    };
    onChange(updatedFormValues);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // 1. Create/Update Authorized Representative
      let authorizedId = formValues.authorized_rep_id;
      const authorizedPayload = {
        name: formValues.name || null,
        email: formValues.email || null,
        phone: formValues.phone || null,
        fax: formValues.fax || null,
      };

      const authorizedMethod = authorizedId ? "PUT" : "POST";
      const authorizedUrl = authorizedId
        ? `${apiUrl}/api/cbam/authorised/${authorizedId}`
        : `${apiUrl}/api/cbam/authorised`;

      const authorizedResponse = await fetch(authorizedUrl, {
        method: authorizedMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authorizedPayload),
      });

      if (!authorizedResponse.ok) {
        const errorText = await authorizedResponse.text();
        console.error("❌ Authorized representative error:", errorText);
        throw new Error(
          `Cannot ${
            authorizedMethod === "PUT" ? "update" : "create"
          } authorized representative`
        );
      }

      const authorizedResult = await authorizedResponse.json();

      // Get authorized ID
      authorizedId = authorizedResult.id || authorizedId;

      // 2. Create/Update Verifier
      const verifierPayload = {
        name: formValues.installation_name || null,
        address: formValues.address || null,
        city: formValues.city || null,
        country_id: Number(formValues.country_id) || null,
        post_code: formValues.post_code || null,
        authorized_rep_id: authorizedId || null,
        accreditation_state: formValues.accreditation_state || null,
        accreditation_national_body:
          formValues.accreditation_national_body || null,
        registration_no: formValues.registration_no || null,
      };

      let verifierResponse;
      let newVerifierId;

      if (formMode === "edit" && existingData?.verifier_id) {
        // UPDATE existing verifier
        verifierResponse = await fetch(
          `${apiUrl}/api/cbam/verifier/${existingData.verifier_id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(verifierPayload),
          }
        );
        newVerifierId = existingData.verifier_id;
      } else {
        // CREATE new verifier
        verifierResponse = await fetch(`${apiUrl}/api/cbam/verifier/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(verifierPayload),
        });
      }

      if (!verifierResponse.ok) {
        const errorText = await verifierResponse.text();
        console.error(
          `❌ Verifier ${formMode === "edit" ? "update" : "create"} error:`,
          errorText
        );
        throw new Error(
          `Cannot ${formMode === "edit" ? "update" : "create"} verifier`
        );
      }

      const verifierResult = await verifierResponse.json();

      // Get verifier ID (for new verifiers)
      if (formMode !== "edit") {
        newVerifierId = verifierResult.id;
      }

      // 3. Update Report with verifier_id
      if (reportId) {
        const reportUpdatePayload = {
          verifier_id: newVerifierId,
        };

        const reportUpdateResponse = await fetch(
          `${apiUrl}/api/cbam/report/${reportId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reportUpdatePayload),
          }
        );

        if (!reportUpdateResponse.ok) {
          const errorText = await reportUpdateResponse.text();
          console.error("❌ Report update error:", errorText);
          
        } else {
          const reportResult = await reportUpdateResponse.json();

          // Ensure localStorage has the correct reportId
          localStorage.setItem("reportId", String(reportId));

          // ✅ เรียก onSave callback เมื่อ save สำเร็จ
          if (onSave) {
            onSave();
          }

          // Success message
          const modeText = formMode === "edit" ? "updated" : "created";
        
        }
      }

     
      onNextStep();
    } catch (err: any) {
      console.error("❌ Form submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <Container
        maxWidth="md"
        style={{ paddingTop: "2rem", textAlign: "center" }}
      >
        <Typography variant="h6" gutterBottom>
          🔍 Loading verifier data...
        </Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="md"
      style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
    >
      <form onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          {/* Header Section */}
          <Grid size={12}>
            <Typography
              variant="h5"
              fontSize="32px"
              fontWeight="bold"
              gutterBottom
              color="#1976d2"
            >
              Verifier of the report
            </Typography>
            <Typography
              variant="subtitle1"
              fontSize="22px"
              color="text.secondary"
              gutterBottom
            >
              Only if available and not required during transitional period
            </Typography>
          </Grid>

          {/* Verifier Information Section */}
          <Grid size={12}>
            <Section
              title="Verifier Info"
              subtitle="ชื่อและที่อยู่ผู้ทวนสอบ"
              hasError={Object.values(formErrors).some((e) => !!e)}
              defaultExpanded={true}
            >
              <Grid container spacing={2}>
                <Grid size={12}>
                  <LabeledTextField
                    caption="Company Name"
                    defination="ระบุชื่อบริษัททวนสอบ"
                    label=""
                    name="installation_name"
                    value={formValues.installation_name}
                    onChange={handleInputChange}
                    error={!!formErrors.installation_name}
                    helperText={formErrors.installation_name || ""}
                  />
                </Grid>
                <Grid size={12}>
                  <LabeledTextField
                    caption="Street, Number"
                    defination="ระบุถนน เลขที่"
                    label=""
                    name="address"
                    value={formValues.address}
                    onChange={handleInputChange}
                    error={!!formErrors.address}
                    helperText={formErrors.address || ""}
                  />
                </Grid>
                <Grid size={12}>
                  <LabeledTextField
                    caption="City"
                    defination="เมือง/จังหวัด"
                    label=""
                    name="city"
                    value={formValues.city}
                    onChange={handleInputChange}
                    error={!!formErrors.city}
                    helperText={formErrors.city || ""}
                  />
                </Grid>
                <Grid size={12}>
                  <LabeledTextField
                    caption="Post Code"
                    defination="รหัสไปรษณีย์"
                    label=""
                    name="post_code"
                    value={formValues.post_code}
                    onChange={handleInputChange}
                    error={!!formErrors.post_code}
                    helperText={formErrors.post_code || ""}
                  />
                </Grid>
                <Grid size={12}>
                  <LabeledAutocompleteMap
                    caption="Country"
                    defination="เลือกประเทศ"
                    label=""
                    name="country_id"
                    options={countries.map((c) => ({
                      ...c,
                      value: String(c.value),
                    }))}
                    value={formValues.country_id}
                    onChange={handleCountryChange}
                    error={formErrors.country_id || ""}
                  />
                </Grid>
              </Grid>
            </Section>
          </Grid>

          {/* Authorized Representative Section */}
          <Grid size={12}>
            <Section
              title="Authorised Representative"
              subtitle="ผู้มีอำนาจลงนามของบริษัททวนสอบ"
              hasError={false}
              defaultExpanded={true}
            >
              <Grid container spacing={2}>
                <Grid size={12}>
                  <LabeledTextField
                    caption="Name"
                    defination="ระบุชื่อผู้มีอำนาจลงนาม"
                    label=""
                    name="name"
                    value={formValues.name}
                    onChange={handleInputChange}
                    error={!!formErrors.name}
                    helperText={formErrors.name || ""}
                  />
                </Grid>
                <Grid size={12}>
                  <LabeledTextField
                    type="email"
                    caption="Email"
                    defination="ระบุอีเมล"
                    label=""
                    name="email"
                    value={formValues.email}
                    onChange={handleInputChange}
                    error={!!formErrors.email}
                    helperText={formErrors.email || ""}
                  />
                </Grid>
                <Grid size={12}>
                  <LabeledTextField
                    type="tel"
                    caption="Phone"
                    defination="ระบุหมายเลขโทรศัพท์"
                    label=""
                    name="phone"
                    value={formValues.phone}
                    onChange={handleInputChange}
                    error={!!formErrors.phone}
                    helperText={formErrors.phone || ""}
                  />
                </Grid>
                <Grid size={12}>
                  <LabeledTextField
                    caption="Fax"
                    defination="ระบุเลขแฟกซ์"
                    label=""
                    name="fax"
                    value={formValues.fax}
                    onChange={handleInputChange}
                    error={!!formErrors.fax}
                    helperText={formErrors.fax || ""}
                  />
                </Grid>
              </Grid>
            </Section>
          </Grid>

          {/* Accreditation Information Section */}
          <Grid size={12}>
            <Section
              title="Accreditation Info"
              subtitle="ข้อมูลการรับรอง"
              hasError={false}
              defaultExpanded={true}
            >
              <Grid container spacing={2}>
                <Grid size={12}>
                  <LabeledAutocomplete
                    caption="Accreditation Member State"
                    defination="ระบุประเทศที่ให้การรับรอง"
                    label=""
                    name="accreditation_state"
                    value={formValues.accreditation_state}
                    options={countries.map((c) => c.label)}
                    onChange={(val) =>
                      handleFieldChange("accreditation_state", val)
                    }
                    error={formErrors.accreditation_state}
                  />
                </Grid>
                <Grid size={12}>
                  <LabeledTextField
                    caption="National Accreditation Body"
                    defination="ระบุชื่อหน่วยงานรับรองมาตราฐานแห่งชาติ"
                    label=""
                    name="accreditation_national_body"
                    value={formValues.accreditation_national_body}
                    onChange={handleInputChange}
                    error={!!formErrors.accreditation_national_body}
                    helperText={formErrors.accreditation_national_body || ""}
                  />
                </Grid>
                <Grid size={12}>
                  <LabeledTextField
                    caption="Registration Number"
                    defination="ระบุเลขที่การรับรอง"
                    label=""
                    name="registration_no"
                    value={formValues.registration_no}
                    onChange={handleInputChange}
                    error={!!formErrors.registration_no}
                    helperText={formErrors.registration_no || ""}
                  />
                </Grid>
              </Grid>
            </Section>
          </Grid>

          {/* Submit Button */}
          <Grid size={12}>
            <Box display="flex" justifyContent="center" mt={2}>
              <PGButton
                text={formMode === "edit" ? "Save" : "Save"}
                loading={isSubmitting}
                type="submit"
              />
            </Box>
          </Grid>

          {/* ✅ Show success message after save */}
          {onSave && (
            <Grid size={12}>
              <Box mt={2} textAlign="center">
                <Typography variant="caption" color="text.secondary">
                  Click "Save Verifier" to save your changes, then use "Continue
                  to Next Step" to proceed
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </form>
    </Container>
  );
};

export default VerifierForm;
