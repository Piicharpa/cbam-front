import React, { useEffect, useState } from "react";
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
  TextField,
  InputAdornment,
  Grid,
  Button,
  Stack,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Collapse,
  Divider,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import DescriptionIcon from "@mui/icons-material/Description";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ClearIcon from "@mui/icons-material/Clear";
import TuneIcon from "@mui/icons-material/Tune";
import { Link } from "react-router-dom";

import { fetchCompanyData, type CompanyType } from "../utils/company";
import { useToken } from "../utils/localStorage";

interface CBAMData {
  product: string;
  cncode: string;
  volume?: string;
  carbon?: string;
  date: string;
  rawDate?: string; // Store original date for filtering
  ref: string;
  id: number;
  category?: string;
  see: number;
}

interface TableDashboardProps {
  onEditReport?: ((reportId: string | number) => void) | undefined;
  onDeleteReport?: ((reportId: string | number) => void) | undefined;
}

const TableDashboard: React.FC<TableDashboardProps> = ({
  onEditReport,
  onDeleteReport,
}) => {
  // ✅ Properly parse user account data
  const user_account = localStorage.getItem("user_account");
  const token = user_account ? JSON.parse(user_account).token : null;
  
  // ✅ Extract company_id properly
  const companyId = (() => {
    if (!user_account) return null;
    try {
      const parsed = JSON.parse(user_account);
      return parsed.company?.[0]?.company_id || null;
    } catch {
      return null;
    }
  })();

  const [data, setData] = useState<CBAMData[]>([]);
  const [filteredData, setFilteredData] = useState<CBAMData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchData = async (company_id: number) => {
    // ✅ Add safety check for token and company_id
    if (!token || !company_id) {
      console.error("Missing token or company_id");
      setData([]);
      setFilteredData([]);
      return;
    }

    try {
      console.log("Fetching data for company:", company_id);
      console.log("Using token:", token.substring(0, 20) + "...");

      const response = await axios.get(
        `${apiUrl}/api/cbam/report/dashboard/${company_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const raw = response.data;
      const items = Array.isArray(raw) ? raw : [raw];

      const mapped: CBAMData[] = items.map((item: any) => {
        const rawDate = item.updated_at || new Date().toISOString();
        return {
          product: item.product_name || "Unknown Product",
          category: item.goods_category_name?.trim() || "",
          cncode: item.cncode?.trim() || item.cn_code || "N/A",
          see: item?.SEE_total_sum,
          date: dayjs(rawDate).format("D MMM YYYY"),
          rawDate: rawDate, // Store raw date for filtering
          ref: item.cn_code_name || item.name || `Report ${item.id}`,
          id: item.report_id,
        };
      });

      setData(mapped);
      setFilteredData(mapped);
    } catch (err) {
      console.error("❌ Error fetching CBAM data:", err);
      
      // ✅ Better error handling for different error types
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          console.error("Authentication failed - token may be expired");
          // Optionally redirect to login or show auth error
        } else {
          console.error("API Error:", err.response?.status, err.response?.data);
        }
      }
      
      setData([]);
      setFilteredData([]);
    }
  };

  useEffect(() => {
    // ✅ Only fetch if we have both token and companyId
    if (token && companyId) {
      fetchData(companyId);
    } else {
      console.error("Missing required authentication data:", { 
        hasToken: !!token, 
        companyId 
      });
    }
  }, [apiUrl, token, companyId]);

  // Apply filters when search term, dates, or category changes
  useEffect(() => {
    let results = [...data];

    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      results = results.filter(
        (item) =>
          item.product.toLowerCase().includes(lowerSearchTerm) ||
          item.category?.toLowerCase().includes(lowerSearchTerm) ||
          item.cncode.toLowerCase().includes(lowerSearchTerm) ||
          item.ref.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Apply date range filter
    if (startDate && endDate) {
      results = results.filter((item) => {
        const itemDate = dayjs(item.rawDate);
        return (
          itemDate.isAfter(startDate) &&
          itemDate.isBefore(endDate.add(1, "day"))
        );
      });
    } else if (startDate) {
      results = results.filter((item) => {
        const itemDate = dayjs(item.rawDate);
        return itemDate.isAfter(startDate) || itemDate.isSame(startDate);
      });
    } else if (endDate) {
      results = results.filter((item) => {
        const itemDate = dayjs(item.rawDate);
        return itemDate.isBefore(endDate.add(1, "day"));
      });
    }

    // Apply category filter
    if (categoryFilter) {
      results = results.filter((item) => item.category === categoryFilter);
    }

    setFilteredData(results);
  }, [searchTerm, startDate, endDate, categoryFilter, data]);

  // Get unique categories for filter dropdown
  const uniqueCategories = Array.from(
    new Set(data.map((item) => item.category))
  )
    .filter((category) => category) // Remove empty categories
    .sort();

  const handleEdit = (reportId: number) => {
    if (onEditReport) {
      onEditReport(reportId);
    }
  };

  const handleDelete = (reportId: number) => {
    if (onDeleteReport) {
      onDeleteReport(reportId);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStartDate(null);
    setEndDate(null);
    setCategoryFilter("");
  };

  // ✅ Show error message if authentication is missing
  if (!user_account) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="h6" color="error">
          User not logged in
        </Typography>
      </Box>
    );
  }

  if (!companyId) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="h6" color="error">
          Company information not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Search and Filter Section */}
      <Box mb={3}>
        <Grid container spacing={2} alignItems="center">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              alignItems: "center",
              justifyContent: "center",
              borderBottom: "1px solid #e0e0e0",
              pb: 3,
            }}
          >
            <Button
              variant="outlined"
              href="https://thaicarbonlabel.tgo.or.th/index.php?lang=TH&mod=WldKdmIycz0&action=YkdsemRBPT0"
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<DownloadIcon />}
              sx={{
                width: 350,
                height: 80,
                borderRadius: 2,
                textTransform: "none",
                py: 1.5,
                borderColor: "#3085C1", // Default border color
                "&:hover": {
                  borderColor: "#2470A8", // Darker border on hover
                },
              }}
            >
              <Typography
                component="span" // Use span to ensure the text stays inline
                sx={{
                  fontWeight: "bold", // Make text bold
                  fontSize: "1.1rem",
                  lineHeight: "1.2",
                  background: "linear-gradient(to right, #3085C1, #4CAF50)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  whiteSpace: "pre-wrap", // Allows the <br /> to work
                  textAlign: "center",
                }}
              >
                คู่มือการรายงาน CBAM ของ อบก.
              </Typography>
            </Button>
            <Button
              variant="outlined"
              href="https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism/cbam-guidance-and-legislation_en"
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<DownloadIcon />}
              sx={{
                width: 350,
                height: 80,
                borderRadius: 2,
                textTransform: "none",
                py: 1.5,
                borderColor: "#3085C1", // Default border color
                "&:hover": {
                  borderColor: "#2470A8", // Darker border on hover
                },
              }}
            >
              <Typography
                component="span" // Use span to ensure the text stays inline
                sx={{
                  fontWeight: "bold", // Make text bold
                  fontSize: "1.1rem",
                  lineHeight: "1.2", // Adjust line height for multiline text
                  // Apply the gradient text effect
                  background: "linear-gradient(to right, #3085C1, #4CAF50)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  whiteSpace: "pre-wrap", // Allows the <br /> to work
                  textAlign: "center",
                }}
              >
                CBAM <br /> communication template for installations
              </Typography>
            </Button>
            <Button
              variant="outlined"
              href="https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism/cbam-guidance-and-legislation_en"
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<DownloadIcon />}
              sx={{
                width: 350,
                height: 80,
                borderRadius: 2,
                textTransform: "none",
                py: 1.5,
                borderColor: "#3085C1", // Default border color
                "&:hover": {
                  borderColor: "#2470A8", // Darker border on hover
                },
              }}
            >
              <Typography
                component="span" // Use span to ensure the text stays inline
                sx={{
                  fontWeight: "bold", // Make text bold
                  fontSize: "1.1rem",
                  lineHeight: "1.2", // Adjust line height for multiline text
                  // Apply the gradient text effect
                  background: "linear-gradient(to right, #3085C1, #4CAF50)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  whiteSpace: "pre-wrap", // Allows the <br /> to work
                  textAlign: "center",
                }}
              >
                คู่มือการใช้งานแพลตฟอร์ม <br /> (User Manual)
              </Typography>
            </Button>
          </Box>

          <Grid size={12}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm("")}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
                sx: { borderRadius: 2 },
              }}
            />
          </Grid>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div style={{ flex: 1 }}>
              <Button
                color="secondary"
                variant="outlined"
                fullWidth
                startIcon={<CalendarTodayIcon />}
                onClick={() => {
                  setStartDate(dayjs().subtract(30, "day"));
                  setEndDate(dayjs());
                  setShowFilters(true);
                }}
                sx={{
                  height: "100%",
                  borderRadius: 2,
                  textTransform: "none",
                }}
              >
                Last 30 Days
              </Button>
            </div>
            <div style={{ flex: 1 }}>
              <Button
                fullWidth
                startIcon={<TuneIcon />}
                onClick={() => setShowFilters(!showFilters)}
                variant={showFilters ? "contained" : "outlined"}
                color="primary"
                sx={{
                  height: "100%",
                  borderRadius: 2,
                  textTransform: "none",
                }}
              >
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
            </div>
          </div>
        </Grid>

        {/* Collapsible filters section */}
        <Collapse in={showFilters}>
          <Paper
            elevation={0}
            sx={{
              mt: 2,
              p: 3,
              borderRadius: 2,
              backgroundColor: "#f9f9f9",
              border: "1px solid #eaeaea",
            }}
          >
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Filter Reports
            </Typography>

            <Grid container spacing={2} alignItems="center">
              <Grid size={6.4}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="category-filter-label">Category</InputLabel>
                  <Select
                    labelId="category-filter-label"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="">
                      <em>All Categories</em>
                    </MenuItem>
                    {uniqueCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={(value) => setStartDate(value)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          InputProps: {
                            endAdornment: startDate && (
                              <InputAdornment position="end">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setStartDate(null);
                                  }}
                                >
                                  <ClearIcon fontSize="small" />
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </div>
                <div style={{ flex: 1 }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={(newValue: Dayjs | null) =>
                        setEndDate(newValue)
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          InputProps: {
                            endAdornment: endDate && (
                              <InputAdornment position="end">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEndDate(null);
                                  }}
                                >
                                  <ClearIcon fontSize="small" />
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </div>
              </div>

              <Grid size={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  onClick={handleClearFilters}
                  sx={{ height: "100%" }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>

            {/* Active filters display */}
            <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
              {searchTerm && (
                <Chip
                  label={`Search: ${searchTerm}`}
                  size="medium"
                  onDelete={() => setSearchTerm("")}
                />
              )}
              {categoryFilter && (
                <Chip
                  label={`Category: ${categoryFilter}`}
                  size="medium"
                  onDelete={() => setCategoryFilter("")}
                />
              )}
              {startDate && (
                <Chip
                  label={`From: ${startDate.format("DD/MM/YYYY")}`}
                  size="medium"
                  onDelete={() => setStartDate(null)}
                />
              )}
              {endDate && (
                <Chip
                  label={`To: ${endDate.format("DD/MM/YYYY")}`}
                  size="medium"
                  onDelete={() => setEndDate(null)}
                />
              )}
            </Stack>
          </Paper>
        </Collapse>
      </Box>

      {/* Results count */}
      <Box
        mb={2}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="subtitle1" fontWeight={600}>
          Report List
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {filteredData.length === data.length
            ? `Showing all ${data.length} reports`
            : `Showing ${filteredData.length} of ${data.length} reports`}
        </Typography>
      </Box>

      {/* No results message */}
      {filteredData.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 2,
            backgroundColor: "#f9f9f9",
          }}
        >
          <Typography variant="body1" color="text.secondary">
            {data.length === 0
              ? "No CBAM reports found"
              : "No reports match your search criteria"}
          </Typography>
          {data.length > 0 && (
            <Button
              variant="text"
              color="primary"
              onClick={handleClearFilters}
              sx={{ mt: 2 }}
            >
              Clear Filters
            </Button>
          )}
        </Paper>
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
                  <strong style={{ fontSize: "14px" }}>ลำดับ</strong>
                </TableCell>
                <TableCell>
                  <strong style={{ fontSize: "14px" }}>ชื่อผลิตภัณฑ์</strong>
                </TableCell>
                <TableCell>
                  <strong style={{ fontSize: "14px" }}>
                    หมวดหมู่ผลิตภัณฑ์
                  </strong>
                </TableCell>
                <TableCell>
                  <strong style={{ fontSize: "14px" }}>CN Code</strong>
                </TableCell>
                <TableCell>
                  <strong style={{ fontSize: "14px" }}>
                    Total SEE (tCO2e/t)
                  </strong>
                </TableCell>
                <TableCell
                  onClick={() => {
                    setSortDirection((prev) =>
                      prev === "asc" ? "desc" : "asc"
                    );
                  }}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  <strong style={{ fontSize: "14px" }}>
                    วันที่แก้ไขล่าสุด
                    {sortDirection === "asc" ? (
                      <span style={{ marginLeft: 6 }}>▲</span>
                    ) : (
                      <span style={{ marginLeft: 6 }}>▼</span>
                    )}
                  </strong>
                </TableCell>
                <TableCell align="center">
                  <strong style={{ fontSize: "14px" }}>รายงาน</strong>
                </TableCell>
                <TableCell align="center">
                  {/* <strong>แก้ไข</strong> */}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...filteredData]
                .sort((a, b) => {
                  const dateA = dayjs(a.rawDate);
                  const dateB = dayjs(b.rawDate);
                  return sortDirection === "desc"
                    ? dateA.diff(dateB)
                    : dateB.diff(dateA);
                })
                .map((row, idx) => (
                  <TableRow
                    key={`${row.id}-${idx}`}
                    sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
                  >
                    {/* New Index Column */}
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight="medium"
                        fontSize="14px"
                      >
                        {idx + 1} {/* Index starts from 1 */}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight="medium"
                        fontSize="14px"
                      >
                        {row.product}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {row.category && (
                        <Chip
                          label={row.category}
                          size="medium"
                          variant="outlined"
                          color="secondary"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontFamily="monospace"
                        fontSize="14px"
                      >
                        {row.cncode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontFamily="monospace"
                        fontSize="14px"
                      >
                        {typeof row.see === "number"
                          ? row.see.toFixed(4)
                          : row.see}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.date}
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 500, fontSize: "14px" }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="ดูรายงาน">
                        <IconButton
                          component={Link}
                          to={`/report?reportId=${row.id}`}
                          color="primary"
                          size="medium"
                        >
                          <DescriptionIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={0.5} justifyContent="center">
                        {/* Edit Button - only show if callback exists */}
                        {onEditReport && (
                          <Tooltip title="">
                            <IconButton
                              onClick={() => handleEdit(row.id)}
                              color="primary"
                              size="medium"
                              sx={{
                                "&:hover": {
                                  backgroundColor: "primary.light",
                                  color: "white",
                                  fontSize: "14px",
                                },
                              }}
                            >
                              <EditIcon fontSize="medium" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                      <Box>
                        {/* Delete Button - only show if callback exists */}
                        {onDeleteReport && (
                          <Tooltip title="">
                            <IconButton
                              onClick={() => handleDelete(row.id)}
                              color="error"
                              size="medium"
                              sx={{
                                "&:hover": {
                                  backgroundColor: "error.light",
                                  color: "white",
                                },
                              }}
                            >
                              <DeleteIcon fontSize="medium" />
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

      {/* Pagination and Results Summary */}
      {filteredData.length > 0 && (
        <Box
          mt={2}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="body2" color="text.secondary">
            รวม {filteredData.length} รายงาน{" "}
            {filteredData.length < data.length &&
              `(กรองจาก ${data.length} รายงาน)`}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default TableDashboard;
