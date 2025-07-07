// components/LabeledTextField.tsx
import React from "react";
import { TextField, Typography } from "@mui/material";

interface Props {
  caption: string;
  defination?: string;
  label: string;
  name: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string | boolean;
  type?: string;
  helperText?: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean; // ✅ เพิ่ม disabled prop
  multiline?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

const LabeledTextField: React.FC<Props> = ({
  label,
  caption,
  helperText,
  defination,
  name,
  value,
  onChange,
  error,
  type = "text",
  readOnly = false,
  disabled = false, // ✅ เพิ่ม default value
  inputProps,
  required = false,
  multiline = false,
}) => (
  <>
    {caption && (
      <Typography
        variant="caption"
        color={disabled ? "#999" : "#0290c4"} // ✅ เปลี่ยนสีเมื่อ disabled
        style={{ 
          fontWeight: 600, 
          fontSize: "18px",
          opacity: disabled ? 0.6 : 1 // ✅ ลดความเข้มเมื่อ disabled
        }}
      >
        {caption} {required && <span style={{ color: disabled ? '#999' : 'red' }}>*</span>}
      </Typography>
    )}
    {defination && (
      <Typography
        variant="caption"
        color={disabled ? "#999" : "#74aa15"} // ✅ เปลี่ยนสีเมื่อ disabled
        style={{ 
          marginBottom: "0.25rem", 
          display: "block", 
          fontSize: "16px",
          opacity: disabled ? 0.6 : 1 // ✅ ลดความเข้มเมื่อ disabled
        }}
      >
        {defination}
      </Typography>
    )}
    <TextField
      label={label}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      fullWidth
      margin="normal"
      error={!!error}
      helperText={error ? (typeof error === 'string' ? error : helperText || "กรุณากรอกข้อมูล") : helperText}
      required={required}
      disabled={disabled} // ✅ ส่ง disabled prop ไปยัง TextField
      InputProps={{ readOnly }}
      inputProps={inputProps}
      multiline={multiline}
      rows={multiline ? 4 : undefined}
      FormHelperTextProps={{
        style: {
          color: error ? '#d32f2f' : 'inherit',
          marginTop: '3px',
          fontSize: '0.75rem',
        }
      }}
    />
  </>
);

export default LabeledTextField;