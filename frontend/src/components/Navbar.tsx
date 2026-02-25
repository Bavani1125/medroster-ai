// /Users/sunilganta/Documents/medroster-frontend/src/components/Navbar.tsx

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CampaignIcon from '@mui/icons-material/Campaign';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

const roleColor = (role?: string) => {
  switch ((role || '').toLowerCase()) {
    case 'admin':
      return { bg: '#111827', fg: '#ffffff' };
    case 'manager':
      return { bg: '#1f2937', fg: '#ffffff' };
    case 'doctor':
      return { bg: '#0ea5e9', fg: '#082f49' };
    case 'nurse':
      return { bg: '#22c55e', fg: '#052e16' };
    default:
      return { bg: '#e5e7eb', fg: '#111827' };
  }
};

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  // You already hide Navbar for /public routes in App.tsx, but keeping this safe
  const isPublicRoute = location.pathname.startsWith('/public');
  if (isPublicRoute) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const { bg, fg } = roleColor(user?.role);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'rgba(17, 24, 39, 0.85)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <Toolbar sx={{ minHeight: 72, display: 'flex', gap: 2 }}>
        {/* Brand */}
        <Box
          onClick={() => navigate('/')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <LocalHospitalIcon sx={{ color: '#ffffff' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1, color: '#fff' }}>
              MedRoster
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Workforce + Voice Ops
            </Typography>
          </Box>
        </Box>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Nav actions */}
        {isAuthenticated && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
            <Button
              variant={location.pathname.startsWith('/dashboard') ? 'contained' : 'text'}
              startIcon={<DashboardIcon />}
              onClick={() => navigate('/dashboard')}
              sx={{
                fontWeight: 700,
                color: location.pathname.startsWith('/dashboard') ? '#111827' : '#fff',
                bgcolor: location.pathname.startsWith('/dashboard') ? '#ffffff' : 'transparent',
                '&:hover': {
                  bgcolor: location.pathname.startsWith('/dashboard')
                    ? '#f3f4f6'
                    : 'rgba(255,255,255,0.08)',
                },
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              Dashboard
            </Button>

            <Button
              variant={location.pathname.startsWith('/public/updates') ? 'contained' : 'text'}
              startIcon={<CampaignIcon />}
              onClick={() => navigate('/public/updates')}
              sx={{
                fontWeight: 700,
                color: location.pathname.startsWith('/public/updates') ? '#111827' : '#fff',
                bgcolor: location.pathname.startsWith('/public/updates') ? '#ffffff' : 'transparent',
                '&:hover': {
                  bgcolor: location.pathname.startsWith('/public/updates')
                    ? '#f3f4f6'
                    : 'rgba(255,255,255,0.08)',
                },
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              Public Updates
            </Button>

            <Divider
              orientation="vertical"
              flexItem
              sx={{ borderColor: 'rgba(255,255,255,0.12)', mx: 0.5 }}
            />

            {/* User chip */}
            <Chip
              label={user?.role ? user.role.toUpperCase() : 'USER'}
              size="small"
              sx={{
                bgcolor: bg,
                color: fg,
                fontWeight: 800,
                letterSpacing: 0.5,
              }}
            />

            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
              {user?.name || 'User'}
            </Typography>

            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                fontWeight: 700,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
              }}
            >
              Logout
            </Button>
          </Box>
        )}

        {/* If not authenticated */}
        {!isAuthenticated && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={() => navigate('/login')}
              sx={{
                fontWeight: 700,
                color: '#fff',
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
              }}
            >
              Login
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};