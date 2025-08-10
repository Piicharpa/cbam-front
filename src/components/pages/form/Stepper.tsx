// StepperComponents.tsx
import React from "react";
import {
  StepConnector,
  stepConnectorClasses,
  styled,
  StepIconProps,
} from "@mui/material";
import FactoryIcon from "@mui/icons-material/Factory";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import CategoryIcon from "@mui/icons-material/Category";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import CalculateIcon from "@mui/icons-material/Calculate";
import WavesIcon from "@mui/icons-material/Waves";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionIcon from "@mui/icons-material/Description";

// Custom connector for stepper
export const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: `linear-gradient(95deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: `linear-gradient(95deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 4,
    border: 0,
    backgroundColor: theme.palette.grey[300],
    borderRadius: 2,
  },
}));

// Custom step icon
export const ColorlibStepIconRoot = styled("div")<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.grey[300],
  zIndex: 1,
  color: "#fff",
  width: 50,
  height: 50,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  transition: "all 0.3s ease",
  ...(ownerState.active && {
    backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
    boxShadow: "0 4px 10px 0 rgba(1, 144, 195, 0.35)",
    transform: "scale(1.1)",
  }),
  ...(ownerState.completed && {
    backgroundImage: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
  }),
}));

// Step icon component
export function ColorlibStepIcon(props: StepIconProps) {
  const { active, completed, className } = props;
  const icons: { [index: string]: React.ReactElement } = {
    1: <DescriptionIcon />,
    2: <FactoryIcon />,
    3: <VerifiedUserIcon />,
    4: <CategoryIcon />,
    5: <SyncAltIcon />,
    6: <CalculateIcon />,
    7: <WavesIcon />,
  };
  return (
    <ColorlibStepIconRoot
      ownerState={{ completed, active }}
      className={className}
    >
      {completed ? <CheckCircleIcon /> : icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  );
}

// Steps definition with descriptions
export const steps = [
  { label: "CN Code", description: "Get your report id" },
  { label: "Installation", description: "Add installation details" },
  { label: "Verifier", description: "Verification information" },
  { label: "Goods", description: "Product information" },
  { label: "Precursors", description: "Precursor materials" },
  { label: "Source", description: "Quantity details" },
  { label: "Emission & Energy", description: "Emission sources" },
];