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

  if (loading) {
    return <Container sx={{ mt: 4 }}>Loading...</Container>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.name}! 👋
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Role: {user?.role}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Departments
              </Typography>
              <Typography variant="h5">{departments.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Shifts
              </Typography>
              <Typography variant="h5">{shifts.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Staff
              </Typography>
              <Typography variant="h5">{users.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Coverage
              </Typography>
              <Typography variant="h5">
                {shifts.length > 0
                  ? Math.round((shifts.length / (departments.length * 3)) * 100) + '%'
                  : '0%'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Departments Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Departments</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="small"
            onClick={() => setOpenDialog(true)}
          >
            Add Department
          </Button>
        </Box>
        <Grid container spacing={2}>
          {departments.map((dept) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={dept.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{dept.name}</Typography>
                  <Typography color="textSecondary">{dept.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Shifts Section */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Recent Shifts</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="small"
            onClick={() => setOpenDialog(true)}
          >
            Add Shift
          </Button>
        </Box>
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Shift ID</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Department</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Role</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Staff Needed</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {shifts.slice(0, 5).map((shift) => (
                <tr key={shift.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>#{shift.id}</td>
                  <td style={{ padding: '8px' }}>
                    {departments.find((d) => d.id === shift.department_id)?.name}
                  </td>
                  <td style={{ padding: '8px' }}>{shift.required_role}</td>
                  <td style={{ padding: '8px' }}>{shift.required_staff_count}</td>
                  <td style={{ padding: '8px' }}>
                    {new Date(shift.start_time).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Paper>

      {/* Dialog for Creating Department */}
      <Dialog open={openDialog && !newShift.start_time} onClose={() => setOpenDialog(false)}>
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
