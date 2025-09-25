// src/components/Teacher/Attendance.js
import React, { useState, useEffect, forwardRef } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// --- Material-UI Imports ---
import {
  Container,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Box,
  Alert,
  Card,
  CardContent,
  Chip,
  Fade,
} from "@mui/material";
import {
  ArrowForward,
  CalendarToday,
  Schedule,
  School,
  Group,
  Subject,
  CheckCircle,
  Cancel,
  AssignmentTurnedIn,
  TrendingUp,
  Person,
} from "@mui/icons-material";

const Attendance = () => {
  const [departments] = useState(["CSE", "ECE", "MECH"]);
  const [sections] = useState(["A", "B", "C"]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:3001";

  const staticData = {
  subjects: [
    { id: 1, name: "Data Structures", department: "CSE", section: "A" },
    { id: 2, name: "Operating Systems", department: "CSE", section: "A" }
  ],
  students: [
    { id: 1, name: "Saravana Ji", department: "CSE", section: "A" },
    { id: 2, name: "Arun Kumar", department: "CSE", section: "A" }
  ],
  attendance: [
    { studentId: 1, subjectId: 1, status: "present", date: "2025-09-25", period: 1 },
    { studentId: 2, subjectId: 1, status: "absent", date: "2025-09-25", period: 1 }
  ]
};


  // Stats calculation - KEEPING YOUR ORIGINAL LOGIC
  const presentCount = attendance.filter(a => a.status === 'present').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;
  const onDutyCount = attendance.filter(a => a.status === 'onDuty').length;
  const totalMarked = presentCount + absentCount + onDutyCount;

  const fetchData = async (request) => {
    setLoading(true);
    try {
      const response = await request();
      return response.data;
    } catch (err) {
      console.error("API call failed:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
  if (selectedDept && selectedSection) {
    const fetchSubjects = async () => {
      const data = await fetchData(() =>
        axios.get(`${API_URL}/subjects?department=${selectedDept}&section=${selectedSection}`)
      );
      setSubjects(data.length ? data : staticData.subjects.filter(s => s.department === selectedDept && s.section === selectedSection));
    };
    fetchSubjects();
  }
}, [selectedDept, selectedSection]);


  useEffect(() => {
  if (selectedDept && selectedSection) {
    const fetchStudents = async () => {
      const data = await fetchData(() =>
        axios.get(`${API_URL}/students?department=${selectedDept}&section=${selectedSection}`)
      );
      setStudents(data.length ? data : staticData.students.filter(s => s.department === selectedDept && s.section === selectedSection));
    };
    fetchStudents();
  }
}, [selectedDept, selectedSection]);


  useEffect(() => {
  if (selectedSubject && selectedDate && selectedPeriod) {
    const dateStr = selectedDate.toISOString().split("T")[0];
    const fetchAttendance = async () => {
      const data = await fetchData(() =>
        axios.get(`${API_URL}/attendance?subjectId=${selectedSubject}&date=${dateStr}&period=${selectedPeriod}`)
      );
      setAttendance(data.length ? data : staticData.attendance.filter(a => a.subjectId === parseInt(selectedSubject) && a.date === dateStr && a.period === selectedPeriod));
    };
    fetchAttendance();
  }
}, [selectedSubject, selectedDate, selectedPeriod]);


  const handleStatusChange = async (studentId, status) => {
    setLoading(true);
    const dateStr = selectedDate.toISOString().split("T")[0];

    const existing = attendance.find(
      (a) => a.studentId === studentId && a.date === dateStr && a.period === selectedPeriod
    );

    try {
      if (existing) {
        await axios.put(`${API_URL}/attendance/${existing.id}`, { ...existing, status });
      } else {
        const newAtt = {
          studentId,
          subjectId: parseInt(selectedSubject),
          date: dateStr,
          period: selectedPeriod,
          status,
        };
        await axios.post(`${API_URL}/attendance`, newAtt);
      }

      const res = await axios.get(`${API_URL}/attendance?subjectId=${selectedSubject}&date=${dateStr}&period=${selectedPeriod}`);
      setAttendance(res.data);
    } catch (err) {
      console.error("Failed to update attendance:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const CustomDatePickerInput = forwardRef(({ value, onClick }, ref) => (
    <TextField 
      fullWidth 
      onClick={onClick} 
      ref={ref} 
      value={value} 
      label="Date" 
      readOnly 
      InputProps={{
        startAdornment: <CalendarToday sx={{ color: "action.active", mr: 1 }} />
      }}
    />
  ));

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'onDuty': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle />;
      case 'absent': return <Cancel />;
      case 'onDuty': return <AssignmentTurnedIn />;
      default: return null;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Fade in timeout={500}>
        <Paper elevation={8} sx={{ 
          p: 4, 
          borderRadius: 4,
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        }}>
          {/* Header Section */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 4,
            background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
            p: 3,
            borderRadius: 3,
            color: "white"
          }}>
            <Box>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Attendance Management
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Mark and manage student attendance efficiently
              </Typography>
            </Box>
            <Button 
                variant="contained" 
                href="/teacher/summary"
                startIcon={<TrendingUp />}
                sx={{
                  background: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  fontWeight: "bold",
                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.3)",
                  }
                }}
            >
                View Summary
            </Button>
          </Box>

          {/* Stats Cards */}
          {selectedSubject && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                  color: "white",
                  borderRadius: 3
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <CheckCircle sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold">{presentCount}</Typography>
                    <Typography variant="body1">Present</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
                  color: "white",
                  borderRadius: 3
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Cancel sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold">{absentCount}</Typography>
                    <Typography variant="body1">Absent</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                  color: "white",
                  borderRadius: 3
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <AssignmentTurnedIn sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold">{onDutyCount}</Typography>
                    <Typography variant="body1">On Duty</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                  color: "white",
                  borderRadius: 3
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Group sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold">{totalMarked}/{students.length}</Typography>
                    <Typography variant="body1">Marked</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Selection Area */}
          <Paper elevation={6} sx={{ p: 4, mb: 4, borderRadius: 3, background: "white" }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', color: "#333" }}>
              <School sx={{ mr: 1, color: "#2196f3" }} /> Class Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={2.4}>
                <FormControl fullWidth>
                  <InputLabel><School sx={{ fontSize: 18, mr: 1 }} /> Department</InputLabel>
                  <Select 
                    value={selectedDept} 
                    label="Department" 
                    onChange={(e) => setSelectedDept(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    {departments.map((d) => (
                      <MenuItem key={d} value={d}>{d}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <FormControl fullWidth>
                  <InputLabel><Group sx={{ fontSize: 18, mr: 1 }} /> Section</InputLabel>
                  <Select 
                    value={selectedSection} 
                    label="Section" 
                    onChange={(e) => setSelectedSection(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    {sections.map((s) => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2.4}>
                <FormControl fullWidth>
                  <InputLabel><Subject sx={{ fontSize: 18, mr: 1 }} /> Subject</InputLabel>
                  <Select 
                    value={selectedSubject} 
                    label="Subject" 
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    {subjects.map((sub) => (
                      <MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="yyyy-MM-dd"
                  customInput={<CustomDatePickerInput />}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <TextField
                  fullWidth
                  label="Period"
                  type="number"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  InputProps={{ 
                    inputProps: { min: 1, max: 10 },
                    startAdornment: <Schedule sx={{ color: "action.active", mr: 1 }} />
                  }}
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Attendance Table - KEEPING YOUR ORIGINAL TABLE STRUCTURE */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
              <CircularProgress size={60} sx={{ color: "#2196f3" }} />
            </Box>
          ) : students.length > 0 && selectedSubject ? (
            <Paper elevation={6} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ 
                background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)", 
                p: 2,
                color: "white"
              }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Group sx={{ mr: 1 }} /> Student Attendance List
                </Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: "#f8f9fa" }}>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                        <Person sx={{ mr: 1, verticalAlign: 'middle' }} /> Student Name
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Present</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Absent</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>On Duty</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student) => {
                      const att = attendance.find((a) => a.studentId === student.id);
                      return (
                        <TableRow key={student.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                          <TableCell sx={{ fontSize: '1rem', fontWeight: 'medium' }}>
                            {student.name}
                          </TableCell>
                          <TableCell colSpan={3}>
                            {/* KEEPING YOUR ORIGINAL RADIO GROUP STRUCTURE */}
                            <RadioGroup
                              row
                              aria-label={`status for ${student.name}`}
                              name={`status-${student.id}`}
                              value={att?.status || ''}
                              onChange={(e) => handleStatusChange(student.id, e.target.value)}
                            >
                                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                                    <FormControlLabel value="present" control={<Radio />} label="" />
                                </Box>
                                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                                    <FormControlLabel value="absent" control={<Radio />} label="" />
                                </Box>
                                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                                    <FormControlLabel value="onDuty" control={<Radio />} label="" />
                                </Box>
                            </RadioGroup>
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              icon={getStatusIcon(att?.status)} 
                              label={att?.status ? att.status.charAt(0).toUpperCase() + att.status.slice(1) : 'Not Marked'}
                              color={getStatusColor(att?.status)}
                              variant={att?.status ? "filled" : "outlined"}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ) : (
            <Alert severity="info" sx={{ mt: 3, borderRadius: 3, fontSize: '1.1rem' }} icon={<School />}>
              Please select a department, section, and subject to view and mark attendance.
            </Alert>
          )}
        </Paper>
      </Fade>
    </Container>
  );
};

export default Attendance;