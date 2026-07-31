import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0F7A5C', contrastText: '#fff' },
    secondary: { main: '#C97A1A', contrastText: '#fff' },
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    background: { default: '#F6F4EF', paper: '#FBFAF6' },
    text: { primary: '#16201C', secondary: '#6B6A62' },
    divider: '#DDD8C9',
  },
  typography: {
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    h1: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '-0.01em' },
    h5: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 2 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 2, paddingInline: 18, paddingBlock: 10, boxShadow: 'none' },
        containedPrimary: {
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          boxShadow: 'none',
          border: '1px solid #DDD8C9',
        },
      },
    },
    MuiPaper: { styleOverrides: { rounded: { borderRadius: 2 } } },
    MuiTextField: { defaultProps: { variant: 'outlined', fullWidth: true } },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#FBFAF6',
          boxShadow: 'none',
          borderBottom: '1px solid #DDD8C9',
          color: '#16201C',
        },
      },
    },
  },
});

export default theme;
