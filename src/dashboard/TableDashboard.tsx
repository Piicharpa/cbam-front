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
  Fade,
  Collapse,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import DescriptionIcon from "@mui/icons-material/Description";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ClearIcon from "@mui/icons-material/Clear";
import TuneIcon from "@mui/icons-material/Tune";
import { Link } from "react-router-dom";

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
}

interface TableDashboardProps {
  onEditReport?: ((reportId: string | number) => void) | undefined;
  onDeleteReport?: ((reportId: string | number) => void) | undefined;
}

const TableDashboard: React.FC<TableDashboardProps> = ({
  onEditReport,
  onDeleteReport,
}) => {
  const [data, setData] = useState<CBAMData[]>([]);
  const [filteredData, setFilteredData] = useState<CBAMData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

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

        const mapped: CBAMData[] = items.map((item: any) => {
          const rawDate =
            item.reporting_period_start || new Date().toISOString();
          return {
            product: item.industry_type_name || "Unknown Product",
            category: item.goods_category_name?.trim() || "",
            cncode: item.cncode?.trim() || item.cn_code || "N/A",
            date: dayjs(rawDate).format("D MMM YYYY"),
            rawDate: rawDate, // Store raw date for filtering
            ref: item.cn_code_name || item.name || `Report ${item.id}`,
            id: item.id,
          };
        });

        console.log("✅ Mapped CBAM data:", mapped);
        setData(mapped);
        setFilteredData(mapped);
      } catch (err) {
        console.error("❌ Error fetching CBAM data:", err);
        setData([]);
        setFilteredData([]);
      }
    };

    fetchData();
  }, [apiUrl]);

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
    console.log("✏️ Edit report clicked for ID:", reportId);
    if (onEditReport) {
      onEditReport(reportId);
    }
  };

  const handleDelete = (reportId: number) => {
    console.log("🗑️ Delete report clicked for ID:", reportId);
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

  return (
    <Box>
      {/* Search and Filter Section */}
      <Box mb={3}>
        <Grid container spacing={2} alignItems="center">
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
                      onChange={(newValue: Dayjs | null) =>
                        setStartDate(newValue)
                      }
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
                  size="small"
                  onDelete={() => setSearchTerm("")}
                />
              )}
              {categoryFilter && (
                <Chip
                  label={`Category: ${categoryFilter}`}
                  size="small"
                  onDelete={() => setCategoryFilter("")}
                />
              )}
              {startDate && (
                <Chip
                  label={`From: ${startDate.format("DD/MM/YYYY")}`}
                  size="small"
                  onDelete={() => setStartDate(null)}
                />
              )}
              {endDate && (
                <Chip
                  label={`To: ${endDate.format("DD/MM/YYYY")}`}
                  size="small"
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
                  <strong>ชื่อผลิตภัณฑ์</strong>
                </TableCell>
                <TableCell>
                  <strong>หมวดหมู่สินค้า</strong>
                </TableCell>
                <TableCell>
                  <strong>CN Code</strong>
                </TableCell>
                <TableCell
                  onClick={() => {
                    setSortDirection((prev) =>
                      prev === "asc" ? "desc" : "asc"
                    );
                  }}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  <strong>
                    วันลงทะเบียน
                    {sortDirection === "asc" ? (
                      <span style={{ marginLeft: 6 }}>▲</span>
                    ) : (
                      <span style={{ marginLeft: 6 }}>▼</span>
                    )}
                  </strong>
                </TableCell>
                <TableCell align="center">
                  <strong>รายงาน</strong>
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
                  return sortDirection === "asc"
                    ? dateA.diff(dateB)
                    : dateB.diff(dateA);
                })
                .map((row, idx) => (
                  <TableRow
                    key={`${row.id}-${idx}`}
                    sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {row.product}
                      </Typography>
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
                          <Tooltip title="">
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
                      {/* </TableCell> */}
                      {/* <TableCell align="center"> */}
                      <Box>
                        {/* Delete Button - only show if callback exists */}
                        {onDeleteReport && (
                          <Tooltip title="">
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
