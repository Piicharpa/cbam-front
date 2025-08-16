// components/LabeledAutocompleteMap.tsx
import React from "react";
import { Autocomplete, TextField, Typography, Box } from "@mui/material";

interface Option {
  label: string;
  value: string;
}

interface Props {
  caption: string;
  defination?: string;
  label: string;
  name: string;
  options: Option[];
  value: string | number | (string | number)[]; // support single or multiple
  onChange: (val: string | number | (string | number)[]) => void;
  error?: string | boolean;
  type?: string;
  helperText?: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

const LabeledAutocompleteMap: React.FC<Props> = ({
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
  multiple = false,
  inputProps,
}) => {
  // This maps the current value (e.g. 'TH') back to the option object
  const selectedOption = options.find((opt) => opt.value === value) || null;

  return (
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
              minHeight: "53px",
            }}
          >
            {defination}
          </Typography>
        )}
        <Autocomplete
          options={options}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, val) =>
            val ? option.value === val.value : false
          }
          value={selectedOption}
          onChange={(_, newValue) => {
            if (multiple) {
              // newValue is Option[] | null
              onChange(
                Array.isArray(newValue) ? newValue.map((opt) => opt.value) : []
              );
            } else {
              // newValue is Option | null
              onChange((newValue as Option | null)?.value ?? "");
            }
          }}
          disabled={disabled}
          multiple={multiple}
          renderInput={(params) => (
            <TextField
              {...params}
              type={type}
              label={label}
              name={name}
              // margin="normal"
              fullWidth
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
                ...params.InputProps,
                readOnly,
              }}
              inputProps={{
                ...params.inputProps,
                ...inputProps,
              }}
              FormHelperTextProps={{
                style: {
                  color: error ? "#d32f2f" : "inherit",
                  marginTop: "3px",
                  fontSize: "0.75rem",
                },
              }}
            />
          )}
        />
      </Box>
    </>
  );
};

export default LabeledAutocompleteMap;
