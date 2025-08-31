import React, { useState, useEffect } from "react";
import { Container, Typography, Grid, Box } from "@mui/material";
import Section from "../components/Section";
import PGButton from "../components/FormButton";
import LabeledTextField from "../components/LabeledTextField";
import LabeledAutocompleteMap from "../components/LabeledAutoCompleteMap";
import {
  fetchCountries,
  CountryOption,
} from "../components/dropdown/contriesmap";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/th";

// Modify the interface to use Dayjs instead of Date for date fields
export interface InstallationFormProps {
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
    reporting_period_start: Date | Dayjs;
    reporting_period_end: Date | Dayjs;
  };
  onChange: (data: InstallationFormProps["data"]) => void;
  onNextStep: () => void;
}

const InstallationForm: React.FC<InstallationFormProps> = ({
  data,
  onChange,
  onNextStep,
}) => {
  // Get report ID from localStorage (always exists in real situation)
  const storedReportId = localStorage.getItem("reportId");
  const reportId = storedReportId ? parseInt(storedReportId, 10) : null;
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

  // Initialize form values with today's date
  const getTodayDate = () => dayjs();

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
    reporting_period_start: dayjs(),
    reporting_period_end: dayjs(),
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Handle date change with dayjs objects
  const handleDateChange = (name: string, date: dayjs.Dayjs | null) => {
    if (!date) return;

    setFormValues((prev) => ({
      ...prev,
      [name]: date, // Store dayjs object directly
    }));

    // Update parent component
    const updatedFormValues = {
      ...formValues,
      [name]: date, // Pass dayjs object
      reportId: reportId || 0,
    };
    onChange(updatedFormValues as InstallationFormProps["data"]);

    // Clear error if any
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const fetchInstallationData = async (installationId: number) => {
    try {
      // ตรวจสอบ reportId ก่อนใช้
      if (!reportId) {
        console.error("reportId is null, cannot fetch installation data");
        return null;
      }

      // เรียกข้อมูลสถานที่ติดตั้ง
      const installationResponse = await fetch(
        `${apiUrl}/api/cbam/installation/${installationId}`
      );
      if (!installationResponse.ok) {
        throw new Error(
          `Error fetching installation: ${installationResponse.statusText}`
        );
      }

      // เรียกข้อมูลรายงานทั้งหมดของบริษัท
      const companyReportsResponse = await fetch(
        `${apiUrl}/api/cbam/report/company/${companyId}`
      );

      // เรียกข้อมูลรายงานที่กำลังแก้ไข (รายงานปัจจุบัน)
      const currentReportResponse = await fetch(
        `${apiUrl}/api/cbam/report/${reportId}`
      );

      // ประมวลผลข้อมูล
      const installationDataArray = await installationResponse.json();
      const companyReports = await companyReportsResponse.json();
      const currentReportData = await currentReportResponse.json();

      

      // ค้นหารายงานที่ตรงกับ reportId ที่กำลังแก้ไข - รูปแบบที่ 1
      let reportDateInfo = null;
      if (Array.isArray(companyReports)) {
        reportDateInfo = companyReports.find(
          (report) => report.id === reportId
        );
      }

      // ถ้าไม่พบ ลองหาจากรายงานปัจจุบันที่กำลังแก้ไข - รูปแบบที่ 2
      if (
        !reportDateInfo &&
        Array.isArray(currentReportData) &&
        currentReportData.length > 0
      ) {
        reportDateInfo = currentReportData[0];
      }

      if (installationDataArray && installationDataArray.length > 0) {
        const installationData = installationDataArray[0];

        // สร้างข้อมูลฟอร์ม
        const updatedFormValues = {
          reportId: reportId,
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

          // ใช้วันที่จากรายงานหรือใช้วันที่ปัจจุบัน
          reporting_period_start: reportDateInfo?.reporting_period_start
            ? dayjs(reportDateInfo.reporting_period_start)
            : getTodayDate(),
          reporting_period_end: reportDateInfo?.reporting_period_end
            ? dayjs(reportDateInfo.reporting_period_end)
            : getTodayDate(),
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
          reporting_period_start: latestdata.reporting_period_start,
          reporting_period_end: latestdata.reporting_period_end,
        };
        setFormValues(updatedFormValues);
        onChange(updatedFormValues);
        setFormMode("create");
      } else {
        setFormMode("empty");
      }
    } catch (error) {
      console.error("❌ Error fetching latest installation:", error);
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
          setFormMode("empty");
          setIsLoading(false);
          return;
        }
        // Case 2: Fetch report data to check if it has installation_id
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
          if (report.installation_id) {
            // ✅ SCENARIO 1: EDIT MODE - Report has installation_id
            await fetchInstallationData(report.installation_id);
          } else {
            // ✅ SCENARIO 2: CREATE MODE - Report has no installation_id
            await fetchLatestCompanyInstallation(companyId);
          }
        } else {
          setFormMode("empty");
        }
      } catch (error) {
        console.error("❌ Error in main data loading:", error);
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

  // Add this function for API date formatting (YYYY-MM-DD)
  const formatDateForAPI = (date: any): string => {
    if (!date) return "";

    // If it's a dayjs object
    if (date && typeof date === "object" && "format" in date) {
      return date.format("YYYY-MM-DD");
    }

    // If it's a Date object
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    return String(date);
  };

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
      const installationPayload = {
        name: formValues.name,
        name_specific: formValues.name_specific || null,
        eco_activity: formValues.eco_activity || null,
        address: formValues.address,
        city: formValues.city,
        country_id: Number(formValues.country_id),
        unlocode: formValues.unlocode || null,
        post_code: formValues.post_code,
        latitude: formValues.latitude,
        longitude: formValues.longitude,
        po_box: formValues.po_box || null,
        author_represent: formValues.author_represent || null,
        email: formValues.email || null,
        phone: formValues.tel || null,
      };
      // Determine API call based on mode
      let installationResponse;
      let newInstallationId;
      if (formMode === "edit" && existingData?.installation_id) {
        // UPDATE existing installation
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
      // Get installation ID (for new installations)
      if (formMode !== "edit") {
        newInstallationId = installationResult.id;
      }
      // 2. Update Report with installation_id (as requested)
      const reportUpdatePayload = {
        installation_id: newInstallationId,
        company_id: companyId,
        reporting_period_start: formatDateForAPI(
          formValues.reporting_period_start
        ),
        reporting_period_end: formatDateForAPI(formValues.reporting_period_end),
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

      // 3. Keep reportId in localStorage as requested
      localStorage.setItem("reportId", String(reportId));
      // localStorage.setItem("cbam_report_id", String(reportId));

      // Success message
      const modeText = formMode === "edit" ? "updated" : "created";
      // Move to next step
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
          🔍 Loading installation data...
        </Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="md"
      // style={{ paddingTop: "1rem", paddingBottom: "1rem" }}
    >
      <form onSubmit={handleSubmit} noValidate>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
          <Grid container spacing={3}>
            {/* Reporting Period Section */}
            <Grid size={12}>
              <Section
                title="Reporting Period"
                subtitle="ระบุระยะเวลาการรายงาน"
                hasError={
                  !!formErrors.reporting_period_start ||
                  !!formErrors.reporting_period_end
                }
              >
                <Grid>
                  <Grid size={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="caption"
                        color={"#0290c4"}
                        style={{
                          fontWeight: 600,
                          fontSize: "18px",
                        }}
                      >
                        Start Time
                      </Typography>
                      <Typography
                        variant="caption"
                        color={"#74aa15"}
                        style={{
                          // marginBottom: "0.25rem",
                          display: "block",
                          fontSize: "16px",
                          minHeight: "53px",
                        }}
                      >
                        ระบุวันที่เริ่มต้นรายงาน
                      </Typography>
                      <DatePicker
                        value={formValues.reporting_period_start}
                        onChange={(newDate) =>
                          handleDateChange("reporting_period_start", newDate)
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!formErrors.reporting_period_start,
                            helperText: formErrors.reporting_period_start || "",
                            required: true,
                          },
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid size={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="caption"
                        color={"#0290c4"}
                        style={{
                          fontWeight: 600,
                          fontSize: "18px",
                        }}
                      >
                        End Time
                      </Typography>
                      <Typography
                        variant="caption"
                        color={"#74aa15"}
                        style={{
                          // marginBottom: "0.25rem",
                          display: "block",
                          fontSize: "16px",
                          minHeight: "53px",
                        }}
                      >
                        ระบุวันที่สิ้นสุดรายงาน
                      </Typography>
                      <DatePicker
                        value={formValues.reporting_period_end}
                        onChange={(newDate) =>
                          handleDateChange("reporting_period_end", newDate)
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!formErrors.reporting_period_end,
                            helperText: formErrors.reporting_period_end || "",
                            required: true,
                          },
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Section>
            </Grid>

            {/* Header Section */}
            <Grid size={12}>
              <Typography
                fontSize="32px"
                variant="h5"
                fontWeight="bold"
                gutterBottom
                color="#1976d2"
              >
                About the installation
              </Typography>
              <Typography
                fontSize="20px"
                variant="subtitle1"
                color="text.secondary"
                gutterBottom
              >
                รายละเอียดสถานประกอบการ
              </Typography>
            </Grid>

            {/* Installation Form Section */}
            <Grid size={12}>
              <Section
                title="Installation Information"
                subtitle="ระบุรายละเอียดสถานประกอบการ"
                hasError={Object.values(formErrors).some((e) => !!e)}
              >
                <Grid container spacing={2}>
                  {/* Name Fields */}
                  <Grid size={12}>
                    <LabeledTextField
                      caption="Name of the installation (ENG)"
                      defination="ระบุชื่อสถานประกอบการเป็นภาษาอังกฤษ"
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
                      defination="ระบุชื่อสถานประกอบการเป็นภาษาไทย (ไม่บังคับ)"
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
                      defination="ระบุกิจกรรมทางเศรษฐกิจหลัก"
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
                      defination="ระบุถนน เลขที่"
                      label="123 Moo 5, Industrial Zone 2, Ban Klang Subdistrict, Muang District"
                      name="address"
                      value={formValues.address}
                      onChange={handleInputChange}
                      error={!!formErrors.address}
                      helperText={formErrors.address || ""}
                      required
                    />
                  </Grid>
                  {/* Country and Location */}
                  <Grid size={12}>
                    <LabeledAutocompleteMap
                      caption="Country"
                      defination="เลือกประเทศ"
                      label="Thailand"
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
                      caption="City"
                      defination="ระบุเมือง/จังหวัด"
                      label="Saraburi "
                      name="city"
                      value={formValues.city}
                      onChange={handleInputChange}
                      error={!!formErrors.city}
                      helperText={formErrors.city || ""}
                      required
                    />
                  </Grid>
                  <Grid size={12}>
                    <LabeledTextField
                      caption="UNLOCODE"
                      defination="รหัสประเทศ (อัตโนมัติ)"
                      label="TH"
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
                      defination="ระบุรหัสไปรษณีย์"
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
                      defination="ระบุตู้ไปรษณีย์ (ไม่บังคับ)"
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
                      defination="ระบุพิกัดละติจูด เช่น 13.7563"
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
                      defination="ระบุพิกัดลองจิจูด เช่น 100.5018"
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
                      defination="ระบุชื่อผู้มีอำนาจลงนาม"
                      label=""
                      name="author_represent"
                      value={formValues.author_represent}
                      onChange={handleInputChange}
                      error={!!formErrors.author_represent}
                      helperText={formErrors.author_represent || ""}
                    />
                  </Grid>
                  {/* Contact Info */}
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
                      caption="Telephone"
                      defination="ระบุหมายเลขโทรศัพท์"
                      label=""
                      name="tel"
                      value={formValues.tel}
                      onChange={handleInputChange}
                      error={!!formErrors.tel}
                      helperText={formErrors.tel || ""}
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
          </Grid>
        </LocalizationProvider>
      </form>
    </Container>
  );
};

export default InstallationForm;
