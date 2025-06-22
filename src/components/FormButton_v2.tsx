import React from "react";
import Button, { ButtonProps } from "@mui/material/Button";

interface PGButtonProps extends ButtonProps {
  children: React.ReactNode;
}

const PGButton: React.FC<PGButtonProps> = ({ children, ...rest }) => {
  return (
    <Button variant="contained" color="primary" {...rest}>
      {children}
    </Button>
  );
};

export default PGButton;
