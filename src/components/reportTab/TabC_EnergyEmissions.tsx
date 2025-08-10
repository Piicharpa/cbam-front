import React from "react";
import DataDisplayTab from "./Report_design";


interface TabProps {
  reportId: string | null;
  formValues: any;
  setFormValues: React.Dispatch<React.SetStateAction<any>>;
}

const TabC_EnergyEmissions: React.FC<TabProps> = ({ 
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
        title: "Emission and Energy",
        subtitle: "การปล่อยมลพิษด้านพลังงาน",
        sheetName: "C_Emissions&Energy",
        apiEndpoint: "C_Emissions&Energy",
        emptyMessage: "No emission and energy data available for this report."
      }}
    />
  );
};

export default TabC_EnergyEmissions;