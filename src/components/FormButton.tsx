import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';

interface PGButtonProps {
  disabled?: boolean;
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

const PGButton: React.FC<PGButtonProps> = ({ disabled = false }) => {
  return (
    <PaleGreenButton type="submit" startIcon={<SaveIcon />} disabled={disabled}>
      Save
    </PaleGreenButton>
  );
};

export default PGButton;
