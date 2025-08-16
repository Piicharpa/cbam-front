import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Typography, Paper, Chip } from "@mui/material";
import DataDisplayTab from "./Report_design";

interface SummaryData {
  data: Array<{ product_name: string; cn_code: string }>;
  sum: Array<{
    SEE_direct_sum: number;
    SEE_indirect_sum: number;
    SEE_total_sum: number;
  }>;
  unit: Array<{
    SEE_direct_sum: string;
    SEE_indirect_sum: string;
    SEE_total_sum: string;
  }>;
}

interface TabProps {
  reportId: string | null;
  formValues: any;
  setFormValues: React.Dispatch<React.SetStateAction<any>>;
}

const TabZ_Summary: React.FC<TabProps> = ({
  reportId,
  formValues,
  setFormValues,
}) => {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const handleDataFetched = (data: SummaryData) => {
    setSummaryData(data);
    setLoading(false);
  };

  // แสดงผลแบบกำหนดเองภายใน DataDisplayTab
  return (
    <DataDisplayTab
      reportId={reportId}
      formValues={formValues}
      setFormValues={setFormValues}
      config={{
        title: "Summary",
        subtitle: "สรุป",
        sheetName: "Summary",
        apiEndpoint: "Summary",
        emptyMessage: "No summary data available for this report.",
      }}
      onDataFetched={handleDataFetched}
    >
      <Box
        sx={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(1,144,195,0.1) 0%, rgba(255,255,255,0) 70%)",
          zIndex: 0,
        }}
      />

      {isLoading ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CircularProgress size={24} />
          <Typography color="text.secondary">
            Loading summary data...
          </Typography>
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ position: "relative", zIndex: 1 }}>
          Error loading data: {error}
        </Typography>
      ) : (
        summaryData &&
        summaryData.data &&
        summaryData.data.length > 0 && (
          <>
            {/* Header Section with Product Information */}
            <Box sx={{ mb: 4, pb: 3, borderBottom: "1px solid #e0e0e0" }}>
              <Typography
                variant="h5"
                color="primary.dark"
                sx={{ position: "relative", zIndex: 1, mb: 2, fontWeight: 600 }}
              >
                Product Information | ข้อมูลผลิตภัณฑ์
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 2,
                    bgcolor: "rgba(1,144,195,0.05)",
                    borderRadius: 2,
                    border: "1px solid rgba(1,144,195,0.1)",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{ minWidth: 160, fontWeight: 500 }}
                  >
                    Product | สินค้า:
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ color: "#0190c3", fontWeight: 600 }}
                  >
                    {summaryData.data[0].product_name || "N/A"}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 2,
                    bgcolor: "rgba(1,144,195,0.03)",
                    borderRadius: 2,
                    border: "1px solid rgba(1,144,195,0.08)",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{ minWidth: 160, fontWeight: 500 }}
                  >
                    CN code | รหัส CN:
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ color: "#0190c3", fontWeight: 600 }}
                  >
                    {summaryData.data[0].cn_code || "N/A"}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Emissions Summary Section */}
            <Typography
              variant="h5"
              color="primary.dark"
              sx={{ position: "relative", zIndex: 1, mb: 3, fontWeight: 600 }}
            >
              Emissions Summary | สรุปการปล่อยมลพิษ
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                p: 3,
                bgcolor: "rgba(255,255,255,0.7)",
                borderRadius: 2,
                border: "1px solid #e0e0e0",
              }}
            >
              {/* Direct Emissions */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography
                  variant="h6"
                  sx={{ color: "#0190c3", fontWeight: 600, mb: 1 }}
                >
                  Direct Emissions | การปล่อยมลพิษทางตรง
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "rgba(1,144,195,0.04)",
                  }}
                >
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ minWidth: 200 }}
                  >
                    SEE (direct) | ค่า SEE (ทางตรง):
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#0190c3" }}
                  >
                    {summaryData.sum &&
                    summaryData.sum.length > 0 &&
                    summaryData.sum[0]?.SEE_direct_sum
                      ? summaryData.sum[0]?.SEE_direct_sum.toFixed(4)
                      : "N/A"}{" "}
                    <span style={{ fontSize: "0.8em", fontWeight: 400 }}>
                      {(summaryData.unit &&
                        summaryData.unit[0]?.SEE_direct_sum) ||
                        ""}
                    </span>
                  </Typography>
                </Box>
              </Box>

              {/* Indirect Emissions */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography
                  variant="h6"
                  sx={{ color: "#0190c3", fontWeight: 600, mb: 1 }}
                >
                  Indirect Emissions | การปล่อยมลพิษทางอ้อม
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "rgba(1,144,195,0.04)",
                  }}
                >
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ minWidth: 200 }}
                  >
                    SEE (indirect) | ค่า SEE (ทางอ้อม):
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#0190c3" }}
                  >
                    {summaryData.sum &&
                    summaryData.sum.length > 0 &&
                    summaryData.sum[0]?.SEE_indirect_sum
                      ? summaryData.sum[0]?.SEE_indirect_sum.toFixed(4)
                      : "N/A"}{" "}
                    <span style={{ fontSize: "0.8em", fontWeight: 400 }}>
                      {(summaryData.unit &&
                        summaryData.unit[0]?.SEE_indirect_sum) ||
                        ""}
                    </span>
                  </Typography>
                </Box>
              </Box>

              {/* Total Emissions */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  mt: 1,
                  p: 3,
                  borderRadius: 2,
                  bgcolor: "rgba(1,144,195,0.08)",
                  borderTop: "1px dashed rgba(1,144,195,0.3)",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: "#0057a3", fontWeight: 600, mb: 1 }}
                >
                  Total Emissions | การปล่อยมลพิษรวม
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "rgba(255,255,255,0.7)",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      minWidth: 200,
                      fontWeight: 500,
                      color: "text.primary",
                    }}
                  >
                    SEE (total) | ค่า SEE (รวม):
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "#0057a3" }}
                  >
                    {summaryData.sum &&
                    summaryData.sum.length > 0 &&
                    summaryData.sum[0]?.SEE_total_sum
                      ? summaryData.sum[0]?.SEE_total_sum.toFixed(4)
                      : "N/A"}{" "}
                    <span style={{ fontSize: "0.8em", fontWeight: 400 }}>
                      {(summaryData.unit &&
                        summaryData.unit[0]?.SEE_total_sum) ||
                        ""}
                    </span>
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Alternative Display when sum array is empty */}
            {summaryData.sum && summaryData.sum.length === 0 && (
              <Box
                sx={{
                  mt: 3,
                  p: 3,
                  bgcolor: "rgba(255,244,229,0.5)",
                  borderRadius: 2,
                  border: "1px solid #ffe0b2",
                }}
              >
                <Typography
                  variant="h6"
                  color="warning.dark"
                  sx={{ mb: 1, fontWeight: 500 }}
                >
                  ไม่พบข้อมูลการคำนวณ | No calculation data available
                </Typography>

                <Typography variant="body1">
                  ค่า SEE (ทางตรง): <b>N/A</b>{" "}
                  {(summaryData.unit && summaryData.unit[0]?.SEE_direct_sum) ||
                    ""}
                </Typography>

                <Typography variant="body1">
                  ค่า SEE (ทางอ้อม): <b>N/A</b>{" "}
                  {(summaryData.unit &&
                    summaryData.unit[0]?.SEE_indirect_sum) ||
                    ""}
                </Typography>

                <Typography variant="body1">
                  ค่า SEE (รวม): <b>N/A</b>{" "}
                  {(summaryData.unit && summaryData.unit[0]?.SEE_total_sum) ||
                    ""}
                </Typography>

                <Box sx={{ mt: 2, p: 2, bgcolor: "white", borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    หมายเหตุ: ข้อมูลหน่วยวัดพบในระบบ แต่ยังไม่มีข้อมูลการคำนวณ
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Footnote */}
            <Box
              sx={{
                mt: 4,
                display: "flex",
                justifyContent: "space-between",
                borderTop: "1px solid #e0e0e0",
                pt: 2,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                หมายเหตุ: SEE = Specific Emissions Embedded
                (การปล่อยมลพิษต่อหน่วยสินค้า)
              </Typography>

              <Typography variant="caption" color="text.secondary">
                ข้อมูล ณ วันที่: {new Date().toLocaleDateString("th-TH")}
              </Typography>
            </Box>
          </>
        )
      )}
    </DataDisplayTab>
  );
};

export default TabZ_Summary;
