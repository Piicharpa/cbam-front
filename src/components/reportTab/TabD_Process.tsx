import React, { useState, useEffect } from "react";
import { Typography, Grid } from "@mui/material";
import LabeledTextField from "../../components/LabeledTextField";
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
    TableHead,
    TableContainer,
    Paper,
    TextField,
    IconButton,
    Box,
    Tooltip,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

interface TabAProps {
    formValues: {
        id: string;
        table_db: string;
        variable: string;
        name: string;
        cell: string;
        sheet: string;
        title: string;
        subtitle: string;
        value: string;
    };
    setFormValues: React.Dispatch<React.SetStateAction<any>>;
    reportId: string | null;
}

const TabD_Process = ({ formValues, setFormValues, reportId }: TabAProps) => {
    useEffect(() => {
        if (reportId) {
            // เรียก API หรือโหลดข้อมูลตาม reportId
        }
    }, [reportId]);
    const InstDataTable = () => {
        interface TableRowData {
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
        const [tableData, setTableData] = useState<TableRowData[]>([]);
        const [inputValues, setInputValues] = useState<{ [cell: string]: string }>({});

         const apiUrl = process.env.REACT_APP_API_URL;

        useEffect(() => {
            if (reportId) {
                fetch(`${apiUrl}/api/cbam/excelreport/D_Processes/${reportId}`)
                    .then((res) => res.json())
                    .then((data) => setTableData(data.metadata))
                    .catch((err) => console.error("Failed to fetch:", err));
            }
        }, []);

        const handleCopy = (value: string) => {
            navigator.clipboard.writeText(value || "").then(() => {
            });
        };



        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
            setFormValues((prev: any) => ({ ...prev, [name]: value }));
        };



        const renderCommonFields = (title: string) => (
            <>
                <Typography variant="h6" gutterBottom color="primary">
                    {title}
                </Typography>
                <Typography variant="h6" gutterBottom color="success">
                    กระบวนการ
                </Typography>

                <TableContainer component={Paper}>
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
                            {tableData.map((row, index) => (
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
                                                InputProps={{
                                                    readOnly: true,
                                                }}
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
                </TableContainer>
            </>
        );

        return <>{renderCommonFields("D. Process (Sheet: D_Processes)")}</>;
    };

    return <InstDataTable />;
};

export default TabD_Process;
