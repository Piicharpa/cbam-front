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
  Tooltip
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import DescriptionIcon from "@mui/icons-material/Description";
import EditIcon from "@mui/icons-material/Edit"; // Add this import for edit icon
import { Link } from "react-router-dom";
// import "dayjs/locale/th";
// dayjs.locale("th");

interface CBAMData {
  product: string;
  cncode: string;
  volume?: string;
  carbon?: string;
  date: string;
  ref: string;
  id: number;
}

// Add props interface for the component
interface TableDashboardProps {
  onEditReport?: (reportId: string | number) => void;
}

const TableDashboard: React.FC<TableDashboardProps> = ({ onEditReport }) => {
  const [data, setData] = useState<CBAMData[]>([]);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
         `${apiUrl}/api/cbam/report/company/1`
        );
        const raw = response.data;
        // ถ้า response เป็น array ให้ map ทุกตัว, ถ้าเป็น object เดียวให้ wrap เป็น array
        const items = Array.isArray(raw) ? raw : [raw];
        const mapped: CBAMData[] = items.map((item: any) => ({
          product: item.industry_type_name,
          category: item.goods_category_name?.trim(),
          cncode: item.cncode?.trim(),
          date: dayjs(item.reporting_period_start).format("D MMM YYYY"),
          ref: item.cn_code_name,
          id: item.id,
        }));
        setData(mapped);
      } catch (err) {
        console.error("Error fetching CBAM data:", err);
      }
    };
    fetchData();
  }, []);

  // Function to handle edit action
  const handleEdit = (reportId: number) => {
    if (onEditReport) {
      onEditReport(reportId);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
        เอกสาร <strong>CBAM</strong> ส่งไป <strong>EU</strong> ล่าสุด
      </Typography>
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f9f9f9" }}>
            <TableRow>
              <TableCell>
                <strong>ชื่อผลิตภัณฑ์</strong>
              </TableCell>
              <TableCell>
                <strong>CN code</strong>
              </TableCell>
              <TableCell>
                <strong>วันลงทะเบียน</strong>
              </TableCell>
              <TableCell>
                <strong>รายงาน</strong>
              </TableCell>
              <TableCell>
                <strong>แก้ไข</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.product}</TableCell>
                <TableCell>{row.cncode}</TableCell>
                <TableCell>
                  <Chip
                    label={row.date}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="ดูรายงาน">
                    <IconButton
                      component={Link}
                      to={`/report?reportId=${row.id}`}
                      color="primary"
                    >
                      <DescriptionIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title="แก้ไขรายงาน">
                    <IconButton
                      onClick={() => handleEdit(row.id)}
                      color="secondary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Move To Installation */}
      {/* <Box mt={4}>
        <SumupForm />
      </Box> */}
    </Box>
  );
};

export default TableDashboard;