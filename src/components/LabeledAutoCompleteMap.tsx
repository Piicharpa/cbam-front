import React from "react";
import { Autocomplete, TextField, Typography } from "@mui/material";

interface Option {
  label: string;
  value: string;
}

interface Props {
  label: string;
  caption?: string;
  options: Option[];
  value: string | number; // store actual 'value' (like 'TH')
  name: string;
  onChange: (val: string | number) => void;
  error?: string;
  type?: string;
  defination?: string;
  disabled?: boolean;
  readonly?: boolean;
  multiple?: boolean;
}

const LabeledAutocompleteMap: React.FC<Props> = ({
  label,
  caption,
  options,
  value,
  onChange,
  error,
  name,
  defination,
  type = "text",
  disabled = false,
  readonly = false,
  multiple = false,
}) => {
  // This maps the current value (e.g. 'TH') back to the option object
  const selectedOption = options.find((opt) => opt.value === value) || null;

  return (
    <>
      {caption && (
        <Typography variant="caption" color="#0290c4" style={{ fontWeight: 600 , fontSize: 13}}>
          {caption}
        </Typography>
      )}
      {defination && (
        <Typography
          variant="caption"
          color="#74aa15"
          style={{ marginBottom: "0.25rem", display: "block" , fontSize:11}}
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
          onChange(newValue?.value ?? "");
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            type={type}
            label={label}
            name={name}
            margin="normal"
            fullWidth
            error={!!error}
            helperText={error || " "}
            disabled={disabled}
            InputProps={{
              ...params.InputProps,
              readOnly: readonly,
            }}
          />
        )}
      />
    </>
  );
};

export default LabeledAutocompleteMap;
