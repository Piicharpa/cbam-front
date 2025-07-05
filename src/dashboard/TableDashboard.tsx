import React, { useEffect, useState } from "react";
import SumupForm from "../forms/SumupForm";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import DescriptionIcon from "@mui/icons-material/Description";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Link } from "react-router-dom";

interface CBAMData {
  product: string;
  cncode: string;
  volume?: string;
  carbon?: string;
  date: string;
  ref: string;
  id: number;
  category?: string;
}

// ✅ Fixed interface - make functions optional with proper typing
interface TableDashboardProps {
  onEditReport?: ((reportId: string | number) => void) | undefined;
  onDeleteReport?: ((reportId: string | number) => void) | undefined;
}

const TableDashboard: React.FC<TableDashboardProps> = ({
  onEditReport,
  onDeleteReport,
}) => {
  const [data, setData] = useState<CBAMData[]>([]);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(
          "🔍 Fetching CBAM reports from:",
          `${apiUrl}/api/cbam/report/company/1`
        );

        const response = await axios.get(`${apiUrl}/api/cbam/report/company/1`);

        const raw = response.data;
        console.log("📋 Raw API response:", raw);

        const items = Array.isArray(raw) ? raw : [raw];

        const mapped: CBAMData[] = items.map((item: any) => ({
          product: item.industry_type_name || "Unknown Product",
          category: item.goods_category_name?.trim() || "",
          cncode: item.cncode?.trim() || item.cn_code || "N/A",
          date: item.reporting_period_start
            ? dayjs(item.reporting_period_start).format("D MMM YYYY")
            : dayjs().format("D MMM YYYY"),
          ref: item.cn_code_name || item.name || `Report ${item.id}`,
          id: item.id,
        }));

        console.log("✅ Mapped CBAM data:", mapped);
        setData(mapped);
      } catch (err) {
        console.error("❌ Error fetching CBAM data:", err);
        setData([]);
      }
    };

    fetchData();
  }, [apiUrl]);

  // ✅ Fixed function with proper undefined check
  const handleEdit = (reportId: number) => {
    console.log("✏️ Edit report clicked for ID:", reportId);
    if (onEditReport) {
      onEditReport(reportId);
    }
  };

  // ✅ Fixed function with proper undefined check
  const handleDelete = (reportId: number) => {
    console.log("🗑️ Delete report clicked for ID:", reportId);
    if (onDeleteReport) {
      onDeleteReport(reportId);
    }
  };

  return (
    <Box>
      {/* <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
        เอกสาร <strong>CBAM</strong> ส่งไป <strong>EU</strong> ล่าสุด
      </Typography> */}

      {data.length === 0 ? (
        // <Paper
        //   elevation={0}
        //   sx={{
        //     p: 4,
        //     textAlign: "center",
        //     borderRadius: 2,
        //     backgroundColor: "#f9f9f9",
        //   }}
        // >
          <Typography variant="body1" color="text.secondary">
            No CBAM reports found
          </Typography>
        // </Paper>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ borderRadius: 2 }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: "#f9f9f9" }}>
              <TableRow>
                <TableCell>
                  <strong>ชื่อผลิตภัณฑ์</strong>
                </TableCell>
                <TableCell>
                  <strong>หมวดหมู่สินค้า</strong>
                </TableCell>
                <TableCell>
                  <strong>CN Code</strong>
                </TableCell>
                <TableCell>
                  <strong>วันลงทะเบียน</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>รายงาน</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>แก้ไข</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>ลบ</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow
                  key={`${row.id}-${idx}`}
                  sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {row.product}
                    </Typography>
                    {/* {row.ref && row.ref !== row.product && (
                      <Typography variant="caption" color="text.secondary">
                        {row.ref}
                      </Typography>
                    )} */}
                  </TableCell>

                  <TableCell>
                    {row.category && (
                      <Chip
                        label={row.category}
                        size="small"
                        variant="outlined"
                        color="secondary"
                      />
                    )}
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {row.cncode}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={row.date}
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Tooltip title="ดูรายงาน">
                      <IconButton
                        component={Link}
                        to={`/report?reportId=${row.id}`}
                        color="primary"
                        size="small"
                      >
                        <DescriptionIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>

                  <TableCell align="center">
                    <Box display="flex" gap={0.5} justifyContent="center">
                      {/* Edit Button - only show if callback exists */}
                      {onEditReport && (
                        <Tooltip title="แก้ไขรายงาน">
                          <IconButton
                            onClick={() => handleEdit(row.id)}
                            color="primary"
                            size="small"
                            sx={{
                              "&:hover": {
                                backgroundColor: "primary.light",
                                color: "white",
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box>
                      {/* Delete Button - only show if callback exists */}
                      {onDeleteReport && (
                        <Tooltip title="ลบรายงาน">
                          <IconButton
                            onClick={() => handleDelete(row.id)}
                            color="error"
                            size="small"
                            sx={{
                              "&:hover": {
                                backgroundColor: "error.light",
                                color: "white",
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Show total count */}
      {data.length > 0 && (
        <Box
          mt={2}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="body2" color="text.secondary">
            รวม {data.length} รายงาน
          </Typography>

          <Box>
            <Tooltip title="รีเฟรชข้อมูล">
              <IconButton
                onClick={() => window.location.reload()}
                size="small"
                color="primary"
              >
                <Typography variant="caption">🔄</Typography>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}

      {/* Debug information - only in development */}
      {process.env.NODE_ENV === "development" && (
        <Box mt={2} p={2} sx={{ backgroundColor: "#f5f5f5", borderRadius: 1 }}>
          <details>
            <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
              🐛 Debug Information (Development Mode)
            </summary>
            <Box mt={1}>
              <Typography variant="caption" component="div">
                <strong>API URL:</strong> {apiUrl}/api/cbam/report/company/1
              </Typography>
              <Typography variant="caption" component="div">
                <strong>Reports loaded:</strong> {data.length}
              </Typography>
              <Typography variant="caption" component="div">
                {/* ✅ Fixed: Check if function is defined (not null/undefined) */}
                <strong>Has onEditReport:</strong> {onEditReport ? "Yes" : "No"}
              </Typography>
              <Typography variant="caption" component="div">
                {/* ✅ Fixed: Check if function is defined (not null/undefined) */}
                <strong>Has onDeleteReport:</strong>{" "}
                {onDeleteReport ? "Yes" : "No"}
              </Typography>
              <Typography variant="caption" component="div">
                <strong>Edit button visible:</strong>{" "}
                {onEditReport ? "Yes" : "No"}
              </Typography>
              <Typography variant="caption" component="div">
                <strong>Delete button visible:</strong>{" "}
                {onDeleteReport ? "Yes" : "No"}
              </Typography>

              {/* {data.length > 0 && (
                <Box mt={1}>
                  <Typography
                    variant="caption"
                    component="div"
                    fontWeight="bold"
                  >
                    Sample Data:
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      fontSize: "10px",
                      backgroundColor: "#fff",
                      p: 1,
                      border: "1px solid #ddd",
                      borderRadius: 1,
                      mt: 0.5,
                      overflow: "auto",
                      maxHeight: "150px",
                    }}
                  >
                    {JSON.stringify(data[0], null, 2)}
                  </Box>
                </Box>
              )} */}

              {/* Debug button interactions */}
              <Box mt={1} display="flex" gap={1}>
                <button
                  type="button"
                  onClick={() => {
                    console.log("=== TableDashboard Debug ===");
                    console.log("Data length:", data.length);
                    console.log("onEditReport function:", onEditReport);
                    console.log("onDeleteReport function:", onDeleteReport);
                    console.log("Sample data:", data[0] || "No data");
                  }}
                  style={{
                    fontSize: "10px",
                    padding: "4px 8px",
                    backgroundColor: "#2196f3",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Log State
                </button>

                {data.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const testId = data[0].id;
                      console.log("=== Testing Callbacks ===");
                      console.log("Test report ID:", testId);
                      if (onEditReport) {
                        console.log("Testing onEditReport...");
                        onEditReport(testId);
                      } else {
                        console.log("onEditReport not available");
                      }
                    }}
                    style={{
                      fontSize: "10px",
                      padding: "4px 8px",
                      backgroundColor: "#4caf50",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Test Edit
                  </button>
                )}
              </Box>
            </Box>
          </details>
        </Box>
      )}
    </Box>
  );
};

export default TableDashboard;
