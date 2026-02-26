import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  Stack,
  IconButton,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CampaignIcon from '@mui/icons-material/Campaign';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppBar
      position="sticky"
      sx={{
        background: 'linear-gradient(90deg, #0f172a 0%, #111827 55%, #0f172a 100%)',
      }}
    >
      <Toolbar sx={{ minHeight: 68 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: 1 }}>
          <IconButton
            onClick={() => navigate('/')}
            sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 2 }}
          >
            <LocalHospitalIcon />
          </IconButton>

          <Box sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Typography variant="h6" sx={{ color: 'white', lineHeight: 1.1 }}>
              MedRoster
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.70)' }}>
              Workforce + Voice Ops
            </Typography>
          </Box>
        </Stack>

        {/* right actions */}
        {isAuthenticated && (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              onClick={() => navigate('/dashboard')}
              variant={isActive('/dashboard') ? 'contained' : 'text'}
              startIcon={<DashboardIcon />}
              sx={{
                color: 'white',
                bgcolor: isActive('/dashboard') ? 'rgba(255,255,255,0.14)' : 'transparent',
              }}
            >
              Dashboard
            </Button>

            <Button
              onClick={() => navigate('/public/updates')}
              variant={isActive('/public/updates') ? 'contained' : 'text'}
              startIcon={<CampaignIcon />}
              sx={{
                color: 'white',
                bgcolor: isActive('/public/updates') ? 'rgba(255,255,255,0.14)' : 'transparent',
              }}
            >
              Public Updates
            </Button>

            <Chip
              label={(user?.role || 'staff').toUpperCase()}
              sx={{
                bgcolor: 'rgba(255,255,255,0.10)',
                color: 'white',
                fontWeight: 800,
              }}
            />

            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
              {user?.name}
            </Typography>

            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 3,
                px: 1.5,
              }}
            >
              Logout
            </Button>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
};