import React from 'react';
import { AppBar, Toolbar, Box, Typography, Button } from '@mui/material';

interface HeaderProps {
  companyName?: string;
  userStatus?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  companyName = "บริษัท เอบีซี จำกัด",
  userStatus = "ยืนยันแล้ว"
}) => {
  const handleLogout = () => {
  };

  return (
    <AppBar position="static" sx={{ 
      background: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      borderRadius: '8px',
      marginBottom: '24px'
    }}>
      <Toolbar sx={{ padding: '16px 24px', justifyContent: 'space-between' }}>
        {/* Logo Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* ใช้ logo image แทน TGO box */}
          <Box sx={{
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src="https://tgo-dist.pages.dev/icon.png" 
              alt="TGO Logo"
              style={{
                width: '48px',
                height: '48px',
                objectFit: 'contain'
              }}
            />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ 
              color: '#1a1a1a', 
              marginBottom: '4px', 
              fontWeight: '600',
              fontSize: '1.5rem'
            }}>
              CBAM Carbon Footprint Platform
            </Typography>
            <Typography sx={{ 
              color: '#666666', 
              fontSize: '0.875rem',
              fontWeight: '400'
            }}>
              องค์การบริหารจัดการก๊าซเรือนกระจก (องค์การมหาชน)
            </Typography>
          </Box>
        </Box>

        {/* User Info Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ 
              fontWeight: '600', 
              color: '#1a1a1a',
              fontSize: '0.875rem'
            }}>
              {companyName}
            </Typography>
            <Typography sx={{ 
              color: '#666666', 
              fontSize: '0.75rem'
            }}>
              สถานะ: {userStatus}
            </Typography>
          </Box>
          <Button 
            variant="outlined"
            onClick={handleLogout}
            sx={{
              borderColor: '#e0e0e0',
              color: '#666666',
              backgroundColor: 'white',
              padding: '8px 16px',
              fontSize: '0.875rem',
              fontWeight: '500',
              '&:hover': {
                backgroundColor: '#f5f5f5',
                borderColor: '#d0d0d0'
              }
            }}
          >
            ออกจากระบบ
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;