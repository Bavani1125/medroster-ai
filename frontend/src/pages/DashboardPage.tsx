// src/pages/DashboardPage.tsx

import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Dialog,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Stack,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';

import { departmentAPI, shiftAPI, userAPI, aiAPI, assignmentAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS, getRoleColor, getRoleBgColor } from '../utils/roleUtils';

import AddIcon from '@mui/icons-material/Add';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

import EmergencyBroadcastPanel from '../components/EmergencyBroadcastPanel';
import PublicUpdatesPanel from '../components/PublicUpdatesPanel';
import SafetyModePanel from '../components/SafetyModePanel';

interface Department { id: number; name: string; description: string; }
interface Shift {
  id: number; department_id: number; start_time: string;
  end_time: string; required_role: string; required_staff_count: number;
}
interface User { id: number; name: string; email: string; role: string; department_id?: number; }
interface Assignment { id: number; user_id: number; shift_id: number; is_emergency: boolean; }
type DialogType = 'department' | 'shift';

function SectionShell(props: { title: string; subtitle?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden' }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="h6">{props.title}</Typography>
          {props.subtitle && (
            <Typography variant="body2" color="text.secondary">
              {props.subtitle}
            </Typography>
          )}
        </Box>
        {props.right}
      </Box>
      <Divider />
      <Box sx={{ p: 2.5 }}>{props.children}</Box>
    </Paper>
  );
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<DialogType>('department');
  const [dialogError, setDialogError] = useState<string | null>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [aiTab, setAiTab] = useState(0);

  const [newDept, setNewDept] = useState({ name: '', description: '' });
  const [newShift, setNewShift] = useState({
    department_id: 1, start_time: '', end_time: '',
    required_role: 'doctor', required_staff_count: 1,
  });

  const deptById = useMemo(() => {
    const m = new Map<number, Department>();
    departments.forEach((d) => m.set(d.id, d));
    return m;
  }, [departments]);

  const userById = useMemo(() => {
    const m = new Map<number, User>();
    users.forEach((u) => m.set(u.id, u));
    return m;
  }, [users]);

  useEffect(() => { void loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptRes, shiftRes, userRes, assignRes] = await Promise.all([
        departmentAPI.getDepartments(),
        shiftAPI.getShifts(),
        userAPI.getAllUsers(),
        assignmentAPI.getAssignments(),
      ]);
      setDepartments(deptRes.data || []);
      setShifts(shiftRes.data || []);
      setUsers(userRes.data || []);
      setAssignments(assignRes.data || []);
      setError(null);
      const firstDeptId = (deptRes.data?.[0]?.id as number | undefined) ?? 1;
      setNewShift((prev) => ({ ...prev, department_id: firstDeptId }));
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async () => {
    setDialogError(null);
    if (!newDept.name.trim()) { setDialogError('Department name is required.'); return; }
    try {
      await departmentAPI.createDepartment({ name: newDept.name.trim(), description: newDept.description.trim() });
      setNewDept({ name: '', description: '' });
      setOpenDialog(false);
      await loadData();
    } catch (err: any) {
      setDialogError(err?.response?.data?.detail || 'Failed to create department');
    }
  };

  const handleCreateShift = async () => {
    setDialogError(null);
    if (!newShift.department_id) { setDialogError('Department is required.'); return; }
    if (!newShift.start_time || !newShift.end_time) { setDialogError('Start time and end time are required.'); return; }
    try {
      const startISO = new Date(newShift.start_time).toISOString();
      const endISO = new Date(newShift.end_time).toISOString();
      if (new Date(endISO).getTime() <= new Date(startISO).getTime()) {
        setDialogError('End time must be after start time.'); return;
      }
      await shiftAPI.createShift({
        department_id: Number(newShift.department_id),
        start_time: startISO, end_time: endISO,
        required_role: newShift.required_role,
        required_staff_count: Number(newShift.required_staff_count),
      } as any);

      setNewShift({
        department_id: departments[0]?.id ?? 1,
        start_time: '',
        end_time: '',
        required_role: 'doctor',
        required_staff_count: 1,
      });
      setOpenDialog(false);
      await loadData();
    } catch (err: any) {
      setDialogError(err?.response?.data?.detail || 'Failed to create shift');
    }
  };

  const handleAISuggestions = async () => {
    setAiSuggestion('');
    if (shifts.length === 0) { setAiSuggestion('No shifts available yet.'); return; }
    setAiLoading(true);
    try {
      const res = await aiAPI.getSchedulingSuggestions(shifts[0].id);
      const text =
        res.data?.reasoning ||
        res.data?.ai_suggestion?.summary ||
        res.data?.summary ||
        JSON.stringify(res.data, null, 2);
      setAiSuggestion(text);
    } catch (err: any) {
      setAiSuggestion(err?.response?.data?.detail || 'Could not get AI suggestions. Check your OpenAI key.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleTextToSpeech = async () => {
    setTtsLoading(true);
    setAiSuggestion('');
    try {
      const message =
        'Attention all staff. Please review your upcoming shifts and assignments. This is an automated MedRoster announcement.';
      const res = await aiAPI.textToSpeech(message);
      const audioBase64 = res.data?.audio_base64;
      const contentType = res.data?.content_type || 'audio/mpeg';
      if (!audioBase64 || typeof audioBase64 !== 'string') throw new Error('TTS response missing audio_base64');

      const audio = new Audio(`data:${contentType};base64,${audioBase64}`);
      await audio.play();
      setAiSuggestion('Voice announcement played successfully.');
    } catch (err: any) {
      setAiSuggestion(err?.response?.data?.detail || err?.message || 'Text-to-speech failed. Check ElevenLabs API config.');
    } finally {
      setTtsLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 3.5 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
            <Typography variant="h4">Welcome, {user?.name}</Typography>
            {user?.role && (
              <Chip
                label={(ROLE_LABELS as any)[user.role] || user.role}
                sx={{
                  bgcolor: getRoleBgColor(user.role as any),
                  color: getRoleColor(user.role as any),
                  fontWeight: 900,
                  width: 'fit-content',
                }}
              />
            )}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Dashboard • {new Date().toLocaleDateString()}
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Stats */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 2,
            mb: 3,
          }}
        >
          {[
            { label: 'Departments', value: departments.length },
            { label: 'Shifts', value: shifts.length },
            { label: 'Staff', value: users.length },
            { label: 'Assignments', value: assignments.length },
          ].map((c) => (
            <Card key={c.label} elevation={0} sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 800 }}>
                  {c.label}
                </Typography>
                <Typography variant="h5" sx={{ mt: 0.5 }}>
                  {c.value}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Stack spacing={3}>
          {/* AI Features */}
          <SectionShell
            title="AI Features"
            subtitle="Scheduling insight + voice operations. Keep prompts free of PHI."
            right={
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  startIcon={aiLoading ? <CircularProgress size={18} /> : <AutoFixHighIcon />}
                  onClick={handleAISuggestions}
                  disabled={aiLoading}
                >
                  AI Scheduling Suggestion
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={ttsLoading ? <CircularProgress size={18} /> : <VolumeUpIcon />}
                  onClick={handleTextToSpeech}
                  disabled={ttsLoading}
                >
                  Voice Announce (11 Labs)
                </Button>
              </Stack>
            }
          >
            <Tabs value={aiTab} onChange={(_, v) => setAiTab(v)} sx={{ mb: 2 }}>
              <Tab label="Emergency Broadcast" />
              <Tab label="Public Voice Update" />
              <Tab label="Safety Mode" />
            </Tabs>

            {aiTab === 0 && <EmergencyBroadcastPanel />}
            {aiTab === 1 && <PublicUpdatesPanel />}
            {aiTab === 2 && <SafetyModePanel />}

            {aiSuggestion && (
              <Alert severity="info" sx={{ mt: 2 }}>
                {aiSuggestion}
              </Alert>
            )}
          </SectionShell>

          {/* Departments */}
          <SectionShell
            title="Departments"
            subtitle="Units that shifts and staff assignments belong to."
            right={
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                size="small"
                onClick={() => {
                  setDialogType('department');
                  setOpenDialog(true);
                }}
              >
                Add Department
              </Button>
            }
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: 2,
              }}
            >
              {departments.map((dept) => (
                <Card key={dept.id} elevation={0} sx={{ borderRadius: 4 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      {dept.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {dept.description || '—'}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </SectionShell>

          {/* Shifts */}
          <SectionShell
            title="Shift Management"
            subtitle="Create shifts and required roles per department."
            right={
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                size="small"
                onClick={() => {
                  setDialogType('shift');
                  setOpenDialog(true);
                }}
              >
                Add Shift
              </Button>
            }
          >
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead sx={{ bgcolor: 'rgba(15,23,42,0.03)' }}>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Staff Needed</TableCell>
                    <TableCell>Start</TableCell>
                    <TableCell>End</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shifts.map((shift) => (
                    <TableRow key={shift.id} hover>
                      <TableCell>#{shift.id}</TableCell>
                      <TableCell>{deptById.get(shift.department_id)?.name || '—'}</TableCell>
                      <TableCell>
                        <Chip label={shift.required_role} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{shift.required_staff_count}</TableCell>
                      <TableCell>{new Date(shift.start_time).toLocaleString()}</TableCell>
                      <TableCell>{new Date(shift.end_time).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </SectionShell>

          {/* Assignments */}
          <SectionShell
            title="Staff Assignments"
            subtitle="Recent assignments and emergency flags."
          >
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead sx={{ bgcolor: 'rgba(15,23,42,0.03)' }}>
                  <TableRow>
                    <TableCell>Staff</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Shift</TableCell>
                    <TableCell>Emergency</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignments.slice(0, 10).map((a) => {
                    const u = userById.get(a.user_id);
                    return (
                      <TableRow key={a.id} hover>
                        <TableCell>{u?.name || '—'}</TableCell>
                        <TableCell>{u?.role || '—'}</TableCell>
                        <TableCell>#{a.shift_id}</TableCell>
                        <TableCell>
                          <Chip
                            label={a.is_emergency ? 'Yes' : 'No'}
                            color={a.is_emergency ? 'error' : 'success'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </SectionShell>

          {/* Staff */}
          <SectionShell title="All Staff" subtitle="Staff directory (role + department).">
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead sx={{ bgcolor: 'rgba(15,23,42,0.03)' }}>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Department</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={u.role}
                          size="small"
                          sx={{
                            bgcolor: getRoleBgColor((u.role as any) || 'staff'),
                            color: getRoleColor((u.role as any) || 'staff'),
                            fontWeight: 800,
                          }}
                        />
                      </TableCell>
                      <TableCell>{deptById.get(u.department_id || -1)?.name || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </SectionShell>
        </Stack>

        {/* Create dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <Box sx={{ p: 3 }}>
            {dialogType === 'department' ? (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Add Department
                </Typography>
                {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
                <TextField
                  fullWidth
                  label="Department Name"
                  margin="normal"
                  value={newDept.name}
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Description"
                  margin="normal"
                  multiline
                  rows={3}
                  value={newDept.description}
                  onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                />
                <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                  <Button variant="outlined" onClick={() => setOpenDialog(false)}>
                    Cancel
                  </Button>
                  <Button variant="contained" onClick={handleCreateDepartment}>
                    Create
                  </Button>
                </Stack>
              </>
            ) : (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Add Shift
                </Typography>
                {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}

                <TextField
                  fullWidth
                  select
                  label="Department"
                  margin="normal"
                  value={newShift.department_id}
                  onChange={(e) => setNewShift({ ...newShift, department_id: parseInt(e.target.value, 10) })}
                  SelectProps={{ native: true }}
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Start Time"
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  value={newShift.start_time}
                  onChange={(e) => setNewShift({ ...newShift, start_time: e.target.value })}
                />

                <TextField
                  fullWidth
                  type="datetime-local"
                  label="End Time"
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  value={newShift.end_time}
                  onChange={(e) => setNewShift({ ...newShift, end_time: e.target.value })}
                />

                <TextField
                  fullWidth
                  select
                  label="Required Role"
                  margin="normal"
                  value={newShift.required_role}
                  onChange={(e) => setNewShift({ ...newShift, required_role: e.target.value })}
                  SelectProps={{ native: true }}
                >
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="staff">Staff</option>
                </TextField>

                <TextField
                  fullWidth
                  type="number"
                  label="Staff Count"
                  margin="normal"
                  value={newShift.required_staff_count}
                  onChange={(e) => setNewShift({ ...newShift, required_staff_count: parseInt(e.target.value, 10) })}
                />

                <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                  <Button variant="outlined" onClick={() => setOpenDialog(false)}>
                    Cancel
                  </Button>
                  <Button variant="contained" onClick={handleCreateShift}>
                    Create
                  </Button>
                </Stack>
              </>
            )}
          </Box>
        </Dialog>
      </Container>
    </Box>
  );
};