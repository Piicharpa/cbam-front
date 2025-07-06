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
  onNextStep: () => void;
}

const VerifierForm: React.FC<VerifierFormProps> = ({
  data,
  onChange,
  onNextStep,
}) => {
  const navigate = useNavigate();

  // Get reportId from localStorage (same as InstallationForm)
  const storedReportId = localStorage.getItem("reportId");
  const reportId = storedReportId ? parseInt(storedReportId, 10) : null;

  const companyId = 1;
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

  // 🔍 Fetch specific verifier data (for EDIT mode)
  const fetchVerifierData = async (verifierId: number) => {
    try {
      console.log(`🔍 Fetching verifier data for ID: ${verifierId}`);

      const response = await fetch(
        `${apiUrl}/api/cbam/verifier/detail/${verifierId}`
      );
      if (!response.ok) {
        throw new Error(`Error fetching verifier: ${response.statusText}`);
      }

      const verifierDataArray = await response.json();

      if (verifierDataArray && verifierDataArray.length > 0) {
        const verifierData = verifierDataArray[0];
        console.log("✅ Found verifier data for EDIT mode:", verifierData);

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
          name: verifierData.authorizedRep?.name || "",
          email: verifierData.authorizedRep?.email || "",
          phone: verifierData.authorizedRep?.phone || "",
          fax: verifierData.authorizedRep?.fax || "",
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
      console.log(`🔍 Fetching latest verifier for company: ${companyId}`);

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
        console.log(
          "✅ Found latest installation for CREATE mode:",
          latestreport
        );

        const latestverifierId = latestreport.verifier_id;

        const latestdata_response = await fetch(
          `${apiUrl}/api/cbam/verifier/${latestverifierId}`
        );

        const latestdata = await latestdata_response.json();

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
          // ✅ FIXED: Add missing required fields
          name: latestdata.authorizedRep?.name || "",
          email: latestdata.authorizedRep?.email || "",
          phone: latestdata.authorizedRep?.phone || "",
          fax: latestdata.authorizedRep?.fax || "",
        };

        setFormValues(updatedFormValues);
        onChange(updatedFormValues);
        setFormMode("create");
      } else {
        console.log("ℹ️ No previous installations found, showing empty form");
        setFormMode("empty");
      }
    } catch (error) {
      console.error("❌ Error fetching latest verifier:", error);
      console.log("ℹ️ Fallback to empty form");
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
          console.log("⚠️ No reportId found - showing empty form");
          setFormMode("empty");
          setIsLoading(false);
          return;
        }

        // Case 2: Fetch report data to check if it has verifier_id
        console.log(`🔍 Checking report ${reportId} for existing verifier`);

        const reportResponse = await fetch(
          `${apiUrl}/api/cbam/report/${reportId}`
        );
        if (!reportResponse.ok) {
          throw new Error(
            `Failed to fetch report: ${reportResponse.statusText}`
          );
        }

        const reportData = await reportResponse.json();
        console.log("📋 Report data:", reportData);

        if (reportData && reportData.length > 0) {
          const report = reportData[0];
          setExistingData(report);

          if (report.verifier_id) {
            // ✅ SCENARIO 1: EDIT MODE - Report has verifier_id
            console.log(
              "🔄 EDIT MODE: Report has verifier_id, fetching verifier data"
            );
            await fetchVerifierData(report.verifier_id);
          } else {
            // ✅ SCENARIO 2: CREATE MODE - Report has no verifier_id
            console.log(
              "🆕 CREATE MODE: Report has no verifier_id, fetching latest company verifier"
            );
            await fetchLatestCompanyVerifier(companyId);
          }
        } else {
          console.log("⚠️ No report data found - showing empty form");
          setFormMode("empty");
        }
      } catch (error) {
        console.error("❌ Error in main data loading:", error);
        console.log("🔄 Fallback: trying to get latest company verifier");
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
        console.log(`✅ Loaded ${result.countries.length} countries`);

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

      console.log(
        `📤 ${authorizedMethod} Authorized Representative:`,
        authorizedPayload
      );

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
      console.log("✅ Authorized representative saved:", authorizedResult);

      // Get authorized ID
      authorizedId = authorizedResult.id || authorizedId;

      // 2. Create/Update Verifier
      console.log(`📤 ${formMode.toUpperCase()} MODE: Saving verifier data`);

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
        console.log(`🔄 Updating verifier ID: ${existingData.verifier_id}`);

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
        console.log("🆕 Creating new verifier");

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
      console.log("✅ Verifier saved successfully:", verifierResult);

      // Get verifier ID (for new verifiers)
      if (formMode !== "edit") {
        newVerifierId = verifierResult.id;
      }

      // 3. Update Report with verifier_id
      if (reportId) {
        console.log(
          `🔗 Updating report ${reportId} with verifier_id: ${newVerifierId}`
        );

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

          // Show partial success message
          alert(
            `✅ Verifier data saved successfully!\n` +
              `⚠️ But could not update report: ${errorText}\n` +
              `You may need to link the verifier manually.`
          );
        } else {
          const reportResult = await reportUpdateResponse.json();
          console.log(
            "✅ Report updated successfully with verifier_id:",
            reportResult
          );

          // Ensure localStorage has the correct reportId
          localStorage.setItem("reportId", String(reportId));
          localStorage.setItem("cbam_report_id", String(reportId));

          // Success message
          const modeText = formMode === "edit" ? "updated" : "created";
          alert(
            `✅ Success!\n` +
              `👨‍💼 Verifier ${modeText} successfully\n` +
              `🔗 Report #${reportId} linked with verifier\n` +
              `📋 Ready for next step`
          );
        }
      }

      // Move to next step
      onNextStep();
    } catch (err: any) {
      console.error("❌ Form submission error:", err);
      alert(`❌ Error: ${err.message}`);
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
              fontWeight="bold"
              gutterBottom
              color="#1976d2"
            >
              Verifier of the report
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Only if available and not required during transitional period
            </Typography>

            {/* Mode Indicator */}
            <Box
              mt={2}
              p={2}
              sx={{
                backgroundColor:
                  formMode === "edit"
                    ? "#fff3e0"
                    : formMode === "create"
                    ? "#e8f5e8"
                    : "#f0f8ff",
                borderRadius: 1,
                border: `1px solid ${
                  formMode === "edit"
                    ? "#ffcc02"
                    : formMode === "create"
                    ? "#4caf50"
                    : "#2196f3"
                }`,
              }}
            >
              {formMode === "edit" && (
                <>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    color="#f57c00"
                  >
                    🔄 EDIT MODE
                  </Typography>
                  <Typography variant="body2">
                    Editing existing verifier (ID: {existingData?.verifier_id})
                  </Typography>
                </>
              )}

              {formMode === "create" && (
                <>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    color="#2e7d32"
                  >
                    🆕 CREATE MODE
                  </Typography>
                  <Typography variant="body2">
                    Creating new verifier (pre-filled with latest company data)
                  </Typography>
                </>
              )}

              {formMode === "empty" && (
                <>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    color="#1976d2"
                  >
                    📝 NEW FORM
                  </Typography>
                  <Typography variant="body2">
                    Creating new verifier (empty form)
                  </Typography>
                </>
              )}

              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Report ID:</strong> {reportId} |{" "}
                <strong>Company ID:</strong> {companyId}
              </Typography>

              {existingData && (
                <Box mt={1}>
                  <Typography variant="body2">
                    <strong>Industry:</strong>{" "}
                    {existingData.industry_type_name || "Not specified"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Goods:</strong>{" "}
                    {existingData.goods_category_name || "Not specified"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: existingData.verifier_id ? "green" : "orange",
                    }}
                  >
                    <strong>Verifier Status:</strong>{" "}
                    {existingData.verifier_id
                      ? `✅ Connected (ID: ${existingData.verifier_id})`
                      : "🆕 Not connected - Creating new verifier"}
                  </Typography>
                </Box>
              )}
            </Box>
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
                    caption="Name of the verifier"
                    defination="ชื่อองค์กรผู้ทวนสอบ"
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
                    defination="ถนน เลขที่"
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
              subtitle="ผู้มีอำนาจลงนาม"
              hasError={false}
              defaultExpanded={true}
            >
              <Grid container spacing={2}>
                <Grid size={12}>
                  <LabeledTextField
                    caption="Name"
                    defination="ชื่อผู้มีอำนาจลงนาม"
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
                    defination="อีเมล"
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
                    defination="หมายเลขโทรศัพท์"
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
                    defination="หมายเลขแฟกซ์"
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
                    defination="รัฐสมาชิกที่ให้การรับรอง"
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
                    defination="องค์กรรับรองแห่งชาติ"
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
                    defination="หมายเลขทะเบียน"
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
                text={
                  formMode === "edit" ? "Update Verifier" : "Create Verifier"
                }
                loading={isSubmitting}
                type="submit"
              />
            </Box>
          </Grid>

          {/* Debug Information - Development Only */}
          {/* {process.env.NODE_ENV === "development" && (
            <Grid size={12}>
              <Box
                mt={4}
                p={2}
                sx={{
                  backgroundColor: "#f5f5f5",
                  borderRadius: 1,
                  fontSize: "0.8rem",
                  border: "1px solid #ddd",
                }}
              >
                <details>
                  <summary
                    style={{
                      cursor: "pointer",
                      fontWeight: "bold",
                      marginBottom: "1rem",
                    }}
                  >
                    🐛 Debug Information (Development Mode)
                  </summary>

                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <Typography
                        variant="caption"
                        component="div"
                        fontWeight="bold"
                      >
                        Mode & IDs:
                      </Typography>
                      <Typography variant="caption" component="div">
                        <strong>Form Mode:</strong> {formMode}
                      </Typography>
                      <Typography variant="caption" component="div">
                        <strong>Report ID (localStorage):</strong>{" "}
                        {reportId || "not set"}
                      </Typography>
                      <Typography variant="caption" component="div">
                        <strong>Company ID:</strong> {companyId}
                      </Typography>
                      <Typography variant="caption" component="div">
                        <strong>Verifier ID:</strong>{" "}
                        {existingData?.verifier_id || "not set"}
                      </Typography>
                      <Typography variant="caption" component="div">
                        <strong>Authorized Rep ID:</strong>{" "}
                        {formValues.authorized_rep_id || "not set"}
                      </Typography>
                      <Typography variant="caption" component="div">
                        <strong>Loading:</strong> {isLoading ? "Yes" : "No"}
                      </Typography>
                      <Typography variant="caption" component="div">
                        <strong>Submitting:</strong>{" "}
                        {isSubmitting ? "Yes" : "No"}
                      </Typography>
                    </Grid>

                    <Grid size={12}>
                      <Typography
                        variant="caption"
                        component="div"
                        fontWeight="bold"
                      >
                        Form Status:
                      </Typography>
                      <Typography variant="caption" component="div">
                        <strong>Countries Loaded:</strong> {countries.length}
                      </Typography>
                      <Typography variant="caption" component="div">
                        <strong>Form Errors:</strong>{" "}
                        {Object.keys(formErrors).length}
                      </Typography>
                      <Typography
                        variant="caption"
                        component="div"
                        sx={{
                          color:
                            formMode === "edit"
                              ? "orange"
                              : formMode === "create"
                              ? "green"
                              : "blue",
                        }}
                      >
                        <strong>Action:</strong>{" "}
                        {formMode === "edit"
                          ? "Will UPDATE existing verifier"
                          : formMode === "create"
                          ? "Will CREATE new verifier"
                          : "Will CREATE new verifier (empty form)"}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box mt={2}>
                    <Typography
                      variant="caption"
                      component="div"
                      fontWeight="bold"
                    >
                      Existing Data:
                    </Typography>
                    <Box
                      component="pre"
                      sx={{
                        fontSize: "10px",
                        overflow: "auto",
                        maxHeight: "150px",
                        backgroundColor: "#fff",
                        p: 1,
                        border: "1px solid #ddd",
                        borderRadius: 1,
                        mt: 1,
                      }}
                    >
                      {JSON.stringify(existingData, null, 2)}
                    </Box>
                  </Box>

                  <Box mt={2}>
                    <Typography
                      variant="caption"
                      component="div"
                      fontWeight="bold"
                    >
                      Current Form Values:
                    </Typography>
                    <Box
                      component="pre"
                      sx={{
                        fontSize: "10px",
                        overflow: "auto",
                        maxHeight: "200px",
                        backgroundColor: "#fff",
                        p: 1,
                        border: "1px solid #ddd",
                        borderRadius: 1,
                        mt: 1,
                      }}
                    >
                      {JSON.stringify(formValues, null, 2)}
                    </Box>
                  </Box>

                  {Object.keys(formErrors).length > 0 && (
                    <Box mt={2}>
                      <Typography
                        variant="caption"
                        component="div"
                        fontWeight="bold"
                        color="red"
                      >
                        Form Errors ({Object.keys(formErrors).length}):
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          fontSize: "10px",
                          overflow: "auto",
                          maxHeight: "100px",
                          backgroundColor: "#fff",
                          p: 1,
                          border: "1px solid #ff9999",
                          borderRadius: 1,
                          mt: 1,
                          color: "red",
                        }}
                      >
                        {JSON.stringify(formErrors, null, 2)}
                      </Box>
                    </Box>
                  )}

                  <Box
                    mt={2}
                    p={1}
                    sx={{ backgroundColor: "#e3f2fd", borderRadius: 1 }}
                  >
                    <Typography
                      variant="caption"
                      component="div"
                      fontWeight="bold"
                    >
                      Logic Summary:
                    </Typography>
                    <Typography variant="caption" component="div">
                      1. Get reportId from localStorage:{" "}
                      <strong>{reportId}</strong>
                    </Typography>
                    <Typography variant="caption" component="div">
                      2. Check if report has verifier_id:{" "}
                      <strong>
                        {existingData?.verifier_id ? "YES" : "NO"}
                      </strong>
                    </Typography>
                    <Typography variant="caption" component="div">
                      3. Mode determined:{" "}
                      <strong>{formMode.toUpperCase()}</strong>
                    </Typography>
                    <Typography variant="caption" component="div">
                      4. Data source:{" "}
                      <strong>
                        {formMode === "edit"
                          ? "Specific verifier data"
                          : formMode === "create"
                          ? "Latest company verifier"
                          : "Empty form"}
                      </strong>
                    </Typography>
                    <Typography variant="caption" component="div">
                      5. Will update report #{reportId} with verifier_id after
                      saving
                    </Typography>
                  </Box>
                </details>
              </Box>
            </Grid>
          )} */}
        </Grid>
      </form>
    </Container>
  );
};

export default VerifierForm;
