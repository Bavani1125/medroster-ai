// /Users/sunilganta/Documents/medroster-frontend/src/pages/PublicUpdatesPage.tsx

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ReplayIcon from '@mui/icons-material/Replay';
import TranslateIcon from '@mui/icons-material/Translate';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { publicAPI } from '../api';

type Dept = { id: number; name: string };
type UpdateType = 'wait_time' | 'visiting' | 'directions' | 'safety';

export default function PublicUpdatesPage() {
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [updateType, setUpdateType] = useState<UpdateType>('wait_time');
  const [customNote, setCustomNote] = useState('');
  const [loadingDeps, setLoadingDeps] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // Response fields
  const [transcript, setTranscript] = useState('');
  const [audioSrc, setAudioSrc] = useState('');
  const [coveragePct, setCoveragePct] = useState<number | null>(null);
  const [estimatedWaitMin, setEstimatedWaitMin] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      setLoadingDeps(true);
      setErr('');
      try {
        const res = await publicAPI.getDepartments();
        const list = res.data || [];
        setDepartments(list);
        if (list.length) setDepartmentId(list[0].id);
      } catch (e: any) {
        setErr(e?.response?.data?.detail || 'Failed to load departments');
      } finally {
        setLoadingDeps(false);
      }
    })();
  }, []);

  const selectedDept = useMemo(() => {
    return departments.find((d) => d.id === departmentId) || null;
  }, [departments, departmentId]);

  const title = language === 'es' ? 'Actualizaciones Públicas' : 'Public Updates';
  const subtitle =
    language === 'es'
      ? 'Toque para escuchar una actualización. No se muestra información personal.'
      : 'Tap to hear an update. No personal medical information is shown.';

  const primaryCta =
    language === 'es' ? 'Reproducir actualización de voz' : 'Play voice update';
  const replayCta = language === 'es' ? 'Repetir' : 'Replay';

  const updateTypeLabel = (t: UpdateType) => {
    if (language === 'es') {
      if (t === 'wait_time') return 'Tiempo de espera';
      if (t === 'visiting') return 'Visitas';
      if (t === 'directions') return 'Indicaciones';
      return 'Seguridad';
    }
    if (t === 'wait_time') return 'Wait Time';
    if (t === 'visiting') return 'Visiting';
    if (t === 'directions') return 'Directions';
    return 'Safety';
  };

  const playAudio = async (src: string) => {
    const audio = new Audio();
    audio.src = src;
    audio.load();
    await audio.play();
  };

  const handleGenerate = async () => {
    setErr('');
    setTranscript('');
    setAudioSrc('');
    setCoveragePct(null);
    setEstimatedWaitMin(null);

    if (!departmentId) {
      setErr(language === 'es' ? 'Seleccione un departamento.' : 'Select a department.');
      return;
    }

    setLoading(true);
    try {
      // Calls backend patient-safe endpoint
      const res = await publicAPI.generateVoiceUpdate({
        department_id: departmentId as number,
        language,
        update_type: updateType,
        custom_note: customNote.trim() ? customNote.trim() : undefined,
      });

      const audioBase64 = res.data?.audio_base64;
      const contentType = res.data?.content_type || 'audio/mpeg';
      const t = res.data?.transcript || '';
      const cov = typeof res.data?.coverage_pct === 'number' ? res.data.coverage_pct : null;
      const wait = typeof res.data?.estimated_wait_min === 'number' ? res.data.estimated_wait_min : null;

      if (!audioBase64 || typeof audioBase64 !== 'string') {
        console.log('PUBLIC_UPDATE_BAD_RESPONSE', res.data);
        throw new Error('Missing audio_base64 in response');
      }

      const src = `data:${contentType};base64,${audioBase64}`;
      setTranscript(t);
      setAudioSrc(src);
      setCoveragePct(cov);
      setEstimatedWaitMin(wait);

      await playAudio(src);
    } catch (e: any) {
      setErr(e?.response?.data?.detail || e?.message || 'Failed to generate update');
    } finally {
      setLoading(false);
    }
  };

  const handleReplay = async () => {
    if (!audioSrc) return;
    try {
      await playAudio(audioSrc);
    } catch (e) {
      // ignore
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0b1220',
        backgroundImage:
          'radial-gradient(1000px 500px at 20% 0%, rgba(59,130,246,0.35), transparent), radial-gradient(900px 500px at 80% 10%, rgba(34,197,94,0.25), transparent)',
        py: { xs: 3, md: 6 },
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
            <LocalHospitalIcon sx={{ color: 'rgba(255,255,255,0.9)' }} />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ color: '#fff', fontWeight: 900, letterSpacing: 0.2 }} variant="h5">
                MedRoster Public Voice
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.75)' }} variant="body2">
                {subtitle}
              </Typography>
            </Box>

            <Chip
              icon={<InfoOutlinedIcon />}
              label={language === 'es' ? 'Sin PHI' : 'No PHI'}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.12)',
                color: '#fff',
                fontWeight: 800,
              }}
            />
          </Box>

          {/* Controls */}
          {err && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {err}
            </Alert>
          )}

          {loadingDeps ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                <TextField
                  select
                  fullWidth
                  label={language === 'es' ? 'Departamento' : 'Department'}
                  value={departmentId}
                  onChange={(e) => setDepartmentId(Number(e.target.value))}
                  sx={{ flex: '1 1 240px' }}
                  InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.8)' } }}
                  InputProps={{
                    sx: { color: '#fff' },
                  }}
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
                  label={language === 'es' ? 'Idioma' : 'Language'}
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'es')}
                  sx={{ flex: '1 1 180px' }}
                  InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.8)' } }}
                  InputProps={{
                    sx: { color: '#fff' },
                  }}
                >
                  <MenuItem value="en">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TranslateIcon fontSize="small" /> English
                    </Box>
                  </MenuItem>
                  <MenuItem value="es">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TranslateIcon fontSize="small" /> Español
                    </Box>
                  </MenuItem>
                </TextField>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                <TextField
                  select
                  fullWidth
                  label={language === 'es' ? 'Tipo de actualización' : 'Update Type'}
                  value={updateType}
                  onChange={(e) => setUpdateType(e.target.value as UpdateType)}
                  sx={{ flex: '1 1 240px' }}
                  InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.8)' } }}
                  InputProps={{
                    sx: { color: '#fff' },
                  }}
                >
                  <MenuItem value="wait_time">{updateTypeLabel('wait_time')}</MenuItem>
                  <MenuItem value="visiting">{updateTypeLabel('visiting')}</MenuItem>
                  <MenuItem value="directions">{updateTypeLabel('directions')}</MenuItem>
                  <MenuItem value="safety">{updateTypeLabel('safety')}</MenuItem>
                </TextField>

                <TextField
                  fullWidth
                  label={language === 'es' ? 'Nota opcional' : 'Optional Note'}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder={language === 'es' ? 'Ej: Mascarilla requerida hoy.' : 'e.g., Mask required today.'}
                  sx={{ flex: '1 1 240px' }}
                  InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.8)' } }}
                  InputProps={{
                    sx: { color: '#fff' },
                  }}
                />
              </Box>

              {/* Stats strip (shows impact) */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip
                  label={
                    selectedDept
                      ? `${selectedDept.name}`
                      : language === 'es'
                        ? 'Departamento'
                        : 'Department'
                  }
                  sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 800 }}
                />
                <Chip
                  label={`${updateTypeLabel(updateType)}`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 800 }}
                />
                {typeof coveragePct === 'number' && (
                  <Chip
                    label={language === 'es' ? `Cobertura: ${coveragePct}%` : `Coverage: ${coveragePct}%`}
                    sx={{ bgcolor: 'rgba(34,197,94,0.18)', color: '#dcfce7', fontWeight: 900 }}
                  />
                )}
                {typeof estimatedWaitMin === 'number' && updateType === 'wait_time' && (
                  <Chip
                    label={language === 'es' ? `Espera: ~${estimatedWaitMin} min` : `Wait: ~${estimatedWaitMin} min`}
                    sx={{ bgcolor: 'rgba(59,130,246,0.18)', color: '#dbeafe', fontWeight: 900 }}
                  />
                )}
              </Box>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', my: 2 }} />

              {/* Primary actions */}
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={loading ? <CircularProgress size={18} /> : <VolumeUpIcon />}
                  onClick={handleGenerate}
                  disabled={loading}
                  sx={{
                    fontWeight: 900,
                    borderRadius: 3,
                    py: 1.4,
                    bgcolor: '#ffffff',
                    color: '#0b1220',
                    '&:hover': { bgcolor: '#f3f4f6' },
                    textTransform: 'none',
                  }}
                >
                  {loading ? (language === 'es' ? 'Generando...' : 'Generating...') : primaryCta}
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  startIcon={<ReplayIcon />}
                  onClick={handleReplay}
                  disabled={!audioSrc || loading}
                  sx={{
                    fontWeight: 900,
                    borderRadius: 3,
                    py: 1.4,
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.22)',
                    '&:hover': { borderColor: 'rgba(255,255,255,0.35)', bgcolor: 'rgba(255,255,255,0.06)' },
                    textTransform: 'none',
                  }}
                >
                  {replayCta}
                </Button>
              </Box>

              {/* Output */}
              {audioSrc && (
                <Box sx={{ mt: 2 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                    }}
                  >
                    <Typography sx={{ color: '#fff', fontWeight: 900 }} variant="subtitle1">
                      {language === 'es' ? 'Vista previa' : 'Preview'}
                    </Typography>
                    <audio controls src={audioSrc} style={{ width: '100%', marginTop: 10 }} />
                    {transcript && (
                      <Typography sx={{ color: 'rgba(255,255,255,0.75)', mt: 1 }} variant="body2">
                        <strong style={{ color: '#fff' }}>
                          {language === 'es' ? 'Transcripción:' : 'Transcript:'}
                        </strong>{' '}
                        {transcript}
                      </Typography>
                    )}
                  </Paper>
                </Box>
              )}
            </>
          )}
        </Paper>

        {/* Bottom note */}
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            mt: 2,
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          {language === 'es'
            ? 'Nota: Esta página proporciona actualizaciones generales. Para emergencias, llame al 911.'
            : 'Note: This page provides general updates. For emergencies, call 911.'}
        </Typography>
      </Container>
    </Box>
  );
}