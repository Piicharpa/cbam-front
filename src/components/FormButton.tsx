import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';

import type { ButtonPropsColorOverrides } from '@mui/material/Button';
import type { OverridableStringUnion } from '@mui/types';

interface PGButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
  loading?: boolean; // Optional loading state
  text?: string; // Optional text prop
  color?: OverridableStringUnion<
    'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning',
    ButtonPropsColorOverrides
  >;
}

const PaleGreenButton = styled(Button)(({ theme }) => ({
  width: '150px',
  height: '50px',
  fontSize: '18px',
  backgroundColor: '#a5d6a7',
  color: '#fff',
  marginLeft: 'auto',
  borderRadius: '20px',
  '&:hover': {
    backgroundColor: '#81c784',
  },
  '&.Mui-disabled': {
    backgroundColor: '#c8e6c9',
    color: '#eeeeee',
  },
  [theme.breakpoints.down('sm')]: {
    height: '50px',
    fontSize: '10px',
  },
}));

const PGButton: React.FC<PGButtonProps> = ({ disabled = false, loading = false, text = "Save", color, ...props }) => {
  // Only pass color if it's a valid MUI Button color
  const allowedColors = ['inherit', 'primary', 'secondary', 'success', 'error', 'info', 'warning'];
  const buttonProps = {
    ...props,
    ...(allowedColors.includes(color as string) ? { color } : {}),
  };

  return (
    <PaleGreenButton
      type="submit"
      startIcon={loading ? undefined : <SaveIcon />}
      disabled={disabled || loading}
      {...buttonProps}
    >
      {loading ? 'Saving...' : text}
    </PaleGreenButton>
  );
};

export default PGButton;