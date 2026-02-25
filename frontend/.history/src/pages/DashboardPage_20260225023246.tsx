import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
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

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'department' | 'shift'>('department');
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
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

  useEffect(() => {
    loadData();
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
      setDepartments(deptRes.data);
      setShifts(shiftRes.data);
      setUsers(userRes.data);
      setAssignments(assignRes.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async () => {
    setDialogError(null);
    try {
      await departmentAPI.createDepartment(newDept);
      setNewDept({ name: '', description: '' });
      setOpenDialog(false);
      loadData();
    } catch (err: any) {
      setDialogError(err.response?.data?.detail || 'Failed to create department');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCreateShift = async () => {
    setDialogError(null);
    try {
      // Ensure start_time and end_time are in ISO 8601 format
      const shiftData = {
        ...newShift,
        start_time: newShift.start_time ? new Date(newShift.start_time).toISOString() : '',
        end_time: newShift.end_time ? new Date(newShift.end_time).toISOString() : '',
      };
      await shiftAPI.createShift(shiftData as any);
      setNewShift({
        department_id: 1,
        start_time: '',
        end_time: '',
        required_role: 'doctor',
        required_staff_count: 1,
      });
      setOpenDialog(false);
      loadData();
    } catch (err: any) {
      setDialogError(err.response?.data?.detail || 'Failed to create shift');
    }
  };

  const handleAISuggestions = async () => {
    if (shifts.length === 0) {
      setAiSuggestion('No shifts available for scheduling suggestions.');
      return;
    }
    setAiLoading(true);
    try {
      const response = await aiAPI.getSchedulingSuggestions(shifts[0].id);
      setAiSuggestion(response.data?.reasoning || 'AI suggestions generated successfully.');
    } catch (err: any) {
      setAiSuggestion('Unable to generate AI suggestions at this time.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleTextToSpeech = async () => {
    const message = `This is your schedule announcement. Please check your assignments for the upcoming shifts.`;
    try {
      const response = await aiAPI.textToSpeech(message);
      const audioUrl = URL.createObjectURL(response.data);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (err) {
      console.error('Text to speech failed:', err);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  const usersDepartment = user?.department_id
    ? users.filter((u) => u.department_id === user.department_id)
    : [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h4">Welcome, {user?.name}! 👋</Typography>
          <Chip
            label={ROLE_LABELS[user?.role as any] || user?.role}
            sx={{
              bgcolor: getRoleBgColor(user?.role as any),
              color: getRoleColor(user?.role as any),
              fontWeight: 'bold',
            }}
          />
        </Box>
        <Typography variant="body1" color="textSecondary">
          Dashboard • {new Date().toLocaleDateString()}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                📊 Departments
              </Typography>
              <Typography variant="h5">{departments.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                🕐 Shifts
              </Typography>
              <Typography variant="h5">{shifts.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                👥 Staff
              </Typography>
              <Typography variant="h5">{users.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                ✅ Assignments
              </Typography>
              <Typography variant="h5">{assignments.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* AI & Admin Section */}
      <PermissionGuard permission="manage_departments">
        <Paper sx={{ p: 3, mb: 4, bgcolor: '#f5f5f5' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            🤖 AI Features
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={aiLoading ? <CircularProgress size={20} /> : <AutoFixHighIcon />}
              onClick={handleAISuggestions}
              disabled={aiLoading}
            >
              Get Scheduling Suggestions
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<VolumeUpIcon />}
              onClick={handleTextToSpeech}
            >
              Announce via Voice (11 Labs)
            </Button>
          </Box>
          {aiSuggestion && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {aiSuggestion}
            </Alert>
          )}
        </Paper>
      </PermissionGuard>

      {/* Departments Section */}
      <PermissionGuard permission="manage_departments">
        <Paper sx={{ p: 3, mb: 4 }}>
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
          <Grid container spacing={2}>
            {departments.map((dept) => (
              <Grid item xs={12} sm={6} md={4} key={dept.id}>
                <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
                  <CardContent>
                    <Typography variant="h6">{dept.name}</Typography>
                    <Typography color="textSecondary" variant="body2">
                      {dept.description}
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
        <Paper sx={{ p: 3, mb: 4 }}>
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
            <Table>
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
                    <TableCell>
                      {departments.find((d) => d.id === shift.department_id)?.name}
                    </TableCell>
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

      {/* User Assignments */}
      <PermissionGuard permission="view_assignments">
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            👥 Staff Assignments
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>Staff Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Shift ID</TableCell>
                  <TableCell>Emergency</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.slice(0, 10).map((assignment) => {
                  const assignedUser = users.find((u) => u.id === assignment.user_id);
                  return (
                    <TableRow key={assignment.id} hover>
                      <TableCell>{assignedUser?.name}</TableCell>
                      <TableCell>{assignedUser?.role}</TableCell>
                      <TableCell>#{assignment.shift_id}</TableCell>
                      <TableCell>
                        {assignment.is_emergency ? (
                          <Chip label="Yes" color="error" size="small" />
                        ) : (
                          <Chip label="No" color="success" size="small" />
                        )}
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
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          👤 All Staff
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <Table>
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
                      label={u.role}
                      size="small"
                      sx={{
                        bgcolor: getRoleBgColor(u.role as any),
                        color: getRoleColor(u.role as any),
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {departments.find((d) => d.id === u.department_id)?.name || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>
        <Box sx={{ p: 3, width: 400 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Add New Department
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
        </Box>
      </Dialog>
    </Container>
  );
};
