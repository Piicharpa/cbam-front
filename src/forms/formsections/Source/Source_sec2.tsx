import React from "react";
import { Box } from "@mui/material";
import LabeledTextField from "../../../components/LabeledTextField";
import LabeledAutocomplete from "../../../components/LabeledAutoComplete";
import { generalinfo } from "../../../components/dropdown/generalinfo";
import { justification } from "../../../components/dropdown/justification";
import { qualityassurance } from "../../../components/dropdown/qualityassurance";

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
  // แสดงข้อมูลเพื่อการดีบัก

  // สร้าง dropdown options
  const generalInfoOptions = generalinfo?.map((item) => item?.name || "") || [];
  const justificationOptions =
    justification?.map((item) => item?.name || "") || [];
  const qualityAssuranceOptions =
    qualityassurance?.map((item) => item?.name || "") || [];

  return (
    <>
      {/* Box1: GHG emissions and energy consumption */}
      <Box mb={3}>
        <div style={{ textAlign: "left", marginBottom: "1.5rem" ,fontSize: "20px"}}>
          <strong> GHG emissions and energy consumption </strong>
        </div>
        <LabeledTextField
          type="number"
          caption="Fuel balance"
          defination="กรอกปริมาณรวมของการปล่อย Emission ทางอ้อม"
          label=""
          name="manual_fuel_balance"
          value={formValues.manual_fuel_balance || ""}
          onChange={handleInputChange}
          error={formErrors.manual_fuel_balance}
          helperText={formErrors.manual_fuel_balance}
          inputProps={{
            step: "any",
            placeholder: "",
            className: "appearance-none",
          }}
          required
        />
        <LabeledTextField
          type="number"
          caption="Greenhouse gas emissions balance & information on data quality"
          defination=""
          label=""
          name="manual_GHG_emissions_balance"
          value={formValues.manual_GHG_emissions_balance || ""}
          onChange={handleInputChange}
          error={formErrors.manual_GHG_emissions_balance}
          helperText={formErrors.manual_GHG_emissions_balance}
          inputProps={{
            step: "any",
            placeholder: "",
            className: "appearance-none",
          }}
          required
        />
      </Box>
      {/* Box2: Information on the data quality and quality assurance  */}
      <Box mb={3}>
        <div style={{ textAlign: "left", marginBottom: "1.5rem" ,fontSize: "20px"}}>
          <strong>
            {" "}
            Information on the data quality and quality assurance{" "}
          </strong>
        </div>
        <LabeledAutocomplete
          caption="General information on data quality"
          defination="ข้อมูลทั่วไปเกี่ยวกับคุณภาพของข้อมูล"
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
          defination="เหตุผลในการใช้ค่าปกติ (ถ้าเกี่ยวข้อง)"
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
          required
        />
        <LabeledAutocomplete
          caption="Information on quality assurance"
          defination="ข้อมูลการประกันคุณภาพ "
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
