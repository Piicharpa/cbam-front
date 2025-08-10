import React from "react";
import DataDisplayTab from "./Report_design";


interface TabProps {
  reportId: string | null;
  formValues: any;
  setFormValues: React.Dispatch<React.SetStateAction<any>>;
}

const TabD_Process: React.FC<TabProps> = ({ 
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
        title: "Process",
        subtitle: "กระบวนการ",
        sheetName: "D_Processes",
        apiEndpoint: "D_Processes",
        emptyMessage: "No process data available for this report."
      }}
    />
  );
};

export default TabD_Process;