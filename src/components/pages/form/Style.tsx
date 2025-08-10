// FormStyles.tsx
import { styled, Box, Paper } from "@mui/material";

// บริเวณ decorative pattern สำหรับส่วนหัวของฟอร์ม
export const HeaderPatternBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "-15px",
  right: "-15px",
  width: "120px",
  height: "120px",
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(7,184,221,0.1) 0%, rgba(1,144,195,0) 70%)",
  zIndex: 0,
}));

// header banner
export const HeaderBanner = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  background: "linear-gradient(to right, #f3f7e7, #e7f9cd)",
  borderLeft: "6px solid #74aa15",
  position: "relative",
  overflow: "hidden",
}));

// stepper container
export const StepperContainer = styled(Paper)<{ progress: number }>(({ theme, progress }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: "10%",
    right: "10%",
    height: "4px",
    background: `linear-gradient(to right, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} ${progress}%, ${theme.palette.grey[300]} ${progress}%, ${theme.palette.grey[300]} 100%)`,
    borderRadius: "2px",
    transition: "all 0.4s ease",
  },
}));

// decorative circle top right
export const TopRightCircle = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "20px",
  right: "20px",
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(231,249,205,0.5) 0%, rgba(243,247,231,0) 70%)",
  zIndex: 0,
}));

// decorative circle bottom left
export const BottomLeftCircle = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: "30px",
  left: "10px",
  width: "60px",
  height: "60px",
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(7,184,221,0.1) 0%, rgba(1,144,195,0) 70%)",
  zIndex: 0,
}));

// content paper with pattern
export const ContentPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  position: "relative",
  overflow: "hidden",
  minHeight: "450px",
  zIndex: 1,
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "6px",
    background: "linear-gradient(90deg, #0190c3, #07b8dd)",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: "radial-gradient(#f3f7e7 1px, transparent 1px)",
    backgroundSize: "20px 20px",
    opacity: 0.3,
    pointerEvents: "none",
    zIndex: 0,
  }
}));

// navigation button container
export const NavigationContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  display: "flex",
  justifyContent: "space-between",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: "-20px",
    left: "20%",
    right: "20%",
    height: "1px",
    background: "linear-gradient(90deg, transparent, #d5d5d5, transparent)",
  }
}));

interface ButtonDecorationProps {
  isLastStep: boolean;
}
// ✅ แก้ไขให้ filter prop ออกก่อนส่งไปยัง DOM
export const ButtonDecoration = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isLastStep', // ✅ เพิ่มบรรทัดนี้
})<ButtonDecorationProps>(({ theme, isLastStep }) => ({
  position: "absolute",
  width: "140%",
  height: "140%",
  top: "-20%",
  left: "-20%",
  pointerEvents: "none",
  opacity: 0.5,
  zIndex: -1,
  "&::before, &::after": {
    content: '""',
    position: "absolute",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: isLastStep ? "#74aa15" : "#0190c3",
    opacity: 0.3,
  },
  "&::before": { top: "10%", right: "5%" },
  "&::after": { bottom: "10%", left: "5%" },
}));

// progress indicator
export const ProgressBar = styled(Box)<{ progress: number; isLastStep: boolean }>(({ theme, progress, isLastStep }) => ({
  display: "inline-block",
  width: "50px",
  height: "4px",
  borderRadius: "2px",
  backgroundColor: "#d5d5d5",
  position: "relative",
  overflow: "hidden",
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: `${progress * 100}%`,
    backgroundColor: isLastStep ? "#74aa15" : "#0190c3",
    borderRadius: "2px",
    transition: "width 0.3s ease",
  }
}));