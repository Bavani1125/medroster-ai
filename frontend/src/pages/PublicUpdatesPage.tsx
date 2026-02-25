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
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { publicAPI } from '../api';

type Dept = { id: number; name: string };
type UpdateType = 'wait_time' | 'visiting' | 'directions' | 'safety';

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
    const d = departments.find(x => x.id === departmentId);
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

      setTranscript(t);
      setAudioSrc(`data:${contentType};base64,${audioBase64}`);

      const audio = new Audio(`data:${contentType};base64,${audioBase64}`);
      await audio.play();
    } catch (e: any) {
      setErr(e?.response?.data?.detail || e?.message || 'Failed to generate voice update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f6f7fb', py: 4 }}>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            Public Voice Updates
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Multilingual updates for patients and families (no login).
          </Typography>

          {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

          <TextField
            select
            fullWidth
            label="Department"
            value={departmentId}
            onChange={(e) => setDepartmentId(Number(e.target.value))}
            sx={{ mb: 2 }}
          >
            {departments.map((d) => (
              <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            label="Language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'es')}
            sx={{ mb: 2 }}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="es">Spanish</MenuItem>
          </TextField>

          <TextField
            select
            fullWidth
            label="Update Type"
            value={updateType}
            onChange={(e) => setUpdateType(e.target.value as UpdateType)}
            sx={{ mb: 2 }}
          >
            <MenuItem value="wait_time">Wait Time</MenuItem>
            <MenuItem value="visiting">Visiting</MenuItem>
            <MenuItem value="directions">Directions</MenuItem>
            <MenuItem value="safety">Safety</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Optional Note"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="e.g., Mask required in ICU today."
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={loading ? <CircularProgress size={18} /> : <VolumeUpIcon />}
            onClick={handleGenerate}
            disabled={loading}
            sx={{ fontWeight: 800 }}
          >
            {loading ? 'Generating...' : 'Generate Voice Update'}
          </Button>

          {audioSrc && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                {deptName} • Preview
              </Typography>
              <audio controls src={audioSrc} style={{ width: '100%', marginTop: 8 }} />
            </Box>
          )}

          {transcript && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Transcript
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {transcript}
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}