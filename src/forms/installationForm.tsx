import React, { useState, useEffect } from "react";
import { Container, Typography, Grid, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
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
  // const reportId = localStorage.getItem("reportId");
  const reportId = 1;
  const apiUrl = process.env.REACT_APP_API_URL || "";

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false); //
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

  const formatDate = (date: any): string => {
    if (!date) return "";
    if (date instanceof Date) return date.toISOString().split("T")[0];
    if (typeof date === "string") return date;
    return "";
  };

  useEffect(() => {
    if (!reportId) {
      console.error(
        "❌ reportId ไม่ถูกส่งมา - ไม่พบใน localStorage หรือ state"
      );
      alert("ไม่พบรหัสรายงาน กรุณากลับไปเลือกรายงานก่อน");
    }
  }, [reportId, navigate]);

  useEffect(() => {
    const loadCountries = async () => {
      const { countries, defaultCountry } = await fetchCountries(); // destructure ตรงนี้เลย

      setCountries(countries); // ✅ ตั้ง countries array ให้กับ state

      if (defaultCountry && !data.country_id) {
        onChange({
          ...data,
          country_id: String(defaultCountry.value),
          unlocode: String(defaultCountry.abbreviation),
        });
      }
    };

    loadCountries();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    onChange({ ...formValues, [name]: value });

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }

    let updatedFormValues = { ...formValues, [name]: value };
    onChange(updatedFormValues as InstallationFormProps["data"]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!reportId) {
      alert("❌ ไม่พบรหัสรายงาน (reportId) กรุณากลับไปสร้างรายงานก่อน");
      setIsSubmitting(false);
      return;
    }

    // กำหนดฟิลด์ที่จำเป็นต้องกรอก
    const requiredFields = [
      "name",
      "address",
      "city",
      "country_id",
      "post_code",
      "po_box",
      "latitude",
      "longitude",
      "author_represent",
      "email",
      "tel",
      "unlocode",
      "reporting_period_start",
      "reporting_period_end",
    ];

    // สร้าง object เก็บ errors
    const newErrors: { [key: string]: string } = {};

    // ตรวจสอบแต่ละฟิลด์ที่จำเป็น
    requiredFields.forEach((field) => {
      if (!formValues[field as keyof typeof formValues]) {
        newErrors[field] = "กรุณากรอกข้อมูล";
      }
    });

    // ตรวจสอบรูปแบบอีเมล (ถ้ามีการกรอก)
    if (
      formValues.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)
    ) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    // ตรวจสอบรูปแบบพิกัด
    // if (formValues.latitude) {
    //   const lat = parseFloat(String(formValues.latitude));
    //   if (isNaN(lat) || lat < -90 || lat > 90) {
    //     newErrors.latitude = "พิกัดละติจูดต้องอยู่ระหว่าง -90 ถึง 90";
    //   }
    // }

    // if (formValues.longitude) {
    //   const lng = parseFloat(String(formValues.longitude));
    //   if (isNaN(lng) || lng < -180 || lng > 180) {
    //     newErrors.longitude = "พิกัดลองจิจูดต้องอยู่ระหว่าง -180 ถึง 180";
    //   }
    // }

    // ถ้ามีข้อผิดพลาด อัปเดต state และไม่ส่งข้อมูล
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      setIsSubmitting(false);
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.getElementsByName(firstErrorField)[0];
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    // ถ้าไม่มีข้อผิดพลาด ดำเนินการส่งข้อมูล
    const payload = {
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
    console.log("Submitting payload:", payload);

    try {
      const method = reportId ? "PUT" : "POST"; // Use PUT if reportId exists
      const url = reportId
        ? `${apiUrl}/api/cbam/installation/${reportId}`
        : `${apiUrl}/api/cbam/installation`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Verifier error:", errorText);
        throw new Error("Failed to create verifier");
      }

      const data = await response.json();
      console.log(data);

      onChange(formValues);
      onNextStep?.();
    } catch (err: any) {
      console.error("❌ Error submitting form:", err.message || err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          </Box>
          {/* reporting period */}
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
                    // เคลียร์ error เมื่อเลือกประเทศ
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
          <PGButton />
        </Grid>
      </form>
    </Container>
  );
};
export default InstallationForm;
