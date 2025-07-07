import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  TextField,
  IconButton,
  Box,
  Tooltip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Section from "../../components/Section"; // สมมติคุณมี Section component

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

interface TabAProps {
  reportId: string | null;
  formValues: any;
  setFormValues: React.Dispatch<React.SetStateAction<any>>;
}

const TabE_PurchasedPrecursors = ({ formValues, setFormValues, reportId }: TabAProps) => {
  const [metadataGrouped, setMetadataGrouped] = useState<Record<string, MetadataItem[]>>({});
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!reportId) return;
    fetch(`${apiUrl}/api/cbam/excelreport/E_PurchPrec/${reportId}`)
      .then(res => res.json())
      .then(data => {
        setMetadataGrouped(data.metadataGrouped); // <== ต้องให้ backend ส่ง metadataGrouped
      })
      .catch(err => console.error("Fetch error:", err));
  }, [reportId]);

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value || "");
  };

  return (
    <>
      <Typography variant="h6" gutterBottom color="primary">
        E. Purchased Precursors (Sheet: E_PurchPrec)
      </Typography>
      <Typography variant="h6" gutterBottom color="success">
        การสั่งซื้อวัตถุดิบ
      </Typography>
      <Grid container spacing={4} sx={{ mt: 2 }}>
        {Object.entries(metadataGrouped).map(([title, items]) => (
          <Grid >
            <Section
              title={title}
              defaultExpanded
              subtitle={items[0]?.subtitle}
            >
              <Paper elevation={2} sx={{ p: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Field Name</TableCell>
                      <TableCell>Excel Cell</TableCell>
                      <TableCell>Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.cell}</TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <TextField
                              fullWidth
                              size="small"
                              value={row.value || ""}
                              InputProps={{ readOnly: true }}
                            />
                            <Tooltip title="Copy">
                              <IconButton
                                onClick={() => handleCopy(row.value)}
                                size="small"
                                sx={{ ml: 1 }}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

              </Paper>
            </Section>
          </Grid>
        ))
        }
      </Grid >
    </>
  );
};

export default TabE_PurchasedPrecursors;
