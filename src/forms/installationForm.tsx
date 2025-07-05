import React, { useState, useEffect } from "react";
import { Container, Typography, Grid, Box } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import Section from "../components/Section";
import PGButton from "../components/FormButton";
import LabeledTextField from "../components/LabeledTextField";
import LabeledAutocompleteMap from "../components/LabeledAutoCompleteMap";
import {
  fetchCountries,
  CountryOption,
} from "../components/dropdown/contriesmap";

interface InstallationFormProps {
  data: {
    reportId: number;
    name: string;
    name_specific: string;
    eco_activity: string;
    address: string;
    city: string;
    country_id: string;
    post_code: string;
    po_box: string;
    latitude: string;
    longitude: string;
    author_represent: string;
    email: string;
    tel: string;
    unlocode: string;
    reporting_period_start: Date;
    reporting_period_end: Date;
  };
  onChange: (data: InstallationFormProps["data"]) => void;
  onNextStep: () => void;
}

const InstallationForm: React.FC<InstallationFormProps> = ({
  data,
  onChange,
  onNextStep,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get report ID from localStorage (always exists in real situation)
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

  // Initialize form values with today's date
  const getTodayDate = () => new Date();

  const [formValues, setFormValues] = useState({
    reportId: reportId || 0,
    name: data.name || "",
    name_specific: data.name_specific || "",
    eco_activity: data.eco_activity || "",
    address: data.address || "",
    city: data.city || "",
    country_id: data.country_id || "",
    post_code: data.post_code || "",
    po_box: data.po_box || "",
    latitude: data.latitude || "",
    longitude: data.longitude || "",
    author_represent: data.author_represent || "",
    email: data.email || "",
    tel: data.tel || "",
    unlocode: data.unlocode || "",
    reporting_period_start: getTodayDate(),
    reporting_period_end: getTodayDate(),
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Date formatter
  const formatDate = (date: any): string => {
    if (!date) return "";
    if (date instanceof Date) return date.toISOString().split("T")[0];
    if (typeof date === "string") return date;
    return "";
  };

  // 🏭 Fetch specific installation data (for EDIT mode)
  const fetchInstallationData = async (installationId: number) => {
    try {
      console.log(`🔍 Fetching installation data for ID: ${installationId}`);

      const response = await fetch(
        `${apiUrl}/api/cbam/installation/${installationId}`
      );
      if (!response.ok) {
        throw new Error(`Error fetching installation: ${response.statusText}`);
      }

      const installationDataArray = await response.json();

      if (installationDataArray && installationDataArray.length > 0) {
        const installationData = installationDataArray[0];
        console.log(
          "✅ Found installation data for EDIT mode:",
          installationData
        );

        // Update form values with existing installation data + today's dates
        const updatedFormValues = {
          reportId: reportId || 0,
          name: installationData.name || "",
          name_specific: installationData.name_specific || "",
          eco_activity: installationData.eco_activity || "",
          address: installationData.address || "",
          city: installationData.city || "",
          country_id: installationData.country_id
            ? String(installationData.country_id)
            : "",
          post_code: installationData.post_code || "",
          po_box: installationData.po_box || "",
          latitude: installationData.latitude || "",
          longitude: installationData.longitude || "",
          author_represent: installationData.author_represent || "",
          email: installationData.email || "",
          tel: installationData.phone || "", // phone -> tel
          unlocode: installationData.unlocode || "",
          // Set dates to today as requested
          reporting_period_start: getTodayDate(),
          reporting_period_end: getTodayDate(),
        };

        setFormValues(updatedFormValues);
        onChange(updatedFormValues);
        setFormMode("edit");

        return installationData.id;
      }
    } catch (error) {
      console.error("❌ Error fetching installation data:", error);
    }

    return null;
  };

  // 🏢 Fetch latest installation from company (for CREATE mode)
  const fetchLatestCompanyInstallation = async (companyId: number) => {
    try {
      console.log(`🔍 Fetching latest installation for company: ${companyId}`);

      const response = await fetch(
        `${apiUrl}/api/cbam/report/company/${companyId}`
      );
      if (!response.ok) {
        throw new Error(
          `Error fetching company installations: ${response.statusText}`
        );
      }

      const installations = await response.json();

      if (installations && installations.length > 0) {
        // Take the last item as requested
        const latestInstallation = installations[installations.length - 1];
        console.log(
          "✅ Found latest installation for CREATE mode:",
          latestInstallation
        );

        const latestinstallationId = latestInstallation.installation_id;

        const latestdata_response = await fetch(
          `${apiUrl}/api/cbam/installation/${latestinstallationId}`
        );

        const latestdata = await latestdata_response.json();

        // Update form with basic info but set dates to today
        const updatedFormValues = {
          reportId: reportId || 0,
          name: latestdata.name || "",
          name_specific: latestdata.name_specific || "",
          eco_activity: latestdata.eco_activity || "",
          address: latestdata.address || "",
          city: latestdata.city || "",
          country_id: latestdata.country_id
            ? String(latestdata.country_id)
            : "",
          post_code: latestdata.post_code || "",
          po_box: latestdata.po_box || "",
          latitude: latestdata.latitude || "",
          longitude: latestdata.longitude || "",
          author_represent: latestdata.author_represent || "",
          email: latestdata.email || "",
          tel: latestdata.phone || "",
          unlocode: latestdata.unlocode || "",
          // Set dates to today as requested
          reporting_period_start: getTodayDate(),
          reporting_period_end: getTodayDate(),
        };

        setFormValues(updatedFormValues);
        onChange(updatedFormValues);
        setFormMode("create");
      } else {
        console.log("ℹ️ No previous installations found, showing empty form");
        setFormMode("empty");
      }
    } catch (error) {
      console.error("❌ Error fetching latest installation:", error);
      console.log("ℹ️ Fallback to empty form");
      setFormMode("empty");
    }
  };

  // 🔍 Main data loading logic
  useEffect(() => {
    const loadInstallationData = async () => {
      setIsLoading(true);

      try {
        // Case 1: No reportId - show empty form (shouldn't happen in real life)
        if (!reportId) {
          console.log("⚠️ No reportId found - showing empty form");
          setFormMode("empty");
          setIsLoading(false);
          return;
        }

        // Case 2: Fetch report data to check if it has installation_id
        console.log(`🔍 Checking report ${reportId} for existing installation`);

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

          if (report.installation_id) {
            // ✅ SCENARIO 1: EDIT MODE - Report has installation_id
            console.log(
              "🔄 EDIT MODE: Report has installation_id, fetching installation data"
            );
            await fetchInstallationData(report.installation_id);
          } else {
            // ✅ SCENARIO 2: CREATE MODE - Report has no installation_id
            console.log(
              "🆕 CREATE MODE: Report has no installation_id, fetching latest company installation"
            );
            await fetchLatestCompanyInstallation(companyId);
          }
        } else {
          console.log("⚠️ No report data found - showing empty form");
          setFormMode("empty");
        }
      } catch (error) {
        console.error("❌ Error in main data loading:", error);
        console.log("🔄 Fallback: trying to get latest company installation");
        await fetchLatestCompanyInstallation(companyId);
      } finally {
        setIsLoading(false);
      }
    };

    loadInstallationData();
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

        // Auto-select default country if none selected
        if (result.defaultCountry && !formValues.country_id) {
          const defaultCountryData = {
            ...formValues,
            country_id: String(result.defaultCountry.value),
            unlocode: String(result.defaultCountry.abbreviation),
          };

          setFormValues((prev) => ({
            ...prev,
            country_id: String(result.defaultCountry!.value),
            unlocode: String(result.defaultCountry!.abbreviation),
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
      reportId: reportId || 0,
    };

    onChange(updatedFormValues as InstallationFormProps["data"]);
  };

  // Handle country selection - Fix the type issue
  const handleCountryChange = (
    countryValue: string | number | (string | number)[]
  ) => {
    // Convert to string to handle all possible types
    const value = String(countryValue);
    const selectedCountry = countries.find((c) => String(c.value) === value);

    const updatedFormValues = {
      ...formValues,
      country_id: value,
      unlocode: selectedCountry?.abbreviation || "",
    };

    setFormValues(updatedFormValues);
    onChange(updatedFormValues);

    // Clear country error
    if (formErrors.country_id) {
      setFormErrors((prev) => ({ ...prev, country_id: "" }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    // Validation
    const requiredFields = [
      "name",
      "address",
      "city",
      "country_id",
      "post_code",
      "latitude",
      "longitude",
      "author_represent",
      "email",
      "tel",
    ];

    const newErrors: { [key: string]: string } = {};

    requiredFields.forEach((field) => {
      if (!formValues[field as keyof typeof formValues]) {
        newErrors[field] = "กรุณากรอกข้อมูล";
      }
    });

    // Email validation
    if (
      formValues.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)
    ) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);

      // Scroll to first error
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.getElementsByName(firstErrorField)[0];
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Create/Update Installation
      const installationPayload = {
        name: formValues.name,
        name_specific: formValues.name_specific || null,
        eco_activity: formValues.eco_activity || null,
        address: formValues.address,
        city: formValues.city,
        country_id: Number(formValues.country_id),
        post_code: formValues.post_code,
        latitude: formValues.latitude,
        longitude: formValues.longitude,
        po_box: formValues.po_box || null,
        author_represent: formValues.author_represent || null,
        email: formValues.email || null,
        phone: formValues.tel || null,
      };

      console.log(
        `📤 ${formMode.toUpperCase()} MODE: Saving installation data`
      );

      // Determine API call based on mode
      let installationResponse;
      let newInstallationId;

      if (formMode === "edit" && existingData?.installation_id) {
        // UPDATE existing installation
        console.log(
          `🔄 Updating installation ID: ${existingData.installation_id}`
        );

        installationResponse = await fetch(
          `${apiUrl}/api/cbam/installation/${existingData.installation_id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(installationPayload),
          }
        );

        newInstallationId = existingData.installation_id;
      } else {
        // CREATE new installation
        console.log("🆕 Creating new installation");

        installationResponse = await fetch(`${apiUrl}/api/cbam/installation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(installationPayload),
        });
      }

      if (!installationResponse.ok) {
        const errorText = await installationResponse.text();
        console.error(
          `❌ Installation ${formMode === "edit" ? "update" : "create"} error:`,
          errorText
        );
        throw new Error(
          `Cannot ${formMode === "edit" ? "update" : "create"} installation`
        );
      }

      const installationResult = await installationResponse.json();
      console.log("✅ Installation saved successfully:", installationResult);

      // Get installation ID (for new installations)
      if (formMode !== "edit") {
        newInstallationId = installationResult.id;
      }

      // 2. Update Report with installation_id (as requested)
      console.log(
        `🔗 Updating report ${reportId} with installation_id: ${newInstallationId}`
      );

      const reportUpdatePayload = {
        installation_id: newInstallationId,
        company_id: companyId,
        reporting_period_start: formatDate(formValues.reporting_period_start),
        reporting_period_end: formatDate(formValues.reporting_period_end),
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
        throw new Error(
          `Could not update report with installation: ${errorText}`
        );
      }

      const reportResult = await reportUpdateResponse.json();
      console.log(
        "✅ Report updated successfully with installation_id:",
        reportResult
      );

      // 3. Keep reportId in localStorage as requested
      localStorage.setItem("reportId", String(reportId));
      localStorage.setItem("cbam_report_id", String(reportId));
      console.log(`💾 Kept reportId ${reportId} in localStorage for next page`);

      // Success message
      const modeText = formMode === "edit" ? "updated" : "created";
      alert(
        `✅ Success!\n` +
          `🏭 Installation ${modeText} successfully\n` +
          `🔗 Report #${reportId} linked with installation\n` +
          `📋 Ready for next step`
      );

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
          🔍 Loading installation data...
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
              About the installation
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              รายละเอียดสถานประกอบการ
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
                    Editing existing installation (ID:{" "}
                    {existingData?.installation_id})
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
                    Creating new installation (pre-filled with latest company
                    data)
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
                    Creating new installation (empty form)
                  </Typography>
                </>
              )}

              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Report ID:</strong> {reportId} |{" "}
                <strong>Company ID:</strong> {companyId}
              </Typography>
            </Box>
          </Grid>

          {/* Reporting Period Section */}
          <Grid size={12}>
            <Section
              title="Reporting Period"
              subtitle="Set reporting dates"
              hasError={
                !!formErrors.reporting_period_start ||
                !!formErrors.reporting_period_end
              }
              defaultExpanded
            >
              <Grid container spacing={2}>
                <Grid size={12}>
                  <LabeledTextField
                    caption="Start Time"
                    defination="วันที่เริ่มต้นรายงาน"
                    label=""
                    name="reporting_period_start"
                    type="date"
                    value={formatDate(formValues.reporting_period_start)}
                    onChange={handleInputChange}
                    error={!!formErrors.reporting_period_start}
                    helperText={formErrors.reporting_period_start || ""}
                    required
                  />
                </Grid>
                <Grid size={12}>
                  <LabeledTextField
                    caption="End Time"
                    defination="วันที่สิ้นสุดรายงาน"
                    label=""
                    name="reporting_period_end"
                    type="date"
                    value={formatDate(formValues.reporting_period_end)}
                    onChange={handleInputChange}
                    error={!!formErrors.reporting_period_end}
                    helperText={formErrors.reporting_period_end || ""}
                    required
                  />
                </Grid>
              </Grid>
            </Section>
          </Grid>

          {/* Installation Form Section */}
          <Grid size={12}>
            <Section
              title="Installation Information"
              subtitle="Fill in installation details"
              hasError={Object.values(formErrors).some((e) => !!e)}
              defaultExpanded
            >
              <Grid container spacing={2}>
                {/* Name Fields */}
                <Grid size={12}>
                  <LabeledTextField
                    caption="Name of the installation (ENG)"
                    defination="ชื่อสถานประกอบการเป็นภาษาอังกฤษ"
                    label=""
                    name="name"
                    value={formValues.name}
                    onChange={handleInputChange}
                    error={!!formErrors.name}
                    helperText={formErrors.name || ""}
                    required
                  />
                </Grid>

                <Grid size={12}>
                  <LabeledTextField
                    caption="Name of the installation (TH)"
                    defination="ชื่อสถานประกอบการเป็นภาษาไทย (ไม่บังคับ)"
                    label=""
                    name="name_specific"
                    value={formValues.name_specific}
                    onChange={handleInputChange}
                    error={!!formErrors.name_specific}
                    helperText={formErrors.name_specific || ""}
                  />
                </Grid>

                <Grid size={12}>
                  <LabeledTextField
                    caption="Economic activity"
                    defination="กิจกรรมทางเศรษฐกิจหลัก"
                    label=""
                    name="eco_activity"
                    value={formValues.eco_activity}
                    onChange={handleInputChange}
                    error={!!formErrors.eco_activity}
                    helperText={formErrors.eco_activity || ""}
                  />
                </Grid>

                {/* Address Fields */}
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
                    required
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
                    required
                  />
                </Grid>

                {/* Country and Location */}
                <Grid size={12}>
                  <LabeledAutocompleteMap
                    caption="Country"
                    defination="เลือกประเทศ"
                    label=""
                    options={countries.map((c) => ({
                      ...c,
                      value: String(c.value),
                    }))}
                    value={formValues.country_id}
                    name="country_id"
                    required
                    onChange={handleCountryChange}
                    error={formErrors.country_id || ""}
                  />
                </Grid>

                <Grid size={12}>
                  <LabeledTextField
                    caption="UNLOCODE"
                    defination="รหัสประเทศ (อัตโนมัติ)"
                    label=""
                    name="unlocode"
                    value={formValues.unlocode}
                    readOnly
                    onChange={() => {}}
                    error={!!formErrors.unlocode}
                    helperText={formErrors.unlocode || ""}
                  />
                </Grid>

                <Grid size={12}>
                  <LabeledTextField
                    caption="Post code"
                    defination="รหัสไปรษณีย์"
                    label=""
                    type="text"
                    name="post_code"
                    value={formValues.post_code}
                    onChange={handleInputChange}
                    error={!!formErrors.post_code}
                    helperText={formErrors.post_code || ""}
                    required
                  />
                </Grid>

                <Grid size={12}>
                  <LabeledTextField
                    caption="P.O. Box"
                    defination="ตู้ไปรษณีย์ (ไม่บังคับ)"
                    label=""
                    name="po_box"
                    value={formValues.po_box}
                    onChange={handleInputChange}
                    error={!!formErrors.po_box}
                    helperText={formErrors.po_box || ""}
                  />
                </Grid>

                {/* Coordinates */}
                <Grid size={12}>
                  <LabeledTextField
                    caption="Coordinates (latitude)"
                    defination="พิกัดละติจูด เช่น 13.7563"
                    label=""
                    type="number"
                    // step="any"
                    name="latitude"
                    value={formValues.latitude}
                    onChange={handleInputChange}
                    error={!!formErrors.latitude}
                    helperText={formErrors.latitude || ""}
                    required
                  />
                </Grid>

                <Grid size={12}>
                  <LabeledTextField
                    caption="Coordinates (longitude)"
                    defination="พิกัดลองจิจูด เช่น 100.5018"
                    label=""
                    type="number"
                    // step="any"
                    name="longitude"
                    value={formValues.longitude}
                    onChange={handleInputChange}
                    error={!!formErrors.longitude}
                    helperText={formErrors.longitude || ""}
                    required
                  />
                </Grid>

                {/* Representative Info */}
                <Grid size={12}>
                  <LabeledTextField
                    caption="Name of authorized representative"
                    defination="ชื่อผู้มีอำนาจลงนาม"
                    label=""
                    name="author_represent"
                    value={formValues.author_represent}
                    onChange={handleInputChange}
                    error={!!formErrors.author_represent}
                    helperText={formErrors.author_represent || ""}
                    required
                  />
                </Grid>

                {/* Contact Info */}
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
                    required
                  />
                </Grid>

                <Grid size={12}>
                  <LabeledTextField
                    type="tel"
                    caption="Telephone"
                    defination="หมายเลขโทรศัพท์"
                    label=""
                    name="tel"
                    value={formValues.tel}
                    onChange={handleInputChange}
                    error={!!formErrors.tel}
                    helperText={formErrors.tel || ""}
                    required
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
                  formMode === "edit"
                    ? "Update Installation"
                    : "Create Installation"
                }
                loading={isSubmitting}
                type="submit"
              />
            </Box>
          </Grid>

          {/* Debug Information - Development Only */}
          {process.env.NODE_ENV === "development" && (
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
                        <strong>Installation ID:</strong>{" "}
                        {existingData?.installation_id || "not set"}
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
                          ? "Will UPDATE existing installation"
                          : formMode === "create"
                          ? "Will CREATE new installation"
                          : "Will CREATE new installation (empty form)"}
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
                      {JSON.stringify(
                        {
                          ...formValues,
                          reporting_period_start: formatDate(
                            formValues.reporting_period_start
                          ),
                          reporting_period_end: formatDate(
                            formValues.reporting_period_end
                          ),
                        },
                        null,
                        2
                      )}
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
                      2. Check if report has installation_id:{" "}
                      <strong>
                        {existingData?.installation_id ? "YES" : "NO"}
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
                          ? "Specific installation data"
                          : formMode === "create"
                          ? "Latest company installation"
                          : "Empty form"}
                      </strong>
                    </Typography>
                    <Typography variant="caption" component="div">
                      5. Dates set to:{" "}
                      <strong>Today ({formatDate(getTodayDate())})</strong>
                    </Typography>
                  </Box>
                </details>
              </Box>
            </Grid>
          )}
        </Grid>
      </form>
    </Container>
  );
};

export default InstallationForm;
