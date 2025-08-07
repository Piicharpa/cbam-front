// SectionButton.tsx
import React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

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
  [theme.breakpoints.down('sm')]: {
    height: '40px',
    fontSize: '14px',
  },
}));

interface SectionButtonProps {
  onValidate: () => boolean;
  onSuccess: () => void;
  children?: React.ReactNode; // This allows passing in any additional content (e.g., icons)
}

const SectionButton: React.FC<SectionButtonProps> = ({
  onValidate,
  onSuccess,
  children,
}) => {
  const handleClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (onValidate()) {
      onSuccess();
    }
  };

  return (
    <PaleGreenButton type="button" onClick={handleClick} aria-label="Proceed to next step">
      {'Save'}
    </PaleGreenButton>
  );
};

export default SectionButton;