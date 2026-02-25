// /Users/sunilganta/Documents/medroster-frontend/src/pages/DashboardPage.tsx

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
  Grid,
} from '@mui/material';

import { departmentAPI, shiftAPI, userAPI, aiAPI, assignmentAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { PermissionGuard } from '../components/PermissionGuard';
import { ROLE_LABELS, getRoleColor, getRoleBgColor } from '../utils/roleUtils';

import AddIcon from '@mui/icons-material/Add';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

interface Department {
  id: number;
  name: string;
  description: string;
}

interface Shift {
  id: number;
  department_id: number;
  start_time: string;
  end_time: string;
  required_role: string;
  required_staff_count: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department_id?: number;
}

interface Assignment {
  id: number;
  user_id: number;
  shift_id: number;
  is_emergency: boolean;
}

type DialogType = 'department' | 'shift';

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

  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');

  // New department form
  const [newDept, setNewDept] = useState({ name: '', description: '' });

  // New shift form
  const [newShift, setNewShift] = useState({
    department_id: 1,
    start_time: '',
    end_time: '',
    required_role: 'doctor',
    required_staff_count: 1,
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

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (!newDept.name.trim()) {
      setDialogError('Department name is required.');
      return;
    }
    try {
      await departmentAPI.createDepartment({
        name: newDept.name.trim(),
        description: newDept.description.trim(),
      });
      setNewDept({ name: '', description: '' });
      setOpenDialog(false);
      await loadData();
    } catch (err: any) {
      setDialogError(err?.response?.data?.detail || 'Failed to create department');
    }
  };

  const handleCreateShift = async () => {
    setDialogError(null);

    if (!newShift.department_id) {
      setDialogError('Department is required.');
      return;
    }
    if (!newShift.start_time || !newShift.end_time) {
      setDialogError('Start time and end time are required.');
      return;
    }

    try {
      const startISO = new Date(newShift.start_time).toISOString();
      const endISO = new Date(newShift.end_time).toISOString();

      if (new Date(endISO).getTime() <= new Date(startISO).getTime()) {
        setDialogError('End time must be after start time.');
        return;
      }

      const shiftData = {
        department_id: Number(newShift.department_id),
        start_time: startISO,
        end_time: endISO,
        required_role: newShift.required_role,
        required_staff_count: Number(newShift.required_staff_count),
      };

      await shiftAPI.createShift(shiftData as any);

      const firstDeptId = departments[0]?.id ?? 1;
      setNewShift({
        department_id: firstDeptId,
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

  /**
   * ✅ FIXED: Use the aiAPI methods that EXIST in your project typings.
   * Your aiAPI currently has:
   * - getSchedulingSuggestions(shiftId: number)
   * - generateAnnouncement(message: string)
   * - textToSpeech(message: string, language?: string)
   * - analyzeWorkload(...)
   *
   * So we call getSchedulingSuggestions with the first shift id.
   */
  const handleAISuggestions = async () => {
    setAiSuggestion('');

    if (shifts.length === 0) {
      setAiSuggestion('No shifts available for scheduling suggestions.');
      return;
    }

    setAiLoading(true);
    try {
      const shiftId = shifts[0].id;
      const res = await aiAPI.getSchedulingSuggestions(shiftId);

      // Your API seems to return { reasoning: "..."} or something similar.
      const reasoning =
        res.data?.reasoning ||
        res.data?.ai_suggestion?.summary ||
        'AI suggestions generated successfully.';

      setAiSuggestion(reasoning);
    } catch (err: any) {
      console.log('AI_SUGGEST_ERROR', err?.response?.data || err);
      setAiSuggestion(err?.response?.data?.detail || 'Unable to generate AI suggestions at this time.');
    } finally {
      setAiLoading(false);
    }
  };

  /**
   * ✅ FIXED: textToSpeech expects a STRING (per your typings)
   */
  const handleTextToSpeech = async () => {
    setTtsLoading(true);
    try {
      const message =
        'Attention staff. Please check your assignments for upcoming shifts. This is an automated MedRoster announcement.';

      const res = await aiAPI.textToSpeech(message);

      // Your backend was updated to return base64 audio. If your current backend still returns a file,
      // this will fail. We support BOTH.
      const audioBase64 = res.data?.audio_base64;
      const contentType = res.data?.content_type || 'audio/mpeg';

      if (audioBase64) {
        const audioSrc = `data:${contentType};base64,${audioBase64}`;
        const audio = new Audio(audioSrc);
        await audio.play();
      } else {
        // fallback if backend returns a blob/stream (older implementation)
        // This is best-effort; if res.data is JSON, it won't play and will throw.
        const audioUrl = URL.createObjectURL(res.data);
        const audio = new Audio(audioUrl);
        await audio.play();
      }
    } catch (err: any) {
      console.log('TTS_ERROR', err?.response?.data || err);
      setAiSuggestion(err?.response?.data?.detail || 'Text-to-speech failed. Check ElevenLabs API config.');
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

  const usersDepartment = user?.department_id
    ? users.filter((u) => u.department_id === user.department_id)
    : [];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f6f7fb' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Welcome, {user?.name}! 👋
            </Typography>

            {user?.role && (
              <Chip
                label={(ROLE_LABELS as any)[user.role] || user.role}
                sx={{
                  bgcolor: getRoleBgColor(user.role as any),
                  color: getRoleColor(user.role as any),
                  fontWeight: 700,
                }}
              />
            )}
          </Box>

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Dashboard • {new Date().toLocaleDateString()}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={3}>
          {/* Stats Cards */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: { xs: '0 0 100%', sm: '0 0 calc(50% - 8px)', md: '0 0 calc(25% - 12px)' } }}>
              <Card sx={{ borderRadius: 2, border: '1px solid #e6e8ef' }}>
                <CardContent>
                  <Typography sx={{ color: 'text.secondary' }} gutterBottom>
                    📊 Departments
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {departments.length}
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: { xs: '0 0 100%', sm: '0 0 calc(50% - 8px)', md: '0 0 calc(25% - 12px)' } }}>
              <Card sx={{ borderRadius: 2, border: '1px solid #e6e8ef' }}>
                <CardContent>
                  <Typography sx={{ color: 'text.secondary' }} gutterBottom>
                    🕐 Shifts
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {shifts.length}
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: { xs: '0 0 100%', sm: '0 0 calc(50% - 8px)', md: '0 0 calc(25% - 12px)' } }}>
              <Card sx={{ borderRadius: 2, border: '1px solid #e6e8ef' }}>
                <CardContent>
                  <Typography sx={{ color: 'text.secondary' }} gutterBottom>
                    👥 Staff
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {users.length}
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: { xs: '0 0 100%', sm: '0 0 calc(50% - 8px)', md: '0 0 calc(25% - 12px)' } }}>
              <Card sx={{ borderRadius: 2, border: '1px solid #e6e8ef' }}>
                <CardContent>
                  <Typography sx={{ color: 'text.secondary' }} gutterBottom>
                    ✅ Assignments
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {assignments.length}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* AI Section */}
          <PermissionGuard permission="manage_departments">
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e6e8ef' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                🤖 AI Features
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={aiLoading ? <CircularProgress size={18} /> : <AutoFixHighIcon />}
                  onClick={handleAISuggestions}
                  disabled={aiLoading}
                >
                  Get Scheduling Suggestions
                </Button>

                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={ttsLoading ? <CircularProgress size={18} /> : <VolumeUpIcon />}
                  onClick={handleTextToSpeech}
                  disabled={ttsLoading}
                >
                  Announce via Voice (11 Labs)
                </Button>
              </Box>

              {aiSuggestion && (
                <Alert severity="info" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
                  {aiSuggestion}
                </Alert>
              )}
            </Paper>
          </PermissionGuard>

          {/* Departments Section */}
          <PermissionGuard permission="manage_departments">
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e6e8ef' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">📋 Departments</Typography>
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
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {departments.map((dept) => (
                  <Box sx={{ flex: { xs: '0 0 100%', sm: '0 0 calc(50% - 8px)', md: '0 0 calc(33.33% - 12px)' } }} key={dept.id}>
                    <Card sx={{ borderRadius: 2, border: '1px solid #e6e8ef', '&:hover': { boxShadow: 3 } }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {dept.name}
                        </Typography>
                        <Typography sx={{ color: 'text.secondary' }} variant="body2">
                          {dept.description || '—'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </PermissionGuard>

          {/* Shifts Section */}
          <PermissionGuard permission="manage_shifts">
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e6e8ef' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">🕐 Shifts Management</Typography>
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
              </Box>

              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Staff Needed</TableCell>
                      <TableCell>Start Time</TableCell>
                      <TableCell>End Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {shifts.map((shift) => (
                      <TableRow key={shift.id} hover>
                        <TableCell>#{shift.id}</TableCell>
                        <TableCell>{deptById.get(shift.department_id)?.name || `Dept-${shift.department_id}`}</TableCell>
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
            </Paper>
          </PermissionGuard>

          {/* Assignments Section */}
          <PermissionGuard permission="view_assignments">
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e6e8ef' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                👥 Staff Assignments
              </Typography>

              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell>Staff Name</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Shift ID</TableCell>
                      <TableCell>Emergency</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignments.slice(0, 10).map((a) => {
                      const assignedUser = userById.get(a.user_id);
                      return (
                        <TableRow key={a.id} hover>
                          <TableCell>{assignedUser?.name || `User-${a.user_id}`}</TableCell>
                          <TableCell>{assignedUser?.role || '—'}</TableCell>
                          <TableCell>#{a.shift_id}</TableCell>
                          <TableCell>
                            {a.is_emergency ? <Chip label="Yes" color="error" size="small" /> : <Chip label="No" color="success" size="small" />}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            </Paper>
          </PermissionGuard>

          {/* Staff Users Section */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e6e8ef' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              👤 All Staff
            </Typography>

            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
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
                          label={(ROLE_LABELS as any)[u.role] || u.role}
                          size="small"
                          sx={{
                            bgcolor: getRoleBgColor((u.role as any) || 'staff'),
                            color: getRoleColor((u.role as any) || 'staff'),
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>
                      <TableCell>{deptById.get(u.department_id || -1)?.name || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            {user?.department_id && usersDepartment.length > 0 && (
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                Showing all staff. Your department has {usersDepartment.length} members.
              </Typography>
            )}
          </Paper>
        </Stack>

        {/* Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <Box sx={{ p: 3 }}>
            {dialogType === 'department' ? (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  ➕ Add New Department
                </Typography>

                {dialogError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {dialogError}
                  </Alert>
                )}

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

                <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                  <Button variant="outlined" onClick={() => setOpenDialog(false)}>
                    Cancel
                  </Button>
                  <Button variant="contained" onClick={handleCreateDepartment}>
                    Create
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  ➕ Add New Shift
                </Typography>

                {dialogError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {dialogError}
                  </Alert>
                )}

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

                <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                  <Button variant="outlined" onClick={() => setOpenDialog(false)}>
                    Cancel
                  </Button>
                  <Button variant="contained" onClick={handleCreateShift}>
                    Create
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Dialog>
      </Container>
    </Box>
  );
};