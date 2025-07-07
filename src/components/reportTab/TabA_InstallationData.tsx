import React from "react";
import DataDisplayTab from "./Report_design";

interface TabProps {
  reportId: string | null;
  formValues: any;
  setFormValues: React.Dispatch<React.SetStateAction<any>>;
}

const TabA_InstallationData: React.FC<TabProps> = ({
  formValues,
  setFormValues,
  reportId,
}) => {
  return (
    <DataDisplayTab
      reportId={reportId}
      formValues={formValues}
      setFormValues={setFormValues}
      config={{
        title: "Installation Data",
        subtitle: "ข้อมูลสถานประกอบการ",
        sheetName: "A_InstData",
        apiEndpoint: "A_InstData",
        emptyMessage: "No installation data available for this report.",
      }}
    />
  );
};

export default TabA_InstallationData;
