// components/LabeledTextField.tsx
import React from "react";
import { TextField, Typography } from "@mui/material";
interface Props {
  label: string;
  caption?: string;
  defination?: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  readOnly?: boolean;
  helperText?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>; 
  required?: boolean
  multiline?:boolean
  
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
  required = true,
  multiline = false,
 
}) => (
  <>
    {caption && (
      <Typography variant="caption" color="#0290c4" style={{ fontWeight: 600, fontSize: 13 }}>
        {caption}
      </Typography>
    )}
    {defination && (
      <Typography
        variant="caption"
        color="#74aa15"
        style={{ marginBottom: "0.25rem", display: "block" ,fontSize: 10 }}
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
      helperText={helperText}
      InputProps={{ readOnly }}
      inputProps={inputProps}  // pass it down here
    />
  </>
);

export default LabeledTextField;
