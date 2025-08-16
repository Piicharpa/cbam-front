// components/LabeledTextField.tsx
import React from "react";
import { TextField, Typography, Box, InputAdornment } from "@mui/material";

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
  disabled?: boolean;
  multiline?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  unit?: string; // New prop for unit
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
  disabled = false,
  inputProps,
  required = false,
  multiline = false,
  unit, // Destructure the new unit prop
}) => (
  <>
    <Box mb={5}>
      {caption && (
        <Typography
          variant="caption"
          color={disabled ? "#999" : "#0290c4"}
          style={{
            fontWeight: 600,
            fontSize: "18px",
            opacity: disabled ? 0.6 : 1,
          }}
        >
          {caption}{" "}
          {required && (
            <span style={{ color: disabled ? "#999" : "red" }}>*</span>
          )}
        </Typography>
      )}
      {defination && (
        <Typography
          variant="caption"
          color={disabled ? "#999" : "#74aa15"}
          style={{
            // marginBottom: "0.25rem",
            display: "block",
            fontSize: "16px",
            opacity: disabled ? 0.6 : 1,
            minHeight: "53px",
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
        // margin="normal"
        error={!!error}
        helperText={
          error
            ? typeof error === "string"
              ? error
              : helperText || "กรุณากรอกข้อมูล"
            : helperText
        }
        required={required}
        disabled={disabled}
        InputProps={{
          readOnly,
          endAdornment: unit ? (
            <InputAdornment position="end">
              <Typography variant="body2" style={{ fontSize: "1.2rem" }}>
                {" "}
                {unit}
              </Typography>
            </InputAdornment>
          ) : null,
        }}
        inputProps={inputProps}
        multiline={multiline}
        rows={multiline ? 4 : undefined}
        FormHelperTextProps={{
          style: {
            color: error ? "#d32f2f" : "inherit",
            // marginTop: "3px",
            fontSize: "0.75rem",
          },
        }}
      />
    </Box>
  </>
);

export default LabeledTextField;
