import React, { useState, useEffect } from "react";
import { Container, Typography, Grid, Box } from "@mui/material";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
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

  // Get report ID and company ID (fixed for demo or from params)
  // const reportId = localStorage.getItem("reportId");
  // const companyId = localStorage.companyId;
  const reportId = 54;
  const companyId = 1;

  const apiUrl = process.env.REACT_APP_API_URL;
  const [existingData, setExistingData] = useState<any>(null);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // สถานะสำหรับติดตามการโหลด
  const [isLoadingReport, setIsLoadingReport] = useState(true);
  const [isLoadingInstallation, setIsLoadingInstallation] = useState(false);

  const [formValues, setFormValues] = useState({
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
    reporting_period_start: data.reporting_period_start
      ? new Date(data.reporting_period_start)
      : new Date(),
    reporting_period_end: data.reporting_period_end
      ? new Date(data.reporting_period_end)
      : new Date(),
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // ตัวช่วยจัดรูปแบบวันที่
  const formatDate = (date: any): string => {
    if (!date) return "";
    if (date instanceof Date) return date.toISOString().split("T")[0];
    if (typeof date === "string") return date;
    return "";
  };

  // เพิ่มฟังก์ชันสำหรับดึง installation ล่าสุดของบริษัท
  const fetchLatestInstallation = async (companyId: number) => {
    try {
      setIsLoadingInstallation(true);

      // ดึงข้อมูล installations ทั้งหมดของบริษัท
      const response = await fetch(
        `${apiUrl}/api/cbam/installation/company/${companyId}`
      );

      if (!response.ok) {
        throw new Error(
          `Error fetching company installations: ${response.statusText}`
        );
      }

      const installations = await response.json();
      console.log("Fetched company installations:", installations);

      if (installations && installations.length > 0) {
        // ถ้าข้อมูลเรียงจากเก่าไปใหม่ ตัวล่าสุดจะอยู่ตำแหน่งสุดท้ายของ array
        const latestInstallation = installations[installations.length - 1];
        console.log("Using latest installation:", latestInstallation);

        // อัปเดตฟอร์มด้วยข้อมูล installation ล่าสุด
        setFormValues({
          name: latestInstallation.name || "",
          name_specific: latestInstallation.name_specific || "",
          eco_activity: latestInstallation.eco_activity || "",
          address: latestInstallation.address || "",
          city: latestInstallation.city || "",
          country_id: latestInstallation.country_id
            ? String(latestInstallation.country_id)
            : "",
          post_code: latestInstallation.post_code || "",
          po_box: latestInstallation.po_box || "",
          latitude: latestInstallation.latitude || "",
          longitude: latestInstallation.longitude || "",
          author_represent: latestInstallation.author_represent || "",
          email: latestInstallation.email || "",
          tel: latestInstallation.phone || "", // หมายเหตุ: phone ในฐานข้อมูลแต่ tel ในฟอร์ม
          unlocode: latestInstallation.unlocode || "",
          reporting_period_start: existingData?.reporting_period_start
            ? new Date(existingData.reporting_period_start)
            : new Date(),
          reporting_period_end: existingData?.reporting_period_end
            ? new Date(existingData.reporting_period_end)
            : new Date(),
        });

        // อัปเดต parent component
        onChange({
          name: latestInstallation.name || "",
          name_specific: latestInstallation.name_specific || "",
          eco_activity: latestInstallation.eco_activity || "",
          address: latestInstallation.address || "",
          city: latestInstallation.city || "",
          country_id: latestInstallation.country_id
            ? String(latestInstallation.country_id)
            : "",
          post_code: latestInstallation.post_code || "",
          po_box: latestInstallation.po_box || "",
          latitude: latestInstallation.latitude || "",
          longitude: latestInstallation.longitude || "",
          author_represent: latestInstallation.author_represent || "",
          email: latestInstallation.email || "",
          tel: latestInstallation.phone || "",
          unlocode: latestInstallation.unlocode || "",
          reporting_period_start: existingData?.reporting_period_start
            ? new Date(existingData.reporting_period_start)
            : new Date(),
          reporting_period_end: existingData?.reporting_period_end
            ? new Date(existingData.reporting_period_end)
            : new Date(),
        });

        return latestInstallation.id; // ส่งคืน ID ของ installation ล่าสุด
      }

      return null; // ไม่พบ installation
    } catch (error) {
      console.error("Error fetching latest installation:", error);
      return null;
    } finally {
      setIsLoadingInstallation(false);
    }
  };

  const fetchCompanyReports = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/api/cbam/report/company/${companyId}`
      );

      if (!response.ok) {
        throw new Error(
          `Error fetching company reports: ${response.statusText}`
        );
      }

      const reports = await response.json();
      console.log("Fetched company reports:", reports);

      // กรองหารายงานที่มี installation_id แล้ว
      const reportsWithInstallation = reports.filter(
        (report: any) => report.installation_id
      );

      if (reportsWithInstallation.length > 0) {
        console.log(
          "Found report with installation:",
          reportsWithInstallation[0]
        );
        // นำ installation_id จากรายงานแรกที่พบไปดึงข้อมูล
        await fetchInstallationData(reportsWithInstallation[0].installation_id);
      } else {
        console.log(
          "No reports with installation found, trying to fetch latest installation"
        );
        // ถ้าไม่พบรายงานที่มี installation ให้ดึง installation ล่าสุดแทน
        await fetchLatestInstallation(companyId);
      }
    } catch (error) {
      console.error("Error fetching company reports:", error);
      console.log("Trying to fetch latest installation as fallback");
      // ถ้าดึงข้อมูลรายงานไม่สำเร็จ ให้ลองดึง installation ล่าสุด
      await fetchLatestInstallation(companyId);
    } finally {
      setIsLoadingInstallation(false);
    }
  };

  // ดึงข้อมูล installation สำหรับแสดงในฟอร์ม
  const fetchInstallationData = async (installationId: number) => {
    if (!installationId) {
      console.error("No installation ID provided to fetch");
      return;
    }

    setIsLoadingInstallation(true);

    try {
      const response = await fetch(
        `${apiUrl}/api/cbam/installation/${installationId}`
      );

      if (!response.ok) {
        throw new Error(
          `Error fetching installation data: ${response.statusText}`
        );
      }

      const installationDataArray = await response.json();
      console.log("Fetched installation data:", installationDataArray);

      // สำคัญ: ข้อมูลเป็น array ต้องดึง element แรกออกมา
      if (installationDataArray && installationDataArray.length > 0) {
        const installationData = installationDataArray[0];
        console.log("Using installation data:", installationData);

        // อัปเดตค่าในฟอร์มด้วยข้อมูลจาก API
        setFormValues((prev) => ({
          ...prev,
          name: installationData.name || prev.name,
          name_specific: installationData.name_specific || prev.name_specific,
          eco_activity: installationData.eco_activity || prev.eco_activity,
          address: installationData.address || prev.address,
          city: installationData.city || prev.city,
          country_id: installationData.country_id
            ? String(installationData.country_id)
            : prev.country_id,
          post_code: installationData.post_code || prev.post_code,
          po_box: installationData.po_box || prev.po_box,
          latitude: installationData.latitude || prev.latitude,
          longitude: installationData.longitude || prev.longitude,
          author_represent:
            installationData.author_represent || prev.author_represent,
          email: installationData.email || prev.email,
          tel: installationData.phone || prev.tel, // หมายเหตุ: phone ในฐานข้อมูลแต่ tel ในฟอร์ม
          unlocode: installationData.unlocode || prev.unlocode,
        }));

        // อัปเดต parent component
        onChange({
          ...formValues,
          name: installationData.name || formValues.name,
          name_specific:
            installationData.name_specific || formValues.name_specific,
          eco_activity:
            installationData.eco_activity || formValues.eco_activity,
          address: installationData.address || formValues.address,
          city: installationData.city || formValues.city,
          country_id: installationData.country_id
            ? String(installationData.country_id)
            : formValues.country_id,
          post_code: installationData.post_code || formValues.post_code,
          po_box: installationData.po_box || formValues.po_box,
          latitude: installationData.latitude || formValues.latitude,
          longitude: installationData.longitude || formValues.longitude,
          author_represent:
            installationData.author_represent || formValues.author_represent,
          email: installationData.email || formValues.email,
          tel: installationData.phone || formValues.tel,
          unlocode: installationData.unlocode || formValues.unlocode,
        });
      } else {
        console.warn("No installation data found for ID:", installationId);
      }
    } catch (error) {
      console.error("Error fetching installation data:", error);
    } finally {
      setIsLoadingInstallation(false);
    }
  };

  // เริ่มการดึงข้อมูลหลักเมื่อโหลดคอมโพเนนต์
  // เริ่มการดึงข้อมูลหลักเมื่อโหลดคอมโพเนนต์
  useEffect(() => {
    const fetchMainData = async () => {
      setIsLoadingReport(true);

      try {
        // ดึงข้อมูลรายงาน ID 54 โดยตรง แทนที่จะใช้ reportId จาก state
        const reportResponse = await fetch(
          `${apiUrl}/api/cbam/report/${reportId}`
        );

        if (!reportResponse.ok) {
          throw new Error("Failed to fetch report data");
        }

        const reportData = await reportResponse.json();
        console.log("Fetched report data:", reportData);

        if (reportData && reportData.length > 0) {
          setExistingData(reportData[0]);

          // ถ้า report มี installation_id ให้ดึงข้อมูล installation
          if (reportData[0].installation_id) {
            console.log(
              "Report has installation_id, fetching installation data"
            );
            await fetchInstallationData(reportData[0].installation_id);
          } else {
            console.log(
              "Report does not have installation_id, checking other reports from company"
            );
            // ถ้า report ไม่มี installation_id ให้ดึงข้อมูลจาก company reports
            await fetchCompanyReports();
          }
        }
      } catch (error) {
        console.error("Error fetching report data:", error);
        console.log("Error with report data, trying company reports");
        // ถ้าดึงข้อมูล report ไม่สำเร็จ ก็ลองดึงข้อมูลจาก company reports
        await fetchCompanyReports();
      } finally {
        setIsLoadingReport(false);
      }
    };

    fetchMainData();
  }, [apiUrl, companyId]); // ไม่ใช้ reportId เป็น dependency เพราะเราใช้ค่า hard-coded 54

  // โหลดข้อมูลประเทศ
  useEffect(() => {
    const loadCountries = async () => {
      const { countries, defaultCountry } = await fetchCountries();
      setCountries(countries);

      // อัปเดต unlocode หลังจากโหลดข้อมูลประเทศแล้ว
      // และมี country_id อยู่แล้ว
      if (countries.length > 0 && formValues.country_id) {
        const selectedCountry = countries.find(
          (c) => String(c.value) === formValues.country_id
        );

        if (selectedCountry) {
          setFormValues((prev) => ({
            ...prev,
            unlocode: selectedCountry.abbreviation || prev.unlocode,
          }));

          onChange({
            ...formValues,
            unlocode: selectedCountry.abbreviation || formValues.unlocode,
          });
        }
      }
      // ถ้ายังไม่มี country_id
      else if (defaultCountry && !formValues.country_id) {
        onChange({
          ...formValues,
          country_id: String(defaultCountry.value),
          unlocode: String(defaultCountry.abbreviation),
        });

        setFormValues((prev) => ({
          ...prev,
          country_id: String(defaultCountry.value),
          unlocode: String(defaultCountry.abbreviation),
        }));
      }
    };

    loadCountries();
  }, [formValues.country_id]);

  // จัดการการเปลี่ยนแปลงค่าในฟอร์ม
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }

    const updatedFormValues = { ...formValues, [name]: value };
    onChange(updatedFormValues as InstallationFormProps["data"]);
  };

  // เพิ่มฟังก์ชันเพื่อตรวจสอบว่ารายงานมีอยู่แล้วหรือไม่
  const checkReportExists = async (reportId: number): Promise<boolean> => {
    try {
      const response = await fetch(`${apiUrl}/api/cbam/report/${reportId}`);
      if (response.ok) {
        const data = await response.json();
        return data && data.length > 0;
      }
      return false;
    } catch (error) {
      console.error("Error checking report existence:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    // ตรวจสอบ required fields
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

    // ตรวจสอบฟิลด์ที่จำเป็น
    requiredFields.forEach((field) => {
      if (!formValues[field as keyof typeof formValues]) {
        newErrors[field] = "กรุณากรอกข้อมูล";
      }
    });

    // ตรวจสอบรูปแบบอีเมล
    if (
      formValues.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)
    ) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    // หากมีข้อผิดพลาด ไม่ดำเนินการต่อ
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);

      // เลื่อนไปยังฟิลด์แรกที่มีข้อผิดพลาด
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.getElementsByName(firstErrorField)[0];
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      setIsSubmitting(false);
      return;
    }

    try {
      // สร้าง payload สำหรับ installation
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

      console.log("ส่งข้อมูล installation:", installationPayload);

      // ตรวจสอบว่าต้องอัปเดตหรือสร้างใหม่
      const installationId = existingData?.installation_id;
      const method = installationId ? "PUT" : "POST";
      const installationUrl = installationId
        ? `${apiUrl}/api/cbam/installation/${installationId}`
        : `${apiUrl}/api/cbam/installation`;

      // ส่งข้อมูล installation
      const response = await fetch(installationUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(installationPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `❌ การส่งข้อมูล installation ผิดพลาด (${method}):`,
          errorText
        );
        throw new Error(
          `ไม่สามารถ${method === "PUT" ? "อัปเดต" : "สร้าง"}ข้อมูลสถานประกอบการ`
        );
      }

      const installationData = await response.json();
      console.log("บันทึกข้อมูล installation สำเร็จ:", installationData);

      // หา installation_id จากการสร้างใหม่หรือใช้ของเดิม
      const newInstallationId = installationData.id || installationId;

      // เตรียม payload สำหรับอัปเดตรายงาน
      const reportUpdatePayload = {
        installation_id: newInstallationId,
        company_id: companyId,
        reporting_period_start: formatDate(formValues.reporting_period_start),
        reporting_period_end: formatDate(formValues.reporting_period_end),
        // อาจเพิ่มฟิลด์อื่นๆ ที่จำเป็นสำหรับการสร้างรายงานใหม่ เช่น company_id, goods_id, industry_type_id, etc.
      };

      // ตรวจสอบว่ารายงานมีอยู่แล้วหรือไม่
      const reportExists = await checkReportExists(reportId);

      // กำหนด method และ URL ตามผลการตรวจสอบ
      const reportMethod = reportExists ? "PUT" : "POST";
      const reportUrl = `${apiUrl}/api/cbam/report${
        reportExists ? `/${reportId}` : ""
      }`;

      console.log(
        `อัปเดตรายงาน ID ${reportId} ด้วยวิธี ${reportMethod}:`,
        reportUpdatePayload
      );

      // ส่งคำขอ API
      const reportUpdateResponse = await fetch(reportUrl, {
        method: reportMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportUpdatePayload),
      });

      if (!reportUpdateResponse.ok) {
        const errorText = await reportUpdateResponse.text();
        console.error(
          `❌ การ${method === "PUT" ? "อัปเดต" : "สร้าง"}รายงานผิดพลาด:`,
          errorText
        );
        alert(
          `บันทึกข้อมูลสถานประกอบการสำเร็จ แต่ไม่สามารถ${
            method === "PUT" ? "อัปเดต" : "สร้าง"
          }รายงานได้`
        );
      } else {
        console.log(`${method === "PUT" ? "อัปเดต" : "สร้าง"}รายงานสำเร็จ`);
        alert(
          `บันทึกข้อมูลสถานประกอบการและ${
            method === "PUT" ? "อัปเดต" : "สร้าง"
          }รายงานสำเร็จ!`
        );
      }

      // แจ้ง parent component และเปลี่ยนขั้นตอน
      onChange(formValues);
      onNextStep?.();
    } catch (err: any) {
      console.error("❌ การบันทึกแบบฟอร์มผิดพลาด:", err.message || err);
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // แสดงฟอร์ม
  return (
    <Container
      maxWidth="md"
      style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
    >
      <form onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3} alignItems="stretch">
          <Box>
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

            {/* แสดงข้อมูล report และ installation */}
            {existingData ? (
              <Box
                mt={2}
                p={2}
                sx={{ backgroundColor: "#f5f5f5", borderRadius: 1 }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  ข้อมูลรายงาน:
                </Typography>
                <Typography variant="body2">
                  รหัสรายงาน:{" "}
                  {reportId || "ไม่ระบุ (สร้างข้อมูลสถานประกอบการอย่างเดียว)"}
                </Typography>
                <Typography variant="body2">
                  ประเภทอุตสาหกรรม:{" "}
                  {existingData.industry_type_name || "ไม่ระบุ"}
                </Typography>
                <Typography variant="body2">
                  หมวดหมู่สินค้า:{" "}
                  {existingData.goods_category_name || "ไม่ระบุ"}
                </Typography>
                <Typography variant="body2">
                  ชื่อ: {existingData.name || "ไม่ระบุ"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    color: existingData.installation_id ? "green" : "orange",
                  }}
                >
                  สถานะสถานประกอบการ:{" "}
                  {existingData.installation_id
                    ? `มีข้อมูลอยู่แล้ว (ID: ${existingData.installation_id})`
                    : "ยังไม่มีข้อมูล - กรุณากรอกข้อมูล"}
                </Typography>
              </Box>
            ) : (
              <Box
                mt={2}
                p={2}
                sx={{ backgroundColor: "#f0f8ff", borderRadius: 1 }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  สร้างข้อมูลสถานประกอบการใหม่
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  กรุณากรอกข้อมูลสถานประกอบการ
                </Typography>
              </Box>
            )}
          </Box>

          {/* ส่วนของฟอร์มรายงาน */}
          <Section
            title="Reporting Period"
            subtitle=""
            hasError={
              !!formErrors.reporting_period_start ||
              !!formErrors.reporting_period_end
            }
            defaultExpanded
          >
            <div
              style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}
            >
              <div style={{ flex: 1 }}>
                <LabeledTextField
                  caption="Start Time"
                  defination="เริ่มต้น"
                  label=""
                  name="reporting_period_start"
                  type="date"
                  value={formatDate(formValues.reporting_period_start)}
                  onChange={handleInputChange}
                  error={!!formErrors.reporting_period_start}
                  helperText={formErrors.reporting_period_start || ""}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <LabeledTextField
                  caption="End Time"
                  defination="สิ้นสุด"
                  label=""
                  name="reporting_period_end"
                  type="date"
                  value={formatDate(formValues.reporting_period_end)}
                  onChange={handleInputChange}
                  error={!!formErrors.reporting_period_end}
                  helperText={formErrors.reporting_period_end || ""}
                  required
                />
              </div>
            </div>
          </Section>

          {/* Installation form */}
          <Section
            title="Installation form"
            subtitle=""
            hasError={Object.values(formErrors).some((e) => !!e)}
            defaultExpanded
          >
            <LabeledTextField
              caption="Name of the installation (ENG)"
              defination="ชื่อสถานประกอบการเป็นภาษาอังกฤษ (Installation Name - English)"
              label=""
              name="name"
              value={formValues.name}
              onChange={handleInputChange}
              error={!!formErrors.name}
              helperText={formErrors.name || ""}
              required
            />
            <LabeledTextField
              caption="Name of the installation (TH)"
              defination="ชื่อของสถานที่ผลิต เช่น โรงงาน เหมือง (Installation Name - Optional)"
              label=""
              name="name_specific"
              value={formValues.name_specific}
              onChange={handleInputChange}
              error={!!formErrors.name_specific}
              helperText={formErrors.name_specific || ""}
            />
            <LabeledTextField
              caption="Economic activity"
              defination="เลือกประเภทของกิจกรรมหลักในสถานประกอบการ (Economic Activity)"
              label=""
              name="eco_activity"
              value={formValues.eco_activity}
              onChange={handleInputChange}
              error={!!formErrors.eco_activity}
              helperText={formErrors.eco_activity || ""}
            />
            <LabeledTextField
              caption="Street, Number"
              defination="ถนน เลขที่ (Street, Number)"
              label=""
              name="address"
              value={formValues.address}
              onChange={handleInputChange}
              error={!!formErrors.address}
              helperText={formErrors.address || ""}
              required
            />
            <LabeledTextField
              caption="City"
              defination="ชื่อจังหวัดหรือเมือง (City)"
              label=""
              name="city"
              value={formValues.city}
              onChange={handleInputChange}
              error={!!formErrors.city}
              helperText={formErrors.city || ""}
              required
            />
            <div
              style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}
            >
              <div style={{ flex: 1 }}>
                <LabeledAutocompleteMap
                  caption="Country"
                  defination="เลือกประเทศที่สถานประกอบการตั้งอยู่ (Country)"
                  label=""
                  options={countries.map((c) => ({
                    ...c,
                    value: String(c.value),
                  }))}
                  value={formValues.country_id}
                  name="country_id"
                  required
                  onChange={(val) => {
                    const selected = countries.find(
                      (c) => String(c.value) === val
                    );
                    setFormValues((prev) => ({
                      ...prev,
                      country_id: String(val),
                      unlocode: selected?.abbreviation || "",
                    }));
                    // Update the parent component
                    onChange({
                      ...formValues,
                      country_id: String(val),
                      unlocode: selected?.abbreviation || "",
                    });
                    // Clear error when country is selected
                    if (formErrors.country_id) {
                      setFormErrors((prev) => ({ ...prev, country_id: "" }));
                    }
                  }}
                  error={formErrors.country_id || ""}
                />
                <LabeledTextField
                  caption="Post code"
                  defination="รหัสไปรษณีย์ (Post Code)"
                  label=""
                  type="number"
                  name="post_code"
                  value={formValues.post_code}
                  onChange={handleInputChange}
                  error={!!formErrors.post_code}
                  helperText={formErrors.post_code || ""}
                  required
                />
                <LabeledTextField
                  caption="Coordinates of the main emission source (latitude)"
                  defination="พิกัดละติจูดของแหล่งปล่อยก๊าซหลัก (Latitude) เช่น 13.7563"
                  label=""
                  type="number"
                  name="latitude"
                  value={formValues.latitude}
                  onChange={handleInputChange}
                  error={!!formErrors.latitude}
                  helperText={formErrors.latitude || ""}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <LabeledTextField
                  caption="UNLOCODE"
                  defination="รหัสประเทศ"
                  label=""
                  name="unlocode"
                  value={formValues.unlocode}
                  readOnly
                  onChange={() => {}}
                  error={!!formErrors.unlocode}
                  helperText={formErrors.unlocode || ""}
                  required
                />
                <LabeledTextField
                  caption="P.O. Box"
                  defination="หมายเลขตู้ไปรษณีย์ (ถ้ามี) (P.O. Box)"
                  label=""
                  type="text"
                  name="po_box"
                  value={formValues.po_box}
                  onChange={handleInputChange}
                  error={!!formErrors.po_box}
                  helperText={formErrors.po_box || ""}
                  required
                />
                <LabeledTextField
                  caption="Coordinates of the main emission source (longitude)"
                  defination="พิกัดลองจิจูดของแหล่งปล่อยก๊าซหลัก (Longitude) เช่น 100.5018"
                  label=""
                  type="number"
                  name="longitude"
                  value={formValues.longitude}
                  onChange={handleInputChange}
                  error={!!formErrors.longitude}
                  helperText={formErrors.longitude || ""}
                  required
                />
              </div>
            </div>
            <LabeledTextField
              caption="Name of authorized representative"
              defination="ชื่อหน่วยงานมาฐานแห่งชาติที่ให้การรับรอง"
              label=""
              name="author_represent"
              value={formValues.author_represent}
              onChange={handleInputChange}
              error={!!formErrors.author_represent}
              helperText={formErrors.author_represent || ""}
              required
            />
            <div
              style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}
            >
              <div style={{ flex: 1 }}>
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
              </div>
              <div style={{ flex: 1 }}>
                <LabeledTextField
                  type="tel"
                  caption="Telephone"
                  defination="หมายเลขทะเบียนที่ออกโดยหน่วยงานรับรอง"
                  label=""
                  name="tel"
                  value={formValues.tel}
                  onChange={handleInputChange}
                  error={!!formErrors.tel}
                  helperText={formErrors.tel || ""}
                  required
                />
              </div>
            </div>
          </Section>

          {/* Submit button */}
          <PGButton
            text={existingData?.installation_id ? "Update" : "Save"}
            loading={isSubmitting}
          />

          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === "development" && (
            <Box
              mt={4}
              p={2}
              sx={{
                backgroundColor: "#f5f5f5",
                borderRadius: 1,
                fontSize: "0.8rem",
              }}
            >
              <Typography variant="caption" component="pre">
                Report ID: {reportId}
              </Typography>
              <Typography variant="caption" component="pre">
                Existing Data: {JSON.stringify(existingData, null, 2)}
              </Typography>
            </Box>
          )}
        </Grid>
      </form>
    </Container>
  );
};

export default InstallationForm;
