import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import LabeledTextField from "../../../components/LabeledTextField";
import LabeledAutocomplete from "../../../components/LabeledAutoComplete";
import { generalinfo } from "../../../components/dropdown/generalinfo";
import { justification } from "../../../components/dropdown/justification";
import { qualityassurance } from "../../../components/dropdown/qualityassurance";

interface EmissionData {
  id: number;
  report_id: number;
  method: string;
  source_stream_name: string;
  activity_data: number;
  AD_Unit: string;
  net_calorific_value: number;
  ef: number;
  ef_unit: string;
  oxidation_factor_percentage: number;
  biomass_content_percentage: number;
  NCV_unit: string;
  CO2e_fossil: number;
  CO2e_bio: number;
  energy_content_fossil: number;
  energy_content_bio: number;
  created_at: string;
  updated_at: string;
}

interface FormValues {
  reportId: string;
  manual_fuel_balance: string;
  manual_GHG_emissions_balance: string;
  generatl_info_on_data_quality: string;
  justification_for_use_default_values: string;
  information_quality_ssurance: string;
}

interface SourceFormSection2Props {
  formValues: FormValues;
  formErrors: { [key: string]: string };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFormValues: React.Dispatch<React.SetStateAction<FormValues>>;
  setFormErrors: React.Dispatch<
    React.SetStateAction<{ [key: string]: string }>
  >;
}

const Source_sec2: React.FC<SourceFormSection2Props> = ({
  formValues,
  formErrors,
  handleInputChange,
  setFormValues,
  setFormErrors,
}) => {
  const [emissionsData, setEmissionsData] = useState<EmissionData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // สร้าง dropdown options
  const generalInfoOptions = generalinfo?.map((item) => item?.name || "") || [];
  const justificationOptions =
    justification?.map((item) => item?.name || "") || [];
  const qualityAssuranceOptions =
    qualityassurance?.map((item) => item?.name || "") || [];

  // Fetch emissions data from API
  useEffect(() => {
    const fetchEmissionsData = async () => {
      // Get reportId from formValues or from localStorage
      const reportId = formValues.reportId || localStorage.getItem("reportId");

      if (!reportId) {
        console.error("Report ID not found");
        setError("Report ID not found");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const apiUrl =
          process.env.REACT_APP_API_URL || "http://178.128.123.212:5000";
        const response = await fetch(
          `${apiUrl}/api/cbam/b_emission/report/${reportId}`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch emissions data: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        setEmissionsData(Array.isArray(data) ? data : [data]);

        // Calculate the values
        calculateBalances(Array.isArray(data) ? data : [data]);
      } catch (err) {
        console.error("Error fetching emissions data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmissionsData();
  }, [formValues.reportId]);

  // Calculate the balances
  const calculateBalances = (data: EmissionData[]) => {
    let totalFuelBalance = 0;
    let totalGHGEmissionsBalance = 0;

    data.forEach((item) => {
      // Sum energy content values
      const energyContentFossil = Number(item.energy_content_fossil) || 0;
      const energyContentBio = Number(item.energy_content_bio) || 0;
      totalFuelBalance += energyContentFossil + energyContentBio;

      // Sum CO2e values
      const co2eFossil = Number(item.CO2e_fossil) || 0;
      const co2eBio = Number(item.CO2e_bio) || 0;
      totalGHGEmissionsBalance += co2eFossil + co2eBio;
    });

    // Update form values with calculated totals
    setFormValues((prev) => ({
      ...prev,
      manual_fuel_balance: totalFuelBalance.toFixed(4),
      manual_GHG_emissions_balance: totalGHGEmissionsBalance.toFixed(4),
    }));
  };

  return (
    <>
      {/* Box1: GHG emissions and energy consumption */}
      <Box mb={3}>
        <div
          style={{
            textAlign: "left",
            marginBottom: "1.5rem",
            fontSize: "20px",
          }}
        >
          <strong> GHG emissions and energy consumption </strong>
        </div>
        <LabeledTextField
          type="number"
          caption="Fuel balance"
          defination="ปริมาณเชื้อเพลิง"
          unit="TJ"
          label=""
          name="manual_fuel_balance"
          value={formValues.manual_fuel_balance || ""}
          onChange={handleInputChange}
          error={formErrors.manual_fuel_balance}
          helperText={
            isLoading ? "Loading..." : error || formErrors.manual_fuel_balance
          }
          inputProps={{
            step: "any",
            placeholder: "",
            className: "appearance-none",
          }}
          required
          disabled
        />
        <LabeledTextField
          type="number"
          caption="Greenhouse gas emissions balance & information on data quality"
          defination="สรุปผลการปล่อยก๊าซเรือนกระจก"
          unit="t"
          label=""
          name="manual_GHG_emissions_balance"
          value={formValues.manual_GHG_emissions_balance || ""}
          onChange={handleInputChange}
          error={formErrors.manual_GHG_emissions_balance}
          helperText={
            isLoading
              ? "Loading..."
              : error || formErrors.manual_GHG_emissions_balance
          }
          inputProps={{
            step: "any",
            placeholder: "",
            className: "appearance-none",
          }}
          required
          disabled
        />
      </Box>
      {/* Box2: Information on the data quality and quality assurance  */}
      <Box mb={3}>
        <div
          style={{
            textAlign: "left",
            marginBottom: "1.5rem",
            fontSize: "20px",
          }}
        >
          <strong>
            {" "}
            Information on the data quality and quality assurance{" "}
          </strong>
        </div>
        <LabeledAutocomplete
          caption="General information on data quality"
          defination="เลือกข้อมูลทั่วไปเกี่ยวกับคุณภาพของข้อมูล"
          label=""
          name="generatl_info_on_data_quality"
          value={formValues.generatl_info_on_data_quality || ""}
          onChange={(value: string) => {
            setFormValues((prev) => ({
              ...prev,
              generatl_info_on_data_quality: value,
            }));
            setFormErrors((prev) => ({
              ...prev,
              generatl_info_on_data_quality: "",
            }));
          }}
          error={formErrors.generatl_info_on_data_quality}
          helperText={formErrors.generatl_info_on_data_quality}
          options={generalInfoOptions}
          required
        />
        <LabeledAutocomplete
          caption="Justification for use of default values (if relevant)"
          defination="เลือกเหตุผลในการใช้ค่ากลาง (ถ้าเกี่ยวข้อง)"
          label=""
          name="justification_for_use_default_values"
          value={formValues.justification_for_use_default_values || ""}
          onChange={(value: string) => {
            setFormValues((prev) => ({
              ...prev,
              justification_for_use_default_values: value,
            }));
            // Clear any errors when the field is updated
            setFormErrors((prev) => ({
              ...prev,
              justification_for_use_default_values: "",
            }));
          }}
          error={formErrors.justification_for_use_default_values}
          helperText={formErrors.justification_for_use_default_values}
          options={justificationOptions}
        />
        <LabeledAutocomplete
          caption="Information on quality assurance"
          defination="คุณภาพของข้อมูลและการประกันคุณภาพของข้อมูล "
          label=""
          name="information_quality_ssurance"
          value={formValues.information_quality_ssurance || ""}
          onChange={(value: string) => {
            setFormValues((prev) => ({
              ...prev,
              information_quality_ssurance: value,
            }));
            // Clear any errors when the field is updated
            setFormErrors((prev) => ({
              ...prev,
              information_quality_ssurance: "",
            }));
          }}
          error={formErrors.information_quality_ssurance}
          helperText={formErrors.information_quality_ssurance}
          options={qualityAssuranceOptions}
          required
        />
      </Box>
    </>
  );
};

export default Source_sec2;
