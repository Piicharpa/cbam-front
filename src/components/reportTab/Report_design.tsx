import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  TextField,
  IconButton,
  Box,
  Tooltip,
  Chip,
  Divider,
  Alert,
  Skeleton,
  Collapse,
  Grid,
} from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BusinessIcon from "@mui/icons-material/Business";
import DescriptionIcon from "@mui/icons-material/Description";

interface MetadataItem {
  id: string;
  table_db: string;
  variable: string;
  name: string;
  cell: string;
  sheet: string;
  title: string;
  subtitle: string;
  value: string;
}

interface DataDisplayTabProps {
  reportId: string | null;
  formValues?: any;
  setFormValues?: React.Dispatch<React.SetStateAction<any>>;
  config: {
    title: string;
    subtitle: string;
    sheetName: string;
    apiEndpoint: string;
    emptyMessage: string;
  };
  children?: React.ReactNode;
  onDataFetched?: (data: any) => void;
}

const DataDisplayTab: React.FC<DataDisplayTabProps> = ({
  reportId,
  config,
  children, 
  onDataFetched
}) => {
  const [metadataGrouped, setMetadataGrouped] = useState<
    Record<string, MetadataItem[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [copiedCell, setCopiedCell] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!reportId) return;

    const fetchData = async () => {
     const user_account = localStorage.getItem("user_account");
const token = user_account ? JSON.parse(user_account).token : null;
  const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ต้องอยู่ใน headers
      };
      setLoading(true);
      try {
        let apiEndpoint;

        if (config.apiEndpoint === "Summary") {
          const baseUrl = process.env.REACT_APP_API_URL;
          apiEndpoint = `${baseUrl}/api/cbam/report/sumary/${reportId}`;
        } else {
          const apiUrl = process.env.REACT_APP_API_URL || "";
          apiEndpoint = `${apiUrl}/api/cbam/excelreport/${config.apiEndpoint}/${reportId}`;
        }

        const response = await fetch(apiEndpoint,{headers:{
          'Content-Type' :"application/json",
          Authorization:`Bearer ${token}`
        }});

        if (!response.ok) {
          throw new Error(
            `Failed to fetch data with status: ${response.status}`
          );
        }

        const data = await response.json();
        if (config.apiEndpoint === "Summary") {
          if (typeof onDataFetched === "function") {
            onDataFetched(data);
          }
        } else {
          setMetadataGrouped(data.metadataGrouped || {});
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reportId, config.apiEndpoint, apiUrl]);

  const handleCopy = (value: string, cell: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(value || "")
        .then(() => {
          setCopiedCell(cell);
          setTimeout(() => setCopiedCell(null), 2000);
        })
        .catch((err) => {
          console.error("Secure copy failed, falling back", err);
          fallbackCopy(value, cell);
        });
    } else {
      fallbackCopy(value, cell);
    }
  };

  const fallbackCopy = (value: string, cell: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = value || "";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      setCopiedCell(cell);
      setTimeout(() => setCopiedCell(null), 2000);
    } catch (err) {
      console.error("Fallback: Unable to copy", err);
    }
    document.body.removeChild(textArea);
  };

  // แสดง children ที่ได้รับผ่าน props ก่อน
  if (children) {
    return (
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <DescriptionIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h4" fontWeight="bold" color="primary">
              {config.title}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <BusinessIcon />
            <Typography variant="h6" color="text.secondary">
              {config.subtitle}
            </Typography>
          </Box>
          <Chip
            label={`Sheet: ${config.sheetName}`}
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2 }}
          />
        </Box>

        {/* Custom Content from Children */}
        <Box sx={{ mb: 4, p: 3, border: "1px solid #e0e0e0", borderRadius: 2 }}>
          {children}
        </Box>

        {/* Loading State for Regular Content */}
        {loading ? (
          <Box sx={{ p: 3 }}>
            <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="30%" height={30} sx={{ mb: 3 }} />
            {[1, 2].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={100}
                sx={{ mb: 2 }}
              />
            ))}
          </Box>
        ) : Object.keys(metadataGrouped).length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            {config.emptyMessage}
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {Object.entries(metadataGrouped).map(([title, items]) => (
              <Grid size={12} key={title}>
                {/* Rest of the DataDisplayTab rendering code... */}
                <Card
                  elevation={0}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 3,
                  }}
                >
                  {/* Card Content... */}
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  }

  // Loading state for standard content
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="30%" height={30} sx={{ mb: 3 }} />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={200} sx={{ mb: 2 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <DescriptionIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight="bold" color="primary">
            {config.title}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <BusinessIcon />
          <Typography variant="h6" color="text.secondary">
            {config.subtitle}
          </Typography>
        </Box>
        <Chip
          label={`Sheet: ${config.sheetName}`}
          variant="outlined"
          size="small"
          sx={{ borderRadius: 2 }}
        />
      </Box>

      {/* Content */}
      {Object.keys(metadataGrouped).length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          {config.emptyMessage}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {Object.entries(metadataGrouped).map(([title, items]) => (
            <Grid size={12} key={title}>
              <Card
                elevation={0}
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 3,
                  height: "100%",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    boxShadow: 4,
                    borderColor: "primary.main",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Section Header - Make it clickable */}
                  <Box
                    sx={{
                      mb: 3,
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "grey.50" },
                      p: 1,
                      borderRadius: 1,
                      transition: "background-color 0.2s",
                    }}
                    onClick={() => {
                      // Toggle expanded state for this section
                      setExpandedSections((prev) => ({
                        ...prev,
                        [title]: !prev[title],
                      }));
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h5"
                          fontWeight="bold"
                          color="primary"
                          gutterBottom
                        >
                          {title}
                        </Typography>
                        {items[0]?.subtitle && (
                          <Typography variant="body1" color="text.secondary">
                            {items[0].subtitle}
                          </Typography>
                        )}
                      </Box>
                      <IconButton size="medium">
                        {expandedSections[title] ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </IconButton>
                    </Box>
                    <Divider sx={{ mt: 2 }} />
                  </Box>
                  <Collapse in={expandedSections[title]}>
                    {/* Table Header */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        fontWeight: "bold",
                        px: 1,
                        pb: 1,
                        borderBottom: 1,
                        borderColor: "divider",
                        color: "text.secondary",
                        fontSize: "0.875rem",
                      }}
                    >
                      <Box sx={{ minWidth: 10 }} />
                      <Box sx={{ minWidth: 130 }}># </Box>
                      <Box sx={{ minWidth: 130, maxWidth: 180, flexShrink: 0 }}>
                        Field Name
                      </Box>
                      <Box sx={{ minWidth: 180 }}>Excel Cell</Box>
                      <Box sx={{ flexGrow: 1 }}>Value</Box>
                    </Box>
                    {/* Data Fields */}
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      {items.map((row, index) => (
                        <Card
                          key={row.id}
                          variant="outlined"
                          sx={{
                            borderRadius: 2,
                            backgroundColor: "grey.50",
                            border: 1,
                            borderColor: "divider",
                            transition: "all 0.2s ease-in-out",
                            "&:hover": {
                              backgroundColor: "background.paper",
                              borderColor: "primary.light",
                            },
                          }}
                        >
                          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                            {/* Single line layout */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              {/* Left side - Field info */}
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  minWidth: 100,
                                }}
                              >
                                <Chip
                                  label={`#${index + 1}`}
                                  size="small"
                                  variant="filled"
                                  sx={{
                                    minWidth: 35,
                                    height: 24,
                                    backgroundColor: "primary.main",
                                    color: "white",
                                    fontWeight: "bold",
                                  }}
                                />
                              </Box>
                              {/* Middle - Field name */}
                              <Box
                                sx={{
                                  minWidth: 180,
                                  maxWidth: 180,
                                  flexShrink: 0,
                                }}
                              >
                                <Typography
                                  variant="subtitle2"
                                  fontWeight="normal"
                                  sx={{
                                    lineHeight: 1.2,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    fontSize: "14px",
                                  }}
                                >
                                  {row.name}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  minWidth: 50,
                                }}
                              >
                                <Chip
                                  label={row.cell}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 1,
                                    fontFamily: "monospace",
                                    fontWeight: "bold",
                                  }}
                                />
                              </Box>
                              {/* Right side - Value and actions */}
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  flexGrow: 1,
                                }}
                              >
                                <TextField
                                  fullWidth
                                  size="small"
                                  value={row.value || ""}
                                  placeholder="No value"
                                  InputProps={{
                                    readOnly: true,
                                    sx: {
                                      borderRadius: 2,
                                      backgroundColor: "background.paper",
                                      fontFamily: row.value
                                        ? "inherit"
                                        : "monospace",
                                    },
                                  }}
                                  variant="outlined"
                                />
                                <Tooltip
                                  title={
                                    copiedCell === row.cell
                                      ? "Copied!"
                                      : "Copy value"
                                  }
                                  arrow
                                >
                                  <IconButton
                                    onClick={() =>
                                      handleCopy(row.value, row.cell)
                                    }
                                    size="small"
                                    sx={{
                                      borderRadius: 2,
                                      border: 1,
                                      borderColor: "divider",
                                      backgroundColor: "background.paper",
                                      "&:hover": {
                                        backgroundColor: "primary.light",
                                        borderColor: "primary.main",
                                        color: "primary.main",
                                      },
                                    }}
                                  >
                                    {copiedCell === row.cell ? (
                                      <CheckCircleIcon
                                        fontSize="small"
                                        sx={{ color: "success.main" }}
                                      />
                                    ) : (
                                      <ContentCopyIcon fontSize="small" />
                                    )}
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                    {/* Section Summary */}
                    <Box
                      sx={{
                        mt: 3,
                        pt: 2,
                        borderTop: 1,
                        borderColor: "divider",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Total Fields: {items.length}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Chip
                            label={`${
                              items.filter((item) => item.value).length
                            } Filled`}
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ height: 20, fontSize: "0.7rem" }}
                          />
                          <Chip
                            label={`${
                              items.filter((item) => !item.value).length
                            } Empty`}
                            size="small"
                            color="default"
                            variant="outlined"
                            sx={{ height: 20, fontSize: "0.7rem" }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default DataDisplayTab;
