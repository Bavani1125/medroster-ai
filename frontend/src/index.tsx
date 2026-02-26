import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2563eb' },      // modern blue
    secondary: { main: '#db2777' },    // accent pink
    background: { default: '#f6f7fb', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: '#475569' },
    success: { main: '#16a34a' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    divider: 'rgba(15,23,42,0.08)',
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
    h4: { fontWeight: 800, letterSpacing: '-0.02em' },
    h5: { fontWeight: 800, letterSpacing: '-0.02em' },
    h6: { fontWeight: 800, letterSpacing: '-0.01em' },
    button: { textTransform: 'none', fontWeight: 800 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(15,23,42,0.08)',
          boxShadow: '0 8px 30px rgba(2,6,23,0.06)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(15,23,42,0.08)',
          boxShadow: '0 8px 30px rgba(2,6,23,0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 12 },
        containedPrimary: {
          boxShadow: '0 10px 18px rgba(37,99,235,0.18)',
        },
        containedSecondary: {
          boxShadow: '0 10px 18px rgba(219,39,119,0.18)',
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'medium' },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);