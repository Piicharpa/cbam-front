// components/LabeledAutocomplete.tsx
import React from "react";
import { Autocomplete, TextField, Typography } from "@mui/material";

interface Props {
  caption: string;
  defination?: string;
  label: string;
  name: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  error?: string | boolean;
  type?: string;
  helperText?: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

const LabeledAutocomplete: React.FC<Props> = ({
  label,
  caption,
  options,
  value,
  onChange,
  error,
  name,
  helperText,
  defination,
  disabled = false,
  readOnly = false,
  type = "text",
  required = false,
  inputProps,
}) => (
  <>
    {caption && (
      <Typography
        variant="caption"
        color="#0290c4"
        style={{ fontWeight: 600, fontSize: "18px" }}
      >
        {caption} {required && <span style={{ color: 'red' }}>*</span>}
      </Typography>
    )}
    {defination && (
      <Typography
        variant="caption"
        color="#74aa15"
        style={{ marginBottom: "0.25rem", display: "block", fontSize: "16px" }}
      >
        {defination}
      </Typography>
    )}
    <Autocomplete
      options={options}
      value={value}
      onChange={(_, newValue) => onChange(newValue || "")}
      renderInput={(params) => (
        <TextField
          {...params}
          type={type}
          label={label}
          name={name}
          margin="normal"
          error={!!error}
          helperText={error ? (typeof error === 'string' ? error : helperText || "กรุณากรอกข้อมูล") : helperText}
          disabled={disabled}
          required={required}
          InputProps={{
            ...params.InputProps,
            readOnly,
          }}
          inputProps={{
            ...params.inputProps,
            ...inputProps,
          }}
          FormHelperTextProps={{
            style: {
              color: error ? '#d32f2f' : 'inherit',
              marginTop: '3px',
              fontSize: '0.75rem',
            }
          }}
        />
      )}
      fullWidth
      freeSolo
      disabled={disabled}
      readOnly={readOnly}
    />
  </>
);

export default LabeledAutocomplete;