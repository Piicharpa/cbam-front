import React, { useState, useEffect } from "react";
import { Container, Typography, Grid, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import Section from "../components/Section";
import PGButton from "../components/FormButton";
import Source_sec1, {
  ProcessEmissionSection,
} from "./formsections/Source/Source_sec1";
import Source_sec2 from "./formsections/Source/Source_sec2";

// Interface for props
interface SourceFormProps {
  formValues: {
    p_method?: string;
    p_source_stream_name?: string;
    p_activity_data?: string;
    p_ad_unit?: string;
    p_net_calorific_value?: string;
    p_ncv_unit?: string;
    p_emission_factor?: string;
    p_ef_unit?: string;
    p_oxidation_factor?: string;
    p_biomass_content?: string;
    p_co2e_fossil?: string;
    p_co2e_bio?: string;
    p_energy_content_fossil?: string;
    p_energy_content_bio?: string;
  };
  onChange?: (formValues: SourceFormProps["formValues"]) => void;
  onNextStep?: () => void;
}

const SourceForm: React.FC<SourceFormProps> = ({
  formValues: externalFormValues = {},
  onChange,
  onNextStep,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  // const reportId = 54;
  const reportId = localStorage.getItem("reportId");
  const apiUrl = process.env.REACT_APP_API_URL;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add missing formValues state
  const [formValues, setFormValues] = useState<SourceFormProps["formValues"]>(
    {}
  );

  // Define missing formValuesRequiredFields
  const formValuesRequiredFields: string[] = [];

  // State to track original records from the server
  const [originalRecords, setOriginalRecords] = useState<number[]>([]);

  // State to track records that have been removed from the UI
  const [removedRecordIds, setRemovedRecordIds] = useState<number[]>([]);

  // State for section 1b: Process emissions
  const [processEmissionSections, setProcessEmissionSections] = useState<
    ProcessEmissionSection[]
  >([
    {
      id: Date.now(),
      p_method: externalFormValues.p_method || "",
      p_source_stream_name: externalFormValues.p_source_stream_name || "",
      p_activity_data: externalFormValues.p_activity_data || "",
      p_ad_unit: externalFormValues.p_ad_unit || "",
      p_net_calorific_value: externalFormValues.p_net_calorific_value || "",
      p_ncv_unit: externalFormValues.p_ncv_unit || "",
      p_emission_factor: externalFormValues.p_emission_factor || "",
      p_ef_unit: externalFormValues.p_ef_unit || "",
      p_oxidation_factor: externalFormValues.p_oxidation_factor || "",
      p_biomass_content: externalFormValues.p_biomass_content || "",
      p_co2e_fossil: externalFormValues.p_co2e_fossil || "",
      p_co2e_bio: externalFormValues.p_co2e_bio || "",
      p_energy_content_fossil: externalFormValues.p_energy_content_fossil || "",
      p_energy_content_bio: externalFormValues.p_energy_content_bio || "",
    },
  ]);

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Function to delete an emission record
  const deleteEmissionRecord = async (db_id: number) => {
    try {
      const response = await fetch(`${apiUrl}/api/cbam/b_emission/${db_id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Delete emission API error:", errorText);
        throw new Error(`Failed to delete emission record: ${errorText}`);
      }

      return true;
    } catch (error) {
      console.error(`Error deleting emission record ${db_id}:`, error);
      return false;
    }
  };

  // Function to fetch existing emission data
  const fetchExistingEmissions = async () => {
    if (!reportId) return;

    try {
      const response = await fetch(
        `${apiUrl}/api/cbam/b_emission/report/${reportId}`
      );

      if (response.ok) {
        const data = await response.json();

        if (data && data.length > 0) {
          // Save the original db_ids
          const dbIds = data.map((item: any) => item.id);
          setOriginalRecords(dbIds);

          // Transform server data to our component format
          const sections = data.map((item: any) => ({
            id: Date.now() + Math.random(), // Client-side ID for React
            db_id: item.id, // Save the database ID
            p_method: item.method || "",
            p_source_stream_name: item.source_stream_name || "",
            p_activity_data: String(item.activity_data || ""),
            p_ad_unit: item.AD_Unit || "",
            p_net_calorific_value:
              item.net_calorific_value !== null
                ? String(item.net_calorific_value)
                : "",
            p_ncv_unit: item.NCV_unit || "",
            p_emission_factor: String(item.ef || ""),
            p_ef_unit: item.ef_unit || "",
            p_oxidation_factor: String(item.oxidation_factor_percentage || ""),
            p_biomass_content:
              item.biomass_content_percentage !== null
                ? String(item.biomass_content_percentage)
                : "",
            p_co2e_fossil: String(item.CO2e_fossil || ""),
            p_co2e_bio: String(item.CO2e_bio || ""),
            p_energy_content_fossil: String(item.energy_content_fossil || ""),
            p_energy_content_bio: String(item.energy_content_bio || ""),
          }));

          if (sections.length > 0) {
            // If you want to limit to exactly 2 sections
            const limitedSections = sections.slice(0, 2);
            setProcessEmissionSections(limitedSections);

            // Track any records that were not included (if more than 2 existed)
            if (sections.length > 2) {
              const extraRecordIds = sections
                .slice(2)
                .map((s: any) => s.db_id)
                .filter(
                  (id: number | undefined): id is number => id !== undefined
                );
              setRemovedRecordIds(extraRecordIds);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching existing emissions data:", error);
    }
  };

  // Fetch existing data when component mounts
  useEffect(() => {
    fetchExistingEmissions();
  }, [reportId, apiUrl]);

  useEffect(() => {
    if (externalFormValues) {
      // Update formValues with external values if needed
      setFormValues(externalFormValues);

      const hasExternalValuesChanged = Object.keys(externalFormValues).some(
        (key) =>
          externalFormValues[key as keyof typeof externalFormValues] !==
          formValues[key as keyof typeof formValues]
      );

      // Update processEmissionSections if there's data and no existing data was loaded
      if (
        (externalFormValues.p_method ||
          externalFormValues.p_source_stream_name ||
          externalFormValues.p_activity_data) &&
        processEmissionSections.length === 1 &&
        !processEmissionSections[0].p_method
      ) {
        setProcessEmissionSections((prevSections) => [
          {
            ...prevSections[0],
            p_activity_data:
              externalFormValues.p_activity_data ||
              prevSections[0].p_activity_data,
            p_net_calorific_value:
              externalFormValues.p_net_calorific_value ||
              prevSections[0].p_net_calorific_value,
            p_emission_factor:
              externalFormValues.p_emission_factor ||
              prevSections[0].p_emission_factor,
            p_ef_unit:
              externalFormValues.p_ef_unit || prevSections[0].p_ef_unit,
            p_oxidation_factor:
              externalFormValues.p_oxidation_factor ||
              prevSections[0].p_oxidation_factor,
            p_biomass_content:
              externalFormValues.p_biomass_content ||
              prevSections[0].p_biomass_content,
          },
          ...prevSections.slice(1),
        ]);
      }
    }
  }, [externalFormValues]);

  // Alert when reportId is missing
  useEffect(() => {
    if (!reportId) {
      console.error(
        "❌ reportId is not provided - not found in localStorage or state"
      );
      alert("Report ID not found. Please select a report first.");
    }
  }, [reportId]);

  // Update parent component when data changes
  useEffect(() => {
    // Send data to parent component
    const section = processEmissionSections[0];
    if (onChange && section) {
      onChange({
        p_method: section.p_method,
        p_source_stream_name: section.p_source_stream_name,
        p_activity_data: section.p_activity_data,
        p_ad_unit: section.p_ad_unit,
        p_net_calorific_value: section.p_net_calorific_value,
        p_ncv_unit: section.p_ncv_unit,
        p_emission_factor: section.p_emission_factor,
        p_ef_unit: section.p_ef_unit,
        p_oxidation_factor: section.p_oxidation_factor,
        p_biomass_content: section.p_biomass_content,
        p_co2e_fossil: section.p_co2e_fossil,
        p_co2e_bio: section.p_co2e_bio,
        p_energy_content_fossil: section.p_energy_content_fossil,
        p_energy_content_bio: section.p_energy_content_bio,
      });
    }
  }, [processEmissionSections, onChange]);

  // Form validation
  const processRequiredFields = [
    "p_method",
    "p_source_stream_name",
    "p_activity_data",
    "p_ad_unit",
    "p_emission_factor",
    "p_ef_unit",
    "p_oxidation_factor",
  ];

  // Add new process section
  const addNewProcessSection = () => {
    setProcessEmissionSections([
      ...processEmissionSections,
      {
        id: Date.now(),
        p_method: "",
        p_source_stream_name: "",
        p_activity_data: "",
        p_ad_unit: "",
        p_net_calorific_value: "",
        p_ncv_unit: "",
        p_emission_factor: "",
        p_ef_unit: "",
        p_oxidation_factor: "",
        p_biomass_content: "",
        p_co2e_fossil: "",
        p_co2e_bio: "",
        p_energy_content_fossil: "",
        p_energy_content_bio: "",
      },
    ]);
  };

  // Remove process section
  const removeProcessSection = (idToRemove: number) => {
    if (processEmissionSections.length <= 1) return;

    // Find the section to be removed
    const sectionToRemove = processEmissionSections.find(
      (section) => section.id === idToRemove
    );

    // If it has a db_id, add it to removedRecordIds
    if (sectionToRemove && sectionToRemove.db_id !== undefined) {
      setRemovedRecordIds((prev) => [...prev, sectionToRemove.db_id as number]);
    }

    // Remove from UI
    setProcessEmissionSections(
      processEmissionSections.filter((section) => section.id !== idToRemove)
    );
  };

  // Update input in process section
  const handleProcessInputChange = (
    id: number,
    field: string,
    value: string
  ) => {
    setProcessEmissionSections((prevSections) => {
      const updatedSections = prevSections.map((section) => {
        if (section.id !== id) return section;
        const updatedSection = { ...section, [field]: value };
        // Calculate values automatically when relevant data changes
        if (
          [
            "p_activity_data",
            "p_net_calorific_value",
            "p_emission_factor",
            "p_oxidation_factor",
            "p_biomass_content",
          ].includes(field)
        ) {
          const ad = parseFloat(updatedSection.p_activity_data) || 0;
          const ncv = parseFloat(updatedSection.p_net_calorific_value) || 0;
          const ef = parseFloat(updatedSection.p_emission_factor) || 0;
          const of = parseFloat(updatedSection.p_oxidation_factor) || 0;
          const bioC = parseFloat(updatedSection.p_biomass_content) || 0;
          if (ad && ncv && ef && of) {
            // Calculate CO2e fossil
            updatedSection.p_co2e_fossil = (
              ((ad * ncv * ef) / 1000) *
              (of / 100) *
              ((100 - bioC) / 100)
            ).toFixed(4);
            // Calculate CO2e bio
            updatedSection.p_co2e_bio = (
              ((ad * ncv * ef) / 1000) *
              (of / 100) *
              (bioC / 100)
            ).toFixed(4);
          }
          if (ad && ncv) {
            // Calculate Energy Content fossil
            updatedSection.p_energy_content_fossil = (
              ((ad * ncv) / 1000) *
              ((100 - bioC) / 100)
            ).toFixed(4);
            // Calculate Energy Content bio
            updatedSection.p_energy_content_bio = (
              ((ad * ncv) / 1000) *
              (bioC / 100)
            ).toFixed(4);
          }
        }
        return updatedSection;
      });
      return updatedSections;
    });
    if (formErrors[`p_${id}_${field}`]) {
      setFormErrors((prev) => ({ ...prev, [`p_${id}_${field}`]: "" }));
    }
  };

  // Update AD Unit in process section
  const handleProcessADUnitChange = (id: number, value: string | number) => {
    const stringValue = typeof value === "string" ? value : String(value);
    setProcessEmissionSections(
      processEmissionSections.map((section) =>
        section.id === id
          ? {
              ...section,
              p_ad_unit: stringValue,
              p_ncv_unit:
                stringValue === "t"
                  ? "GJ/t"
                  : stringValue === "1000Nm3"
                  ? "GJ/1000Nm3"
                  : section.p_ncv_unit,
            }
          : section
      )
    );
    if (formErrors[`p_${id}_p_ad_unit`]) {
      setFormErrors((prev) => ({ ...prev, [`p_${id}_p_ad_unit`]: "" }));
    }
  };

  // Update input in form values (for other parts)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    // Clear errors when user edits data
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent duplicate submissions
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!reportId) {
      alert("❌ Report ID (reportId) not found. Please create a report first.");
      setIsSubmitting(false);
      return;
    }

    // Validate data
    const newErrors: { [key: string]: string } = {};

    // Check each section for process
    processEmissionSections.forEach((section) => {
      processRequiredFields.forEach((field) => {
        const fieldValue = section[field as keyof ProcessEmissionSection];
        if (!fieldValue) {
          newErrors[`p_${section.id}_${field}`] = "Please fill in this field";
        }
      });
    });

    // Check formValues
    formValuesRequiredFields.forEach((field) => {
      if (!formValues[field as keyof typeof formValues]) {
        newErrors[field] = "Please fill in this field";
      }
    });

    // If there are errors, update state and don't send data
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      // Scroll to the first error field
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.getElementsByName(firstErrorField)[0];
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. First delete any records that have been removed
      for (const recordId of removedRecordIds) {
        await deleteEmissionRecord(recordId);
      }

      // 2. Process each emission section
      for (const section of processEmissionSections) {
        const payload = {
          report_id: reportId,
          method: section.p_method,
          source_stream_name: section.p_source_stream_name,
          activity_data: parseFloat(section.p_activity_data),
          AD_Unit: section.p_ad_unit,
          net_calorific_value: section.p_net_calorific_value
            ? parseFloat(section.p_net_calorific_value)
            : null,
          NCV_unit: section.p_ncv_unit || null,
          ef: parseFloat(section.p_emission_factor),
          ef_unit: section.p_ef_unit,
          oxidation_factor_percentage: parseFloat(section.p_oxidation_factor),
          biomass_content_percentage: section.p_biomass_content
            ? parseFloat(section.p_biomass_content)
            : null,
          CO2e_fossil: parseFloat(section.p_co2e_fossil || "0"),
          CO2e_bio: parseFloat(section.p_co2e_bio || "0"),
          energy_content_fossil: parseFloat(
            section.p_energy_content_fossil || "0"
          ),
          energy_content_bio: parseFloat(section.p_energy_content_bio || "0"),
        };

        // Check if this is an edit (has db_id) or new creation
        const isEditing = section.db_id !== undefined;

        const method = isEditing ? "PUT" : "POST";
        const url = isEditing
          ? `${apiUrl}/api/cbam/b_emission/${section.db_id}`
          : `${apiUrl}/api/cbam/b_emission`;

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`${method} emission API error:`, errorText);
          throw new Error(
            `Failed to ${
              isEditing ? "update" : "submit"
            } process emissions data: ${errorText}`
          );
        }

        const responseData = await response.json();
      }

      // Navigate to report page after successful submission
      alert("Data saved successfully!");
      // Go to next step
      if (onNextStep) onNextStep();
      localStorage.removeItem("cbam_report_id");
    } catch (error: any) {
      console.error("❌ Form submission error:", error);
      alert(`❌ Error: ${error.message || "Please try again"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the component
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <form onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3} alignItems="stretch">
          <Box>
            <Typography
              fontSize="32px"
              variant="h5"
              fontWeight="bold"
              gutterBottom
              color="#1976d2"
            >
              Installation's emission at source stream and emission source level
            </Typography>
            <Typography
              fontSize="22px"
              variant="subtitle1"
              color="text.secondary"
              gutterBottom
            >
              การปล่อยก๊าซเรือนกระจกของสถานประกอบการ
            </Typography>
          </Box>

          {/* SECTION 1: Source stream and emission source */}
          <Section
            title="Source stream and emission source"
            subtitle=""
            defaultExpanded={true}
          >
            <Source_sec1
              processEmissionSections={processEmissionSections}
              formErrors={formErrors}
              handleProcessInputChange={handleProcessInputChange}
              handleProcessADUnitChange={handleProcessADUnitChange}
              removeProcessSection={removeProcessSection}
              addNewProcessSection={addNewProcessSection}
            />
          </Section>

          {/* Submit button */}
          <PGButton
            text={reportId ? "Update" : "Create"}
            loading={isSubmitting}
            type="submit"
          />
        </Grid>
      </form>
    </Container>
  );
};

export default SourceForm;
