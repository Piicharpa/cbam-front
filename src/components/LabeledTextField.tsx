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
  inputProps,
  required = false,
  multiline = false,
}) => (
  <>
    {caption && (
      <Typography
        variant="caption"
        color="#0290c4"
        style={{ fontWeight: 600, fontSize: 13 }}
      >
        {caption} {required && <span style={{ color: 'red' }}>*</span>}
      </Typography>
    )}
    {defination && (
      <Typography
        variant="caption"
        color="#74aa15"
        style={{ marginBottom: "0.25rem", display: "block", fontSize: 10 }}
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