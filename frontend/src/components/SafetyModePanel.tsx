import React, { useState } from 'react';
import {
  Paper, Typography, Slider, Button, Tooltip,
  CircularProgress, Snackbar, Alert,
  FormControlLabel, Checkbox, Box,
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';

export default function SafetyModePanel() {
  const [burnoutThreshold, setBurnoutThreshold] = useState(70);
  const [blockCritical, setBlockCritical] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleGenerateBriefing = async () => {
    setLoading(true); setSuccess(false);
    setTimeout(() => {
      setAudioUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3');
      setLoading(false); setSuccess(true);
    }, 1500);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 520, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <ShieldIcon color="success" sx={{ fontSize: 32, mr: 1 }} />
        <Typography variant="h5" fontWeight={700} sx={{ flex: 1 }}>Safety Mode</Typography>
        <Tooltip title="Burnout guard and supervisor briefing"><InfoOutlinedIcon color="action" /></Tooltip>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography gutterBottom fontWeight={500}>
            Burnout Threshold:{' '}
            <span style={{ color: '#16a34a', fontWeight: 700 }}>{burnoutThreshold}</span>
          </Typography>
          <Slider value={burnoutThreshold}
            onChange={(_, val) => setBurnoutThreshold(val as number)}
            min={0} max={100} step={1}
            marks={[{ value: 0, label: '0' }, { value: 100, label: '100' }]}
            valueLabelDisplay="auto" />
        </Box>

        <FormControlLabel
          control={<Checkbox checked={blockCritical} onChange={(e) => setBlockCritical(e.target.checked)} color="error" />}
          label="Block critical assignments above threshold" />

        <Button variant="contained" color="success" fullWidth size="large"
          startIcon={loading ? <CircularProgress size={20} /> : <RecordVoiceOverIcon />}
          onClick={handleGenerateBriefing} disabled={loading} sx={{ fontWeight: 700 }}>
          {loading ? 'Generating...' : 'Generate Supervisor Audio Briefing'}
        </Button>

        {audioUrl && (
          <Paper elevation={1} sx={{ p: 2, borderRadius: 2, bgcolor: '#f7fafc' }}>
            <audio controls src={audioUrl} style={{ width: '100%' }} />
          </Paper>
        )}
      </Box>

      <Snackbar open={success} autoHideDuration={2500} onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled">Supervisor briefing generated!</Alert>
      </Snackbar>
    </Paper>
  );
}
