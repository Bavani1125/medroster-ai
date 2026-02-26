// src/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: [
      'Inter',
      'system-ui',
      '-apple-system',
      'Segoe UI',
      'Roboto',
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: { fontWeight: 800 },
    h5: { fontWeight: 800 },
    h6: { fontWeight: 800 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  palette: {
    mode: 'light',
    primary: { main: '#2563eb' },
    secondary: { main: '#db2777' },
    background: {
      default: '#f6f8fc',
      paper: '#ffffff',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage:
            'linear-gradient(90deg, rgba(17,24,39,0.92), rgba(31,41,55,0.92))',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.10)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(15,23,42,0.06)',
          boxShadow: '0 10px 30px rgba(2,6,23,0.06)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(15,23,42,0.06)',
          boxShadow: '0 12px 32px rgba(2,6,23,0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 12, paddingInline: 14, paddingBlock: 10 },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
  },
});