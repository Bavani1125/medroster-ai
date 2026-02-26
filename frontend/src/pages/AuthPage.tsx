import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Chip,
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, isLoading } = useAuth();
  const [tab, setTab] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(loginData.email.trim(), loginData.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Login failed. Please try again.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register({
        name: registerData.name.trim(),
        email: registerData.email.trim(),
        password: registerData.password,
        role: registerData.role,
      });
      setTab(0);
      setLoginData({ email: registerData.email, password: registerData.password });
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Registration failed. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'radial-gradient(1200px 500px at 50% 0%, rgba(37,99,235,0.18), transparent 60%), linear-gradient(180deg, #0b1220 0%, #0f172a 35%, #f6f7fb 35%, #f6f7fb 100%)',
        py: 6,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            overflow: 'hidden',
            borderRadius: 4,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
            {/* Left brand panel */}
            <Box
              sx={{
                flex: 1,
                p: 4,
                color: 'white',
                background:
                  'linear-gradient(135deg, rgba(37,99,235,0.95) 0%, rgba(15,23,42,0.95) 55%, rgba(219,39,119,0.90) 100%)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <LocalHospitalIcon />
                <Typography variant="h5">MedRoster</Typography>
              </Box>

              <Typography sx={{ opacity: 0.9, mb: 2 }}>
                AI-powered staffing + voice operations for hospitals.
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label="Scheduling" sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: 'white' }} />
                <Chip label="Emergency Broadcast" sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: 'white' }} />
                <Chip label="Public Voice Updates" sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: 'white' }} />
              </Box>

              <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.20)' }} />

              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Demo note: avoid PHI in voice or AI prompts.
              </Typography>
            </Box>

            {/* Right form panel */}
            <Box sx={{ flex: 1.1, p: 4 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Sign in / Create account
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Use your hospital role to access the correct tools.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1 }}>
                <Tab label="Login" />
                <Tab label="Register" />
              </Tabs>

              <TabPanel value={tab} index={0}>
                <form onSubmit={handleLoginSubmit}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    margin="normal"
                    value={loginData.email}
                    autoComplete="email"
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    margin="normal"
                    value={loginData.password}
                    autoComplete="current-password"
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{ mt: 2.5, py: 1.2 }}
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? <CircularProgress size={22} /> : 'Login'}
                  </Button>
                </form>
              </TabPanel>

              <TabPanel value={tab} index={1}>
                <form onSubmit={handleRegisterSubmit}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    margin="normal"
                    value={registerData.name}
                    autoComplete="name"
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    margin="normal"
                    value={registerData.email}
                    autoComplete="email"
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    margin="normal"
                    value={registerData.password}
                    autoComplete="new-password"
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                  />
                  <TextField
                    fullWidth
                    select
                    label="Role"
                    margin="normal"
                    value={registerData.role}
                    onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                    SelectProps={{ native: true }}
                  >
                    <option value="staff">Staff</option>
                    <option value="nurse">Nurse</option>
                    <option value="doctor">Doctor</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </TextField>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{ mt: 2.5, py: 1.2 }}
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? <CircularProgress size={22} /> : 'Create Account'}
                  </Button>
                </form>
              </TabPanel>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};