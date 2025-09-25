// src/components/Teacher/Summary.js
import React, { useState, useEffect, forwardRef } from "react";
import axios from "axios";
import { CSVLink } from "react-csv";
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
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Box,
  Alert,
  Card,
  CardContent,
  Chip,
  Fade,
  TextField,
  IconButton,
} from "@mui/material";
import {
  ArrowBack,
  Download,
  CalendarToday,
  School,
  Group,
  Subject,
  Person,
  TrendingUp,
  BarChart,
  Visibility,
  Summarize,
  AssignmentTurnedIn,
} from "@mui/icons-material";

const Summary = () => {
  const [departments] = useState(["CSE", "ECE", "MECH"]);
  const [sections] = useState(["A", "B", "C"]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
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
    { studentId: 1, subjectId: 1, status: "present", date: "2025-09-25" },
    { studentId: 2, subjectId: 1, status: "absent", date: "2025-09-25" }
  ]
};


  // Custom DatePicker Input
  const CustomDatePickerInput = forwardRef(({ value, onClick }, ref) => (
    <TextField 
      fullWidth 
      onClick={onClick} 
      ref={ref} 
      value={value} 
      label="Filter by Date" 
      placeholder="Select date to filter"
      readOnly 
      InputProps={{
        startAdornment: <CalendarToday sx={{ color: "action.active", mr: 1 }} />
      }}
    />
  ));

  // Fetch subjects based on department & section
useEffect(() => {
  if (selectedDept && selectedSection) {
    setLoading(true);
    axios
      .get(`${API_URL}/subjects?department=${selectedDept}&section=${selectedSection}`)
      .then((res) => setSubjects(res.data.length ? res.data : staticData.subjects.filter(s => s.department === selectedDept && s.section === selectedSection)))
      .catch((err) => {
        console.log(err);
        setSubjects(staticData.subjects.filter(s => s.department === selectedDept && s.section === selectedSection));
      })
      .finally(() => setLoading(false));
  }
}, [selectedDept, selectedSection]);


  // Fetch students based on department & section
  useEffect(() => {
  if (selectedDept && selectedSection) {
    setLoading(true);
    axios
      .get(`${API_URL}/students?department=${selectedDept}&section=${selectedSection}`)
      .then((res) => setStudents(res.data.length ? res.data : staticData.students.filter(s => s.department === selectedDept && s.section === selectedSection)))
      .catch((err) => {
        console.log(err);
        setStudents(staticData.students.filter(s => s.department === selectedDept && s.section === selectedSection));
      })
      .finally(() => setLoading(false));
  }
}, [selectedDept, selectedSection]);


  // Fetch attendance for selected subject
  useEffect(() => {
  if (selectedSubject) {
    setLoading(true);
    axios
      .get(`${API_URL}/attendance?subjectId=${selectedSubject}`)
      .then((res) => setAttendance(res.data.length ? res.data : staticData.attendance.filter(a => a.subjectId === parseInt(selectedSubject))))
      .catch((err) => {
        console.log(err);
        setAttendance(staticData.attendance.filter(a => a.subjectId === parseInt(selectedSubject)));
      })
      .finally(() => setLoading(false));
  } else {
    setAttendance([]);
  }
}, [selectedSubject]);


  // Calculate summary data with date filter
  useEffect(() => {
    if (students.length && selectedSubject) {
      const summary = students.map((stu) => {
        const studentAtt = attendance.filter((att) => {
          return (
            att.studentId.toString() === stu.id.toString() &&
            att.subjectId.toString() === selectedSubject.toString() &&
            (!selectedDate || att.date === selectedDate.toISOString().split("T")[0])
          );
        });

        const total = studentAtt.length;
        const present = studentAtt.filter((a) => a.status === "present").length;
        const absent = studentAtt.filter((a) => a.status === "absent").length;
        const onDuty = studentAtt.filter((a) => a.status === "onDuty").length;
        const percentage = total ? ((present / total) * 100).toFixed(2) : 0;

        return { ...stu, total, present, absent, onDuty, percentage };
      });
      setSummaryData(summary);
    } else {
      setSummaryData([]);
    }
  }, [students, attendance, selectedDate, selectedSubject]);

  const getPercentageColor = (percentage) => {
    if (percentage >= 75) return 'success';
    if (percentage >= 50) return 'warning';
    return 'error';
  };

  const getPercentageIcon = (percentage) => {
    if (percentage >= 75) return "🎯";
    if (percentage >= 50) return "⚠️";
    return "🔴";
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
                Attendance Summary
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                View and analyze student attendance reports
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {summaryData.length > 0 && !selectedStudent && (
                <CSVLink
                  data={summaryData}
                  filename={"attendance_summary.csv"}
                  style={{ textDecoration: 'none' }}
                >
                  <Button 
                    variant="contained"
                    startIcon={<Download />}
                    sx={{
                      background: "rgba(255, 255, 255, 0.2)",
                      color: "white",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: 3,
                      px: 3,
                      fontWeight: "bold",
                      "&:hover": {
                        background: "rgba(255, 255, 255, 0.3)",
                      }
                    }}
                  >
                    Export CSV
                  </Button>
                </CSVLink>
              )}
            </Box>
          </Box>

          {/* Filters Section */}
          <Paper elevation={6} sx={{ p: 4, mb: 4, borderRadius: 3, background: "white" }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', color: "#333" }}>
              <BarChart sx={{ mr: 1, color: "#2196f3" }} /> Filter Summary
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel><School sx={{ fontSize: 18, mr: 1 }} /> Department</InputLabel>
                  <Select 
                    value={selectedDept} 
                    label="Department" 
                    onChange={(e) => setSelectedDept(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">Select Department</MenuItem>
                    {departments.map((d) => (
                      <MenuItem key={d} value={d}>{d}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel><Group sx={{ fontSize: 18, mr: 1 }} /> Section</InputLabel>
                  <Select 
                    value={selectedSection} 
                    label="Section" 
                    onChange={(e) => setSelectedSection(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">Select Section</MenuItem>
                    {sections.map((s) => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel><Subject sx={{ fontSize: 18, mr: 1 }} /> Subject</InputLabel>
                  <Select 
                    value={selectedSubject} 
                    label="Subject" 
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">Select Subject</MenuItem>
                    {subjects.map((sub) => (
                      <MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="yyyy-MM-dd"
                  isClearable
                  customInput={<CustomDatePickerInput />}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Loading State */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
              <CircularProgress size={60} sx={{ color: "#2196f3" }} />
            </Box>
          ) : summaryData.length > 0 && !selectedStudent ? (
            /* Summary Table */
            <Paper elevation={6} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ 
                background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)", 
                p: 2,
                color: "white"
              }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Summarize sx={{ mr: 1 }} /> Attendance Summary
                </Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: "#f8f9fa" }}>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                        <Person sx={{ mr: 1, verticalAlign: 'middle' }} /> Student Name
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Total Periods</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Present</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Absent</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>On Duty</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Attendance %</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {summaryData.map((stu) => (
                      <TableRow key={stu.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                        <TableCell sx={{ fontSize: '1rem', fontWeight: 'medium' }}>
                          {stu.name}
                        </TableCell>
                        <TableCell align="center">{stu.total}</TableCell>
                        <TableCell align="center">
                          <Chip label={stu.present} color="success" variant="outlined" size="small" />
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={stu.absent} color="error" variant="outlined" size="small" />
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={stu.onDuty} color="warning" variant="outlined" size="small" />
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            icon={<span>{getPercentageIcon(parseFloat(stu.percentage))}</span>}
                            label={`${stu.percentage}%`}
                            color={getPercentageColor(parseFloat(stu.percentage))}
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton 
                            onClick={() => setSelectedStudent(stu)}
                            sx={{ color: "#2196f3" }}
                            title="View Details"
                          >
                            <Visibility />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ) : selectedStudent ? (
            /* Student Detail View */
            <Paper elevation={6} sx={{ p: 4, borderRadius: 3, background: "white" }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => setSelectedStudent(null)} sx={{ mr: 2, color: "#2196f3" }}>
                  <ArrowBack />
                </IconButton>
                <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', color: "#333" }}>
                  <Person sx={{ mr: 1, color: "#2196f3" }} /> Student Details: {selectedStudent.name}
                </Typography>
              </Box>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Card sx={{ background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)", color: "white", borderRadius: 3 }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <TrendingUp sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold">{selectedStudent.percentage}%</Typography>
                      <Typography variant="body1">Attendance Percentage</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Card sx={{ background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)", color: "white", borderRadius: 3 }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" fontWeight="bold">{selectedStudent.total}</Typography>
                      <Typography variant="body1">Total Periods</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Card sx={{ background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)", color: "white", borderRadius: 3 }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" fontWeight="bold">{selectedStudent.present}</Typography>
                      <Typography variant="body1">Present</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Card sx={{ background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)", color: "white", borderRadius: 3 }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" fontWeight="bold">{selectedStudent.absent}</Typography>
                      <Typography variant="body1">Absent</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Card sx={{ background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)", color: "white", borderRadius: 3 }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <AssignmentTurnedIn sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold">{selectedStudent.onDuty}</Typography>
                      <Typography variant="body1">On Duty</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <CSVLink
                  data={[selectedStudent]}
                  filename={`${selectedStudent.name}_summary.csv`}
                  style={{ textDecoration: 'none' }}
                >
                  <Button 
                    variant="contained"
                    startIcon={<Download />}
                    sx={{
                      background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                      color: "white",
                      borderRadius: 3,
                      px: 4,
                      fontWeight: "bold",
                    }}
                  >
                    Download Student Report
                  </Button>
                </CSVLink>
              </Box>
            </Paper>
          ) : (
            <Alert severity="info" sx={{ mt: 3, borderRadius: 3, fontSize: '1.1rem' }} icon={<School />}>
              Please select a department, section, and subject to view attendance summary.
            </Alert>
          )}
        </Paper>
      </Fade>
    </Container>
  );
};

export default Summary;