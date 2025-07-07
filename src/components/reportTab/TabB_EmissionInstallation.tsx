import React from "react";
import DataDisplayTab from "./Report_design";

interface TabProps {
  reportId: string | null;
  formValues: any;
  setFormValues: React.Dispatch<React.SetStateAction<any>>;
}

const TabB_EmissionInstallation: React.FC<TabProps> = ({ 
  formValues, 
  setFormValues, 
  reportId 
}) => {
  return (
    <DataDisplayTab
      reportId={reportId}
      formValues={formValues}
      setFormValues={setFormValues}
      config={{
        title: "Emission Installation",
        subtitle: "การปล่อยมลพิษของสถานประกอบการ",
        sheetName: "B_EmInst",
        apiEndpoint: "B_EmInst",
        emptyMessage: "No emission installation data available for this report."
      }}
    />
  );
};

export default TabB_EmissionInstallation;