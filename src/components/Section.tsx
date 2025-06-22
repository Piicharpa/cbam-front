// src/components/Section.tsx
import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
  Box,
  useTheme,
  alpha,
  Container
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface SectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  hasError?: boolean;
  icon?: React.ReactNode; // Optional icon to display next to title
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false; // Control the max width
}

const Section: React.FC<SectionProps> = ({
  title,
  subtitle,
  children,
  defaultExpanded = false,
  hasError = false,
  icon,
  maxWidth = 'lg' // Default to lg width, but can be overridden
}) => {
  const theme = useTheme();
  
  return (
    <Grid size={12}>
      <Box
        sx={{
          width: '100%', 
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: maxWidth ? theme.breakpoints.values[maxWidth] : '100%'
          }}
        >
          <Accordion
            defaultExpanded={defaultExpanded}
            sx={{
              width: '100%',
              boxShadow: hasError 
                ? `0 2px 8px ${alpha(theme.palette.error.main, 0.25)}`
                : `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
              borderRadius: '12px !important',
              mb: 2,
              overflow: 'hidden',
              border: hasError 
                ? `1px solid ${alpha(theme.palette.error.main, 0.5)}`
                : `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              '&:before': {
                display: 'none', // Remove the default divider
              },
              '&.Mui-expanded': {
                boxShadow: hasError 
                  ? `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`
                  : `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
              }
            }}
          >
            <AccordionSummary 
              expandIcon={
                <ExpandMoreIcon 
                  sx={{ 
                    color: hasError ? theme.palette.error.main : theme.palette.primary.main,
                    fontSize: '2rem'
                  }} 
                />
              }
              sx={{
                background: hasError 
                  ? alpha(theme.palette.error.light, 0.08)
                  : alpha(theme.palette.primary.light, 0.08),
                borderLeft: hasError 
                  ? `4px solid ${theme.palette.error.main}`
                  : `4px solid ${theme.palette.primary.main}`,
                '&.Mui-expanded': {
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {icon && (
                  <Box sx={{ 
                    color: hasError ? theme.palette.error.main : theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {icon}
                  </Box>
                )}
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      color: hasError ? theme.palette.error.main : theme.palette.primary.main,
                      fontSize: 20
                    }}
                  >
                    {title}
                  </Typography>
                  {subtitle && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mt: 0.5,
                        color: theme.palette.text.secondary,
                        fontSize: '0.875rem'
                      }}
                    >
                      {subtitle}
                    </Typography>
                  )}
                </Box>
              </Box>
            </AccordionSummary>
            
            <AccordionDetails sx={{ 
              p: 3,
              background: alpha(theme.palette.background.paper, 0.6)
            }}>
              {children}
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </Grid>
  );
};

export default Section;