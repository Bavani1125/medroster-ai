import React, { useState } from 'react';
import {
  Paper, Typography, TextField, MenuItem, Button,
  Tooltip, CircularProgress, Snackbar, Alert,
  Checkbox, FormControlLabel, Box,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

const severities = ['Low', 'Medium', 'High'];
const roles = ['Nurse', 'Doctor', 'Staff'];

export default function EmergencyBroadcastPanel() {
  const [severity, setSeverity] = useState(severities[0]);
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [autoRepeat, setAutoRepeat] = useState(false);
  const [message, setMessage] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [ackList, setAckList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleGenerateBroadcast = async () => {
    if (!message.trim()) { setError('Message is required.'); return; }
    if (targetRoles.length === 0) { setError('Select at least one target role.'); return; }
    setLoading(true); setError(''); setSuccess(false);
    setTimeout(() => {
      setAudioUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3');
      setAckList(['Nurse A', 'Doctor B']);
      setLoading(false); setSuccess(true);
    }, 1500);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 520, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <WarningAmberIcon color="warning" sx={{ fontSize: 32, mr: 1 }} />
        <Typography variant="h5" fontWeight={700} sx={{ flex: 1 }}>Emergency Broadcast</Typography>
        <Tooltip title="Broadcast urgent messages to staff"><InfoOutlinedIcon color="action" /></Tooltip>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField select label="Severity" value={severity}
            onChange={(e) => setSeverity(e.target.value)} fullWidth helperText="Urgency level">
            {severities.map((sev) => <MenuItem key={sev} value={sev}>{sev}</MenuItem>)}
          </TextField>
          <TextField select label="Target Roles" value={targetRoles}
            onChange={(e) => setTargetRoles(typeof e.target.value === 'string' ? e.target.value.split(',') : (e.target.value as string[]))}
            fullWidth SelectProps={{ multiple: true }} helperText="Who should receive this?">
            {roles.map((role) => <MenuItem key={role} value={role}>{role}</MenuItem>)}
          </TextField>
        </Box>

        <TextField label="Broadcast Message" value={message}
          onChange={(e) => setMessage(e.target.value)} fullWidth multiline minRows={2}
          inputProps={{ maxLength: 240 }} helperText={`${message.length}/240 characters`}
          required error={!!error && !message.trim()} />

        <FormControlLabel
          control={<Checkbox checked={autoRepeat} onChange={(e) => setAutoRepeat(e.target.checked)} color="primary" />}
          label="Auto-repeat until ACK" />

        <Button variant="contained" color="error" fullWidth size="large"
          startIcon={loading ? <CircularProgress size={20} /> : <VolumeUpIcon />}
          onClick={handleGenerateBroadcast} disabled={loading} sx={{ fontWeight: 700 }}>
          {loading ? 'Generating...' : 'Generate + Broadcast'}
        </Button>

        {audioUrl && (
          <Paper elevation={1} sx={{ p: 2, borderRadius: 2, bgcolor: '#fffbe6' }}>
            <audio controls src={audioUrl} style={{ width: '100%' }} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>ACK List:</strong> {ackList.length === 0 ? 'No acknowledgements yet.' : ''}
            </Typography>
            {ackList.length > 0 && (
              <ul style={{ margin: '0.5rem 0 0 1rem', color: '#b7791f' }}>
                {ackList.map((name) => <li key={name}>{name}</li>)}
              </ul>
            )}
          </Paper>
        )}
      </Box>

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" onClose={() => setError('')} variant="filled">{error}</Alert>
      </Snackbar>
      <Snackbar open={success} autoHideDuration={2500} onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled">Broadcast generated!</Alert>
      </Snackbar>
    </Paper>
  );
}
