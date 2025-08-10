import React from "react";
import DataDisplayTab from "./Report_design";


interface TabProps {
  reportId: string | null;
  formValues: any;
  setFormValues: React.Dispatch<React.SetStateAction<any>>;
}

const TabE_PurchasedPrecursors: React.FC<TabProps> = ({ 
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
        title: "Purchased Precursors",
        subtitle: "การสั่งซื้อวัตถุดิบ",
        sheetName: "E_PurchPrec",
        apiEndpoint: "E_PurchPrec",
        emptyMessage: "No purchased precursors data available for this report."
      }}
    />
  );
};

export default TabE_PurchasedPrecursors;