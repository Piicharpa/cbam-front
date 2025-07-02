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
  // กำหนด reportId และ companyId
  const reportId = 54; // หรือรับจาก props หรือ params
  const companyId = 1; // รับจาก context หรือกำหนดค่าคงที่
  
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
  const [existingData, setExistingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const apiUrl = process.env.REACT_APP_API_URL;
  
  const fetchReportData = async () => {
  if (!reportId) return;
  
  setIsLoading(true);
  try {
    const response = await fetch(`${apiUrl}/api/cbam/report/${reportId}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch report data");
    }
    
    const reportData = await response.json();
    console.log("Fetched report data:", reportData);
    
    // ตรวจสอบว่าข้อมูลที่ได้มาเป็น array หรือไม่
    if (Array.isArray(reportData) && reportData.length > 0) {
      setExistingData(reportData[0]);
      
      // ถ้า report มี verifier_id ให้ดึงข้อมูล verifier
      if (reportData[0].verifier_id) {
        console.log("Report has verifier_id, fetching verifier data");
        await fetchVerifierData(reportData[0].verifier_id);
      } else {
        console.log("Report does not have verifier_id, checking other reports from company");
        // ถ้าไม่มี verifier_id ให้ดึงข้อมูลจากรายงานอื่นของบริษัทที่อาจมี verifier_id
        await fetchLatestVerifier();
      }
    }
  } catch (error) {
    console.error("Error fetching report data:", error);
    // ถ้าดึงข้อมูล report ไม่สำเร็จ ก็ลองดึงข้อมูลจากรายงานอื่น
    await fetchLatestVerifier();
  } finally {
    setIsLoading(false);
  }
};


  // ฟังก์ชันดึงข้อมูล verifier ตาม ID
const fetchVerifierData = async (verifierId: number) => {
  try {
    const response = await fetch(`${apiUrl}/api/cbam/verifier/detail/${verifierId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch verifier data: ${response.statusText}`);
    }
    
    const verifierData = await response.json();
    console.log("Fetched verifier data:", verifierData);
    
    // ตรวจสอบว่าข้อมูลที่ได้มาว่างเปล่าหรือเป็น array ว่างหรือไม่
    if (Array.isArray(verifierData)) {
      if (verifierData.length === 0) {
        console.log("No verifier details found for ID:", verifierId);
        return;
      }
      
      // ใช้ข้อมูลตัวแรกถ้าเป็น array
      const data = verifierData[0];
      
      // อัปเดต formValues ด้วยข้อมูล verifier
      setFormValues({
        installation_name: data.name || "",
        address: data.address || "",
        city: data.city || "",
        country_id: data.country_id ? String(data.country_id) : "",
        post_code: data.post_code || "",
        authorized_rep_id: data.authorized_rep_id ? String(data.authorized_rep_id) : "",
        accreditation_state: data.accreditation_state || "",
        accreditation_national_body: data.accreditation_national_body || "",
        registration_no: data.registration_no || "",
        name: data.authorizedRep?.name || "",
        email: data.authorizedRep?.email || "",
        phone: data.authorizedRep?.phone || "",
        fax: data.authorizedRep?.fax || "",
      });
      
      // แจ้ง parent component
      onChange({
        installation_name: data.name || "",
        address: data.address || "",
        city: data.city || "",
        country_id: data.country_id ? String(data.country_id) : "",
        post_code: data.post_code || "",
        authorized_rep_id: data.authorized_rep_id ? String(data.authorized_rep_id) : "",
        accreditation_state: data.accreditation_state || "",
        accreditation_national_body: data.accreditation_national_body || "",
        registration_no: data.registration_no || "",
        name: data.authorizedRep?.name || "",
        email: data.authorizedRep?.email || "",
        phone: data.authorizedRep?.phone || "",
        fax: data.authorizedRep?.fax || "",
      });
    }
  } catch (error) {
    console.error("Error fetching verifier data:", error);
  }
};
  
 // แก้ไขฟังก์ชันดึงข้อมูล verifier ล่าสุดโดยดึงจากรายงานของบริษัท
const fetchLatestVerifier = async () => {
  try {
    // ดึงรายงานทั้งหมดของบริษัท
    const response = await fetch(`${apiUrl}/api/cbam/report/company/${companyId}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch company reports");
    }
    
    const reports = await response.json();
    console.log("Fetched company reports:", reports);
    
    // กรองเฉพาะรายงานที่มี verifier_id
    const reportsWithVerifier = Array.isArray(reports) 
      ? reports.filter(report => report.verifier_id)
      : [];
    
    if (reportsWithVerifier.length > 0) {
      // เรียงตาม ID จากมากไปน้อย (ใหม่ไปเก่า)
      reportsWithVerifier.sort((a: any, b: any) => b.id - a.id);
      
      const latestReportWithVerifier = reportsWithVerifier[0];
      console.log("Using verifier from latest report:", latestReportWithVerifier);
      
      // ดึงข้อมูลรายละเอียดของ verifier
      if (latestReportWithVerifier.verifier_id) {
        await fetchVerifierData(latestReportWithVerifier.verifier_id);
      }
    } else {
      console.log("No reports with verifier found");
    }
  } catch (error) {
    console.error("Error fetching reports with verifier:", error);
  }
};
  
  // เรียกดึงข้อมูลเมื่อโหลดคอมโพเนนต์
  useEffect(() => {
    fetchReportData();
  }, [reportId]);
  
  // อัปเดต formValues เมื่อ data props เปลี่ยนแปลง
  useEffect(() => {
    setFormValues(data);
  }, [data]);
  
  // โหลดข้อมูลประเทศ
  useEffect(() => {
    const loadCountries = async () => {
      const { countries: fetchedCountries, defaultCountry } = await fetchCountries();
      setCountries(fetchedCountries);
      
      const defaultThailand = fetchedCountries.find((c) => c.label === "Thailand");
      if (defaultThailand && !formValues.country_id) {
        setFormValues(prev => ({
          ...prev,
          country_id: String(defaultThailand.value),
        }));
        
        onChange({
          ...formValues,
          country_id: String(defaultThailand.value),
        });
      }
    };
    
    loadCountries();
  }, []);
  
  // จัดการการเปลี่ยนแปลงค่าในฟอร์ม
  const handleChange = (
    name: string,
    valueOrEvent: string | React.ChangeEvent<HTMLInputElement>
  ) => {
    // Determine if the valueOrEvent is an event or a direct value
    const value =
      typeof valueOrEvent === "string"
        ? valueOrEvent
        : valueOrEvent.target.value;
        
    setFormValues((prev) => {
      const newData = { ...prev, [name]: value };
      onChange(newData); // Notify parent with new data
      return newData;
    });
    
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    // ส่วน authorized representative
    let authorisedId = formValues.authorized_rep_id;
    
    // สร้าง payload
    const authorisedPayload = {
      name: formValues.name || null,
      email: formValues.email || null,
      phone: formValues.phone || null,
      fax: formValues.fax || null,
    };
    
    let authorisedMethod = "POST";
    let authorisedUrl = `${apiUrl}/api/cbam/authorised`;
    
    if (authorisedId) {
      authorisedMethod = "PUT";
      authorisedUrl = `${apiUrl}/api/cbam/authorised/${authorisedId}`;
    }
    
    console.log(`Sending ${authorisedMethod} request to ${authorisedUrl}:`, authorisedPayload);
    
    const authorisedRes = await fetch(authorisedUrl, {
      method: authorisedMethod,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(authorisedPayload),
    });
    
    if (!authorisedRes.ok) {
      const errorText = await authorisedRes.text();
      console.error("❌ Authorised error:", errorText);
      throw new Error(`Failed to create/update authorised representative: ${errorText}`);
    }
    
    // อ่าน response เพียงครั้งเดียว
    const authorisedData = await authorisedRes.json();
    authorisedId = authorisedData.id || authorisedId;
    
    // ส่วน verifier
    const verifierId = existingData?.verifier_id;
    const verifierMethod = verifierId ? "PUT" : "POST";
    const verifierUrl = verifierId
      ? `${apiUrl}/api/cbam/verifier/${verifierId}`
      : `${apiUrl}/api/cbam/verifier/`;
    
    const verifierPayload = {
      name: formValues.installation_name || null,
      address: formValues.address || null,
      city: formValues.city || null,
      country_id: Number(formValues.country_id) || null,
      post_code: formValues.post_code || null,
      authorized_rep_id: authorisedId || null,
      accreditation_state: formValues.accreditation_state || null,
      accreditation_national_body: formValues.accreditation_national_body || null,
      registration_no: formValues.registration_no || null,
    };
    
    console.log(`Sending ${verifierMethod} request to ${verifierUrl}:`, verifierPayload);
    
    const verifierRes = await fetch(verifierUrl, {
      method: verifierMethod,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(verifierPayload),
    });
    
    if (!verifierRes.ok) {
      const errorText = await verifierRes.text(); // อ่านเพียงครั้งเดียว
      console.error("❌ Verifier error:", errorText);
      throw new Error(`Failed to create/update verifier: ${errorText}`);
    }
    
    // อ่าน response เพียงครั้งเดียว
    const verifierData = await verifierRes.json();
    const newVerifierId = verifierData.id || verifierId;
    
    // ส่วนอัปเดตรายงาน
    if (reportId) {
      const reportPayload = {
        verifier_id: newVerifierId,
        // ไม่รวม verifier_name
      };
      
      console.log(`Updating report ${reportId} with verifier ID ${newVerifierId}`);
      
      const reportRes = await fetch(`${apiUrl}/api/cbam/report/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportPayload),
      });
      
      if (!reportRes.ok) {
        const errorText = await reportRes.text(); // อ่านเพียงครั้งเดียว
        console.error("❌ Report update error:", errorText);
        alert(`Verifier saved but couldn't link to report: ${errorText}`);
      } else {
        // อ่าน response ถ้าจำเป็น
        try {
          const reportData = await reportRes.json();
          console.log("Report updated successfully:", reportData);
        } catch (jsonError) {
          console.log("Report updated but couldn't read response as JSON");
        }
      }
    }
    
    // ตรวจสอบข้อมูล verifier ล่าสุด
    try {
      const getVerifierRes = await fetch(`${apiUrl}/api/cbam/verifier/detail/${newVerifierId}`);
      if (!getVerifierRes.ok) {
        console.warn("Warning: Unable to fetch updated verifier details");
      } else {
        // Optionally handle updated verifier details here
      }
    } catch (err) {
      console.warn("Warning: Unable to fetch updated verifier details");
    }

    // Call onNextStep or show a success message if needed
    onNextStep();
  } catch (error) {
    alert(error instanceof Error ? error.message : String(error));
  }
};
  
  // Always return JSX from the component
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
            
            {/* Show report information if available */}
            {existingData && (
              <Box mt={2} p={2} sx={{ backgroundColor: "#f5f5f5", borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Report Details:
                </Typography>
                <Typography variant="body2">
                  Report ID: {reportId}
                </Typography>
                <Typography variant="body2">
                  Industry Type: {existingData.industry_type_name || "Not specified"}
                </Typography>
                <Typography variant="body2">
                  Goods Category: {existingData.goods_category_name || "Not specified"}
                </Typography>
                <Typography variant="body2">
                  Name: {existingData.name || "Not specified"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mt: 1, color: existingData.verifier_id ? "green" : "orange" }}
                >
                  Verifier Status:{" "}
                  {existingData.verifier_id
                    ? `Connected (ID: ${existingData.verifier_id})`
                    : "Not connected - Please fill in verifier information"}
                </Typography>
              </Box>
            )}
          </Box>

          <Section
            title="Verifier Info"
            subtitle="ชื่อและที่อยู่ผู้ทวนสอบ"
            hasError={false}
            defaultExpanded={true}
          >
            <LabeledTextField
              caption="Name of the verifier"
              label=""
              name="installation_name"
              value={formValues.installation_name}
              onChange={(e) => handleChange("installation_name", e)}
              error={formErrors.installation_name}
            />
            <LabeledTextField
              caption="Street, Number"
              label=""
              name="address"
              value={formValues.address}
              onChange={(e) => handleChange("address", e)}
              error={formErrors.address}
            />
            <LabeledTextField
              caption="City"
              label=""
              name="city"
              value={formValues.city}
              onChange={(e) => handleChange("city", e)}
              error={formErrors.city}
            />
            <LabeledTextField
              caption="Post Code"
              label=""
              name="post_code"
              value={formValues.post_code}
              onChange={(e) => handleChange("post_code", e)}
              error={formErrors.post_code}
            />
            <LabeledAutocompleteMap
              caption="Country"
              label=""
              defination=""
              name="country_id"
              options={countries.map((c) => ({ ...c, value: String(c.value) }))}
              value={formValues.country_id}
              onChange={(val) => {
                setFormValues((prev) => ({
                  ...prev,
                  country_id: String(val),
                }));
                onChange({
                  ...formValues,
                  country_id: String(val),
                });
              }}
              error={formErrors.country_id}
            />
          </Section>

          <Section title="Authorised Representative" subtitle="" hasError={false}>
            <LabeledTextField
              caption="Name"
              label=""
              name="name"
              value={formValues.name}
              onChange={(e) => handleChange("name", e)}
              error={formErrors.name}
            />
            <LabeledTextField
              caption="Email"
              label=""
              name="email"
              value={formValues.email}
              onChange={(e) => handleChange("email", e)}
              error={formErrors.email}
            />
            <LabeledTextField
              caption="Phone"
              label=""
              name="phone"
              value={formValues.phone}
              onChange={(e) => handleChange("phone", e)}
              error={formErrors.phone}
            />
            <LabeledTextField
              caption="Fax"
              label=""
              name="fax"
              value={formValues.fax}
              onChange={(e) => handleChange("fax", e)}
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
              onChange={(val) => handleChange("accreditation_state", val)}
              error={formErrors.accreditation_state}
            />
            <LabeledTextField
              caption="National Accreditation Body"
              label=""
              name="accreditation_national_body"
              value={formValues.accreditation_national_body}
              onChange={(e) => handleChange("accreditation_national_body", e)}
              error={formErrors.accreditation_national_body}
            />
            <LabeledTextField
              caption="Registration Number"
              label=""
              name="registration_no"
              value={formValues.registration_no}
              onChange={(e) => handleChange("registration_no", e)}
              error={formErrors.registration_no}
            />
          </Section>

          <PGButton text={existingData?.verifier_id ? "Update" : "Save"} />
          
                    {/* Debug information - remove for production */}
          {process.env.NODE_ENV === "development" && (
            <Box mt={4} p={2} sx={{ backgroundColor: "#f5f5f5", borderRadius: 1, fontSize: "0.8rem" }}>
              <Typography variant="caption" component="pre">
                Form Values: {JSON.stringify(formValues, null, 2)}
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

export default VerifierForm;