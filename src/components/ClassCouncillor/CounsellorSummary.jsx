// src/components/ClassCouncillor/CounsellorSummary.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { CSVLink } from "react-csv";

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
  Chip,
  Fade,
  TextField,
  Tabs,
  Tab,
  InputAdornment,
  Card,
  CardContent,
} from "@mui/material";
import {
  Download,
  School,
  Group,
  Subject,
  Person,
  Search,
  Summarize,
  Dashboard,
  Psychology,
  TrendingUp,
  CheckCircle,
  Cancel,
  AssignmentTurnedIn,
} from "@mui/icons-material";

const API_URL = "http://localhost:3001";

const CounsellorSummary = () => {
  const [departments] = useState(["CSE", "ECE", "MECH"]);
  const [sections] = useState(["A", "B", "C"]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("subject");

  const [summaryData, setSummaryData] = useState([]);
  const [studentSummary, setStudentSummary] = useState(null);
  const [overallSummary, setOverallSummary] = useState(null);

  const staticData = {
  students: [
    { id: "1", name: "Saravana", regNo: "CSE1001", department: "CSE", section: "A", semester: 5 },
    { id: "2", name: "Jane Smith", regNo: "CSE1002", department: "CSE", section: "A", semester: 5 }
  ],
  subjects: [
    { id: "1", name: "Data Structures", department: "CSE", section: "A" },
    { id: "2", name: "Operating Systems", department: "CSE", section: "A" }
  ],
  attendance: [
    { studentId: "1", subjectId: "1", status: "present" },
    { studentId: "1", subjectId: "2", status: "absent" },
    { studentId: "2", subjectId: "1", status: "onDuty" },
    { studentId: "2", subjectId: "2", status: "present" }
  ]
};


  // Fetch students & subjects when department/section changes
 useEffect(() => {
  if (selectedDept && selectedSection) {
    setLoading(true);
    Promise.all([
      axios.get(`${API_URL}/students?department=${selectedDept}&section=${selectedSection}`)
        .catch(() => {
          console.warn("⚠️ Server down, using static students data");
          return { data: staticData.students.filter(s => s.department === selectedDept && s.section === selectedSection) };
        }),
      axios.get(`${API_URL}/subjects?department=${selectedDept}&section=${selectedSection}`)
        .catch(() => {
          console.warn("⚠️ Server down, using static subjects data");
          return { data: staticData.subjects.filter(s => s.department === selectedDept && s.section === selectedSection) };
        })
    ])
    .then(([studentsRes, subjectsRes]) => {
      setStudents(studentsRes.data);
      setSubjects(subjectsRes.data);
    })
    .finally(() => setLoading(false));
  }
}, [selectedDept, selectedSection]);


  // Fetch all attendance
 useEffect(() => {
  setLoading(true);
  axios.get(`${API_URL}/attendance`)
    .then(res => setAttendance(res.data))
    .catch(() => {
      console.warn("⚠️ Server down, using static attendance data");
      setAttendance(staticData.attendance);
    })
    .finally(() => setLoading(false));
}, []);


  // Calculate Subject Summary
  useEffect(() => {
    if (activeTab === "subject" && selectedSubject && students.length && attendance.length) {
      const summary = students.map(stu => {
        const att = attendance.filter(a => a.studentId.toString() === stu.id.toString() && a.subjectId.toString() === selectedSubject);
        const total = att.length;
        const present = att.filter(a => a.status === "present").length;
        const absent = att.filter(a => a.status === "absent").length;
        const onDuty = att.filter(a => a.status === "onDuty").length;
        const percentage = total ? ((present / total) * 100).toFixed(2) : 0;
        return { ...stu, total, present, absent, onDuty, percentage };
      });
      setSummaryData(summary);
    }
  }, [activeTab, selectedSubject, students, attendance]);

  // Calculate Student Summary and Overall Attendance
  useEffect(() => {
    if (activeTab === "student" && searchQuery && students.length && attendance.length && subjects.length) {
      const student = students.find(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.regNo.toLowerCase().includes(searchQuery.toLowerCase()));
      if (student) {
        // Calculate subject-wise attendance
        const subjectsData = subjects.map(sub => {
          const att = attendance.filter(a => a.studentId.toString() === student.id.toString() && a.subjectId.toString() === sub.id.toString());
          const total = att.length;
          const present = att.filter(a => a.status === "present").length;
          const absent = att.filter(a => a.status === "absent").length;
          const onDuty = att.filter(a => a.status === "onDuty").length;
          const percentage = total ? ((present / total) * 100).toFixed(2) : 0;
          return { ...sub, total, present, absent, onDuty, percentage };
        });

        // Calculate overall attendance across all subjects
        const allStudentAttendance = attendance.filter(a => a.studentId.toString() === student.id.toString());
        const overallTotal = allStudentAttendance.length;
        const overallPresent = allStudentAttendance.filter(a => a.status === "present").length;
        const overallAbsent = allStudentAttendance.filter(a => a.status === "absent").length;
        const overallOnDuty = allStudentAttendance.filter(a => a.status === "onDuty").length;
        const overallPercentage = overallTotal ? ((overallPresent / overallTotal) * 100).toFixed(2) : 0;

        setStudentSummary({ 
          student, 
          subjectsData,
          overall: {
            total: overallTotal,
            present: overallPresent,
            absent: overallAbsent,
            onDuty: overallOnDuty,
            percentage: overallPercentage
          }
        });
      } else {
        setStudentSummary(null);
        setOverallSummary(null);
      }
    }
  }, [activeTab, searchQuery, students, subjects, attendance]);

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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setStudentSummary(null);
    setOverallSummary(null);
    setSummaryData([]);
    setSelectedSubject("");
    setSearchQuery("");
  };

  // Prepare data for CSV export including overall summary
  const getStudentExportData = () => {
    if (!studentSummary) return [];
    
    const exportData = studentSummary.subjectsData.map(subject => ({
      'Student Name': studentSummary.student.name,
      'Registration Number': studentSummary.student.regNo,
      'Subject Name': subject.name,
      'Total Periods': subject.total,
      'Present': subject.present,
      'Absent': subject.absent,
      'On Duty': subject.onDuty,
      'Attendance Percentage': `${subject.percentage}%`
    }));

    // Add overall summary as the first row
    exportData.unshift({
      'Student Name': studentSummary.student.name,
      'Registration Number': studentSummary.student.regNo,
      'Subject Name': 'OVERALL ALL SUBJECTS',
      'Total Periods': studentSummary.overall.total,
      'Present': studentSummary.overall.present,
      'Absent': studentSummary.overall.absent,
      'On Duty': studentSummary.overall.onDuty,
      'Attendance Percentage': `${studentSummary.overall.percentage}%`
    });

    return exportData;
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
                <Psychology sx={{ mr: 2, verticalAlign: 'middle' }} />
                Counsellor Dashboard
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Comprehensive student attendance analysis and reporting
              </Typography>
            </Box>
          </Box>

          {/* Tabs Section */}
          <Paper elevation={6} sx={{ mb: 4, borderRadius: 3, background: "white" }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              centered
              sx={{
                '& .MuiTab-root': { fontSize: '1rem', fontWeight: 'bold', py: 2 },
                '& .Mui-selected': { color: '#2196f3' }
              }}
            >
              <Tab 
                icon={<Subject sx={{ fontSize: 24 }} />} 
                label="Subject Summary" 
                value="subject" 
                iconPosition="start" 
              />
              <Tab 
                icon={<Person sx={{ fontSize: 24 }} />} 
                label="Student Summary" 
                value="student" 
                iconPosition="start" 
              />
            </Tabs>
          </Paper>

          {/* Common Filters */}
          <Paper elevation={6} sx={{ p: 4, mb: 4, borderRadius: 3, background: "white" }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', color: "#333" }}>
              <Dashboard sx={{ mr: 1, color: "#2196f3" }} /> Class Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel><School sx={{ fontSize: 18, mr: 1 }} /> Department</InputLabel>
                  <Select 
                    value={selectedDept} 
                    label="Department" 
                    onChange={(e) => setSelectedDept(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">Select Department</MenuItem>
                    {departments.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel><Group sx={{ fontSize: 18, mr: 1 }} /> Section</InputLabel>
                  <Select 
                    value={selectedSection} 
                    label="Section" 
                    onChange={(e) => setSelectedSection(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">Select Section</MenuItem>
                    {sections.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              {activeTab === "student" && (
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Search Student (Name/RegNo)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter student name or registration number"
                    InputProps={{
                      startAdornment: <Search sx={{ color: "action.active", mr: 1 }} />
                    }}
                    sx={{ borderRadius: 2 }}
                  />
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Loading State */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
              <CircularProgress size={60} sx={{ color: "#2196f3" }} />
            </Box>
          ) : activeTab === "subject" ? (
            /* Subject Summary */
            <Box>
              <Paper elevation={6} sx={{ p: 3, mb: 3, borderRadius: 3, background: "white" }}>
                <FormControl fullWidth>
                  <InputLabel><Subject sx={{ fontSize: 18, mr: 1 }} /> Select Subject</InputLabel>
                  <Select 
                    value={selectedSubject} 
                    label="Select Subject"
                    onChange={e => setSelectedSubject(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">Select Subject</MenuItem>
                    {subjects.map(sub => <MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Paper>

              {summaryData.length > 0 ? (
                <Paper elevation={6} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  <Box sx={{ 
                    background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)", 
                    p: 2,
                    color: "white",
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                      <Summarize sx={{ mr: 1 }} /> Subject-wise Attendance Summary
                    </Typography>
                    <CSVLink data={summaryData} filename={"subject_summary.csv"} style={{ textDecoration: 'none' }}>
                      <Button 
                        variant="contained"
                        startIcon={<Download />}
                        sx={{
                          background: "rgba(255, 255, 255, 0.2)",
                          color: "white",
                          border: "1px solid rgba(255, 255, 255, 0.3)",
                          borderRadius: 3,
                          fontWeight: "bold",
                          "&:hover": {
                            background: "rgba(255, 255, 255, 0.3)",
                          }
                        }}
                      >
                        Export CSV
                      </Button>
                    </CSVLink>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ background: "#f8f9fa" }}>
                          <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Student Name</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Reg No</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Total Periods</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Present</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Absent</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>On Duty</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Attendance %</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {summaryData.map(stu => (
                          <TableRow key={stu.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                            <TableCell sx={{ fontWeight: 'medium' }}>{stu.name}</TableCell>
                            <TableCell>{stu.regNo}</TableCell>
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
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              ) : selectedSubject && (
                <Alert severity="info" sx={{ borderRadius: 3, fontSize: '1.1rem' }} icon={<Subject />}>
                  No attendance data found for the selected subject.
                </Alert>
              )}
            </Box>
          ) : activeTab === "student" ? (
            /* Student Summary */
            <Box>
              {studentSummary ? (
                <>
                  {/* Overall Attendance Summary Cards */}
                  <Paper elevation={6} sx={{ p: 3, mb: 3, borderRadius: 3, background: "white" }}>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: "#333", mb: 3 }}>
                      <TrendingUp sx={{ mr: 1, color: "#2196f3" }} /> Overall Attendance Summary
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={2.4}>
                        <Card sx={{ background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)", color: "white", borderRadius: 3 }}>
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" fontWeight="bold">{studentSummary.overall.total}</Typography>
                            <Typography variant="body1">Total Periods</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6} md={2.4}>
                        <Card sx={{ background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)", color: "white", borderRadius: 3 }}>
                          <CardContent sx={{ textAlign: 'center' }}>
                            <CheckCircle sx={{ fontSize: 30, mb: 1 }} />
                            <Typography variant="h4" fontWeight="bold">{studentSummary.overall.present}</Typography>
                            <Typography variant="body1">Present</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6} md={2.4}>
                        <Card sx={{ background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)", color: "white", borderRadius: 3 }}>
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Cancel sx={{ fontSize: 30, mb: 1 }} />
                            <Typography variant="h4" fontWeight="bold">{studentSummary.overall.absent}</Typography>
                            <Typography variant="body1">Absent</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6} md={2.4}>
                        <Card sx={{ background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)", color: "white", borderRadius: 3 }}>
                          <CardContent sx={{ textAlign: 'center' }}>
                            <AssignmentTurnedIn sx={{ fontSize: 30, mb: 1 }} />
                            <Typography variant="h4" fontWeight="bold">{studentSummary.overall.onDuty}</Typography>
                            <Typography variant="body1">On Duty</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6} md={2.4}>
                        <Card sx={{ background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)", color: "white", borderRadius: 3 }}>
                          <CardContent sx={{ textAlign: 'center' }}>
                            <TrendingUp sx={{ fontSize: 30, mb: 1 }} />
                            <Typography variant="h4" fontWeight="bold">{studentSummary.overall.percentage}%</Typography>
                            <Typography variant="body1">Overall %</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Subject-wise Details Table */}
                  <Paper elevation={6} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    <Box sx={{ 
                      background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)", 
                      p: 2,
                      color: "white",
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Person sx={{ mr: 1 }} /> Subject-wise Details: {studentSummary.student.name} ({studentSummary.student.regNo})
                      </Typography>
                      <CSVLink data={getStudentExportData()} filename={`${studentSummary.student.name}_complete_summary.csv`} style={{ textDecoration: 'none' }}>
                        <Button 
                          variant="contained"
                          startIcon={<Download />}
                          sx={{
                            background: "rgba(255, 255, 255, 0.2)",
                            color: "white",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            borderRadius: 3,
                            fontWeight: "bold",
                            "&:hover": {
                              background: "rgba(255, 255, 255, 0.3)",
                            }
                          }}
                        >
                          Export Complete CSV
                        </Button>
                      </CSVLink>
                    </Box>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ background: "#f8f9fa" }}>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Subject Name</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Total Periods</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Present</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Absent</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>On Duty</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Attendance %</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {studentSummary.subjectsData.map(sub => (
                            <TableRow key={sub.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                              <TableCell sx={{ fontWeight: 'medium' }}>{sub.name}</TableCell>
                              <TableCell align="center">{sub.total}</TableCell>
                              <TableCell align="center">
                                <Chip label={sub.present} color="success" variant="outlined" size="small" />
                              </TableCell>
                              <TableCell align="center">
                                <Chip label={sub.absent} color="error" variant="outlined" size="small" />
                              </TableCell>
                              <TableCell align="center">
                                <Chip label={sub.onDuty} color="warning" variant="outlined" size="small" />
                              </TableCell>
                              <TableCell align="center">
                                <Chip 
                                  icon={<span>{getPercentageIcon(parseFloat(sub.percentage))}</span>}
                                  label={`${sub.percentage}%`}
                                  color={getPercentageColor(parseFloat(sub.percentage))}
                                  variant="filled"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </>
              ) : searchQuery && (
                <Alert severity="info" sx={{ borderRadius: 3, fontSize: '1.1rem' }} icon={<Person />}>
                  No student found matching your search criteria.
                </Alert>
              )}
            </Box>
          ) : null}
        </Paper>
      </Fade>
    </Container>
  );
};

export default CounsellorSummary;