import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import TranslateIcon from '@mui/icons-material/Translate';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DirectionsIcon from '@mui/icons-material/Directions';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';

import { publicAPI } from '../api';

type Dept = { id: number; name: string };
type UpdateType = 'wait_time' | 'visiting' | 'directions' | 'safety';

const UPDATE_META: Record<UpdateType, { label: string; icon: React.ReactNode; helper: string }> = {
  wait_time: {
    label: 'Wait Time',
    icon: <AccessTimeIcon fontSize="small" />,
    helper: 'General queue/wait guidance (no patient-specific info).',
  },
  visiting: {
    label: 'Visiting',
    icon: <InfoOutlinedIcon fontSize="small" />,
    helper: 'Visiting hours, policy reminders, and entry rules.',
  },
  directions: {
    label: 'Directions',
    icon: <DirectionsIcon fontSize="small" />,
    helper: 'Where to go next (desk, elevator, floor, room zone).',
  },
  safety: {
    label: 'Safety',
    icon: <LocalPoliceIcon fontSize="small" />,
    helper: 'Safety notices: masks, restricted areas, alerts.',
  },
};

export default function PublicUpdatesPage() {
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [updateType, setUpdateType] = useState<UpdateType>('wait_time');
  const [customNote, setCustomNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [transcript, setTranscript] = useState('');
  const [audioSrc, setAudioSrc] = useState('');
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await publicAPI.getDepartments();
        setDepartments(res.data || []);
        if (res.data?.length) setDepartmentId(res.data[0].id);
      } catch (e: any) {
        setErr(e?.response?.data?.detail || 'Failed to load departments');
      }
    })();
  }, []);

  const deptName = useMemo(() => {
    const d = departments.find((x) => x.id === departmentId);
    return d?.name || '';
  }, [departments, departmentId]);

  const handleGenerate = async () => {
    setErr('');
    setTranscript('');
    setAudioSrc('');
    if (!departmentId) {
      setErr('Select a department.');
      return;
    }

    setLoading(true);
    try {
      const res = await publicAPI.generateVoiceUpdate({
        department_id: departmentId as number,
        language,
        update_type: updateType,
        custom_note: customNote.trim() ? customNote.trim() : undefined,
      });

      const audioBase64 = res.data?.audio_base64;
      const contentType = res.data?.content_type || 'audio/mpeg';
      const t = res.data?.transcript || '';

      if (!audioBase64) throw new Error('Missing audio_base64 in response');

      const src = `data:${contentType};base64,${audioBase64}`;
      setTranscript(t);
      setAudioSrc(src);

      if (autoplay) {
        const audio = new Audio(src);
        await audio.play();
      }
    } catch (e: any) {
      setErr(e?.response?.data?.detail || e?.message || 'Failed to generate voice update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'radial-gradient(1200px 600px at 50% 0%, rgba(37,99,235,0.22), transparent 62%), linear-gradient(180deg, #0b1220 0%, #0f172a 30%, #f6f7fb 30%, #f6f7fb 100%)',
        py: { xs: 3, sm: 5 },
      }}
    >
      <Container maxWidth="md">
        {/* Top strip */}
        <Box
          sx={{
            mb: 2.5,
            px: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'white',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
              MedRoster Public Voice
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              Updates for patients & families — no login
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              icon={<VerifiedUserIcon />}
              label="No PHI"
              sx={{
                bgcolor: 'rgba(255,255,255,0.12)',
                color: 'white',
                fontWeight: 800,
              }}
            />
            <Chip
              icon={<TranslateIcon />}
              label={language === 'en' ? 'English' : 'Spanish'}
              sx={{
                bgcolor: 'rgba(255,255,255,0.12)',
                color: 'white',
                fontWeight: 800,
              }}
            />
          </Stack>
        </Box>

        {/* Main card */}
        <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden' }}>
          {/* Header */}
          <Box
            sx={{
              p: { xs: 2.5, sm: 3 },
              background:
                'linear-gradient(90deg, rgba(37,99,235,0.10) 0%, rgba(219,39,119,0.08) 50%, rgba(2,6,23,0.0) 100%)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Tap to generate a voice update
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Designed for lobby screens, waiting rooms, and help desks.
            </Typography>
          </Box>

          <Divider />

          <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
            {err && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {err}
              </Alert>
            )}

            {/* Controls */}
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  select
                  fullWidth
                  label="Department"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(Number(e.target.value))}
                  helperText="Pick a department / unit"
                >
                  {departments.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  label="Language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'es')}
                  helperText="Multilingual support"
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                </TextField>
              </Stack>

              {/* Update Type as pill toggles (more kiosk-friendly) */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                  Update Type
                </Typography>
                <ToggleButtonGroup
                  value={updateType}
                  exclusive
                  onChange={(_, v) => v && setUpdateType(v)}
                  sx={{
                    flexWrap: 'wrap',
                    gap: 1,
                    '& .MuiToggleButton-root': {
                      borderRadius: 999,
                      px: 2,
                      py: 1,
                      border: '1px solid rgba(15,23,42,0.10)',
                    },
                  }}
                >
                  {(Object.keys(UPDATE_META) as UpdateType[]).map((k) => (
                    <ToggleButton key={k} value={k}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {UPDATE_META[k].icon}
                        <span>{UPDATE_META[k].label}</span>
                      </Stack>
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                  {UPDATE_META[updateType].helper}
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Optional Note"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Example: Mask required in ICU today. Please check in at the front desk."
                helperText="Keep it general. Avoid names / MRNs / private info."
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={loading ? <CircularProgress size={18} /> : <VolumeUpIcon />}
                  onClick={handleGenerate}
                  disabled={loading}
                  sx={{ px: 2.5, py: 1.2, flex: 1 }}
                >
                  {loading ? 'Generating...' : 'Generate Voice Update'}
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => setAutoplay((v) => !v)}
                  sx={{ px: 2.5, py: 1.2, width: { xs: '100%', sm: 'auto' } }}
                >
                  Autoplay: {autoplay ? 'On' : 'Off'}
                </Button>
              </Stack>

              {/* Output */}
              {(audioSrc || transcript) && (
                <Paper
                  elevation={0}
                  sx={{
                    mt: 1,
                    p: 2,
                    borderRadius: 3,
                    bgcolor: 'rgba(15,23,42,0.02)',
                    border: '1px solid rgba(15,23,42,0.08)',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>
                    {deptName} • Preview
                  </Typography>

                  {audioSrc && <audio controls src={audioSrc} style={{ width: '100%' }} />}

                  {transcript && (
                    <Box sx={{ mt: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                        Transcript
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {transcript}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              )}
            </Stack>
          </Box>
        </Paper>

        {/* Footer */}
        <Typography
          variant="caption"
          sx={{ display: 'block', textAlign: 'center', mt: 2.5, color: 'rgba(15,23,42,0.55)' }}
        >
          Powered by AI + voice. Designed for real-time clarity during high-stress hospital moments.
        </Typography>
      </Container>
    </Box>
  );
}