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
        name: string;
        cell: string;
        value: string;
    };
    setFormValues: React.Dispatch<React.SetStateAction<any>>;
}

const TabB_EmissionInstallation = ({ formValues, setFormValues }: TabAProps) => {
    const InstDataTable = () => {
        interface TableRowData {
            id: string;
            name: string;
            cell: string;
        }
        const [tableData, setTableData] = useState<TableRowData[]>([]);
        const [inputValues, setInputValues] = useState<{ [cell: string]: string }>({});
        useEffect(() => {
            fetch("http://178.128.123.212:5000/api/cbam/excelreport/B_EmInst")
                .then((res) => res.json())
                .then((data) => setTableData(data))
                .catch((err) => console.error("Failed to fetch:", err));
        }, []);

        const handleCopy = (cell: string) => {
            const text = inputValues[cell] || "";
            navigator.clipboard.writeText(text);
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
                    การปล่อยมลพิษด้านพลังงาน
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
                                                value={inputValues[row.cell] || ""}
                                                onChange={handleInputChange}
                                            />
                                            <Tooltip title="Copy">
                                                <IconButton onClick={() => handleCopy(row.cell)} size="small" sx={{ ml: 1 }}>
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

        return <>{renderCommonFields("C. Emission of Energ (Sheet : C_Emissions&Energy)")}</>;
    };

    return <InstDataTable />;
};

export default TabB_EmissionInstallation;
