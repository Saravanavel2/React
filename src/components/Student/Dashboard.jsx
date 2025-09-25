// src/components/Student/Dashboard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Material UI imports
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Divider,
  Alert,
  IconButton,
  Tooltip
} from "@mui/material";
import {
  Person as PersonIcon,
  School as SchoolIcon,
  AssignmentInd as AssignmentIndIcon,
  CalendarToday as CalendarIcon,
  DateRange as DateRangeIcon,
  TrendingUp as TrendingUpIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  MilitaryTech as MilitaryTechIcon,
  Clear as ClearIcon,
  Dashboard as DashboardIcon,
  Subject as SubjectIcon
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

// Styled components
const StyledDatePicker = styled(DatePicker)(({ theme }) => ({
  padding: theme.spacing(1.5),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  width: "100%",
  maxWidth: "300px",
  "&:focus": {
    outline: "none",
    borderColor: theme.palette.primary.main,
  },
}));

const StatCard = styled(Card)(({ theme }) => ({
  height: "100%",
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
  },
}));

const AttendanceProgress = styled(LinearProgress)(({ theme, value }) => ({
  height: 8,
  borderRadius: 4,
  marginTop: theme.spacing(1),
  "& .MuiLinearProgress-bar": {
    backgroundColor: value >= 75 ? theme.palette.success.main : 
                    value >= 50 ? theme.palette.warning.main : 
                    theme.palette.error.main,
  },
}));

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [dateFilter, setDateFilter] = useState(null);
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const staticData = {
  student: {
    id: "1",
    name: "Saravana Ji",
    regNo: "CSE1001",
    department: "CSE",
    section: "A",
    semester: 5
  },
  subjects: [
    { id: "1", name: "Data Structures" },
    { id: "2", name: "Operating Systems" }
  ],
  attendance: [
    { studentId: "1", subjectId: "1", status: "present", date: "2025-09-01" },
    { studentId: "1", subjectId: "2", status: "absent", date: "2025-09-01" },
    { studentId: "1", subjectId: "1", status: "onDuty", date: "2025-09-02" },
    { studentId: "1", subjectId: "2", status: "present", date: "2025-09-02" }
  ]
};


  const API_URL = "http://localhost:3001";
  const studentId = "1";

  // Define constant course plan (working days, periods per day)
  const totalWorkingDays = 30;
  const periodsPerDay = 4;
  const totalPeriods = totalWorkingDays * periodsPerDay;

  // Fetch student info
 useEffect(() => {
  axios.get(`${API_URL}/students/${studentId}`)
    .then(res => setStudent(res.data))
    .catch(err => {
      console.warn("⚠️ Server down, using static student data");
      setStudent(staticData.student);
    })
    .finally(() => setLoading(false));
}, [studentId]);


  // Fetch subjects
  useEffect(() => {
  axios.get(`${API_URL}/subjects`)
    .then(res => setSubjects(res.data))
    .catch(() => {
      console.warn("⚠️ Server down, using static subjects data");
      setSubjects(staticData.subjects);
    });
}, []);


  // Fetch all attendance (for overall)
  const [allAttendance, setAllAttendance] = useState([]);
  useEffect(() => {
  axios.get(`${API_URL}/attendance?studentId=${studentId}`)
    .then(res => setAllAttendance(res.data))
    .catch(() => {
      console.warn("⚠️ Server down, using static attendance data");
      setAllAttendance(staticData.attendance);
    });
}, [studentId]);


  // Fetch attendance for date filter (for subject-wise table)
  useEffect(() => {
  let url = `${API_URL}/attendance?studentId=${studentId}`;
  if (dateFilter) {
    const dateStr = dateFilter.toISOString().split("T")[0];
    url += `&date=${dateStr}`;
  }
  axios.get(url)
    .then(res => setAttendance(res.data))
    .catch(() => {
      console.warn("⚠️ Server down, using static attendance data for filtered date");
      const filtered = dateFilter 
        ? staticData.attendance.filter(a => a.date === dateFilter.toISOString().split("T")[0])
        : staticData.attendance;
      setAttendance(filtered);
    });
}, [studentId, dateFilter]);


  // Calculate per-subject summary (filtered by date)
  useEffect(() => {
    if (subjects.length) {
      const summary = subjects.map(sub => {
        const subAtt = attendance.filter(a => a.subjectId.toString() === sub.id.toString());
        const present = subAtt.filter(a => a.status === "present").length;
        const absent = subAtt.filter(a => a.status === "absent").length;
        const onDuty = subAtt.filter(a => a.status === "onDuty").length;
        const total = subAtt.length || 0;
        const percentage = total ? ((present / total) * 100).toFixed(2) : 0;
        return { ...sub, total, present, absent, onDuty, percentage };
      });
      setSummaryData(summary);
    }
  }, [subjects, attendance]);

  // Overall attendance calculation
  const overall = () => {
    const presentPeriods = allAttendance.filter(a => a.status === "present").length;
    const absentPeriods = allAttendance.filter(a => a.status === "absent").length;
    const onDutyPeriods = allAttendance.filter(a => a.status === "onDuty").length;
    const presentPercentPeriod = totalPeriods ? ((presentPeriods / totalPeriods) * 100).toFixed(2) : 0;
    const absentPercentPeriod = totalPeriods ? ((absentPeriods / totalPeriods) * 100).toFixed(2) : 0;

    const dates = [...new Set(allAttendance.map(a => a.date))];
    const presentDays = dates.filter(d => allAttendance.some(a => a.date === d && a.status === "present")).length;
    const absentDays = dates.filter(d => allAttendance.every(a => a.date === d && a.status === "absent")).length;
    const presentPercentDay = totalWorkingDays ? ((presentDays / totalWorkingDays) * 100).toFixed(2) : 0;
    const absentPercentDay = totalWorkingDays ? ((absentDays / totalWorkingDays) * 100).toFixed(2) : 0;

    return {
      totalWorkingDays,
      totalPeriods,
      presentPeriods,
      absentPeriods,
      onDutyPeriods,
      presentPercentPeriod: parseFloat(presentPercentPeriod),
      absentPercentPeriod: parseFloat(absentPercentPeriod),
      presentDays,
      absentDays,
      presentPercentDay: parseFloat(presentPercentDay),
      absentPercentDay: parseFloat(absentPercentDay)
    };
  };

  const ovr = overall();

  const getAttendanceColor = (percentage) => {
    if (percentage >= 75) return "success";
    if (percentage >= 50) return "warning";
    return "error";
  };

  const clearDateFilter = () => {
    setDateFilter(null);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {student && (
        <Box>
          {/* Header Section */}
          <Card sx={{ mb: 4, bgcolor: "primary.main", color: "primary.contrastText" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <DashboardIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    Welcome, {student.name}
                  </Typography>
                  <Typography variant="subtitle1">
                    Student Dashboard
                  </Typography>
                </Box>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box display="flex" alignItems="center">
                    <SchoolIcon sx={{ mr: 1 }} />
                    <Typography><strong>Department:</strong> {student.department}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box display="flex" alignItems="center">
                    <AssignmentIndIcon sx={{ mr: 1 }} />
                    <Typography><strong>Section:</strong> {student.section}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box display="flex" alignItems="center">
                    <PersonIcon sx={{ mr: 1 }} />
                    <Typography><strong>Register No:</strong> {student.regNo}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box display="flex" alignItems="center">
                    <DateRangeIcon sx={{ mr: 1 }} />
                    <Typography><strong>Semester:</strong> {student.semester}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Overall Attendance Cards */}
          <Typography variant="h5" gutterBottom sx={{ mb: 3, display: "flex", alignItems: "center" }}>
            <TrendingUpIcon sx={{ mr: 1 }} />
            Overall Attendance Summary
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Days Statistics */}
            <Grid item xs={12} md={6}>
              <StatCard>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <CalendarIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">Days Statistics</Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Total Working Days</Typography>
                      <Typography variant="h6" fontWeight="bold">{ovr.totalWorkingDays}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Days Completed</Typography>
                      <Typography variant="h6" fontWeight="bold">{ovr.presentDays + ovr.absentDays}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Days Pending</Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {ovr.totalWorkingDays - (ovr.presentDays + ovr.absentDays)}
                      </Typography>
                    </Grid>
                    
                  </Grid>
                </CardContent>
              </StatCard>
            </Grid>

            {/* Periods Statistics */}
            <Grid item xs={12} md={6}>
              <StatCard>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <MilitaryTechIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">Periods Statistics</Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Total Periods</Typography>
                      <Typography variant="h6" fontWeight="bold">{ovr.totalPeriods}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Attended Periods</Typography>
                      <Chip 
                        icon={<EventAvailableIcon />} 
                        label={`${ovr.presentPeriods} (${ovr.presentPercentPeriod}%)`}
                        color={getAttendanceColor(ovr.presentPercentPeriod)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Absent Periods</Typography>
                      <Chip 
                        icon={<EventBusyIcon />} 
                        label={ovr.absentPeriods}
                        color="error"
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">On Duty Periods</Typography>
                      <Chip 
                        label={ovr.onDutyPeriods}
                        color="info"
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Overall Attendance Progress (by Periods)
                    </Typography>
                    <AttendanceProgress 
                      variant="determinate" 
                      value={ovr.presentPercentPeriod} 
                    />
                    <Typography variant="caption" color="textSecondary">
                      {ovr.presentPercentPeriod}% attended
                    </Typography>
                  </Box>
                </CardContent>
              </StatCard>
            </Grid>
          </Grid>

          {/* Date Filter Section */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
                <SubjectIcon sx={{ mr: 1 }} />
                Subject-wise Attendance Details
              </Typography>
<Box display="flex" alignItems="center" gap={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
  {/* CHANGE: The fixed width sx={{ width: '300px' }} has been removed from this Box. */}
  <Box display="flex" alignItems="center">
    <StyledDatePicker
      // CHANGE: Width is now applied directly to the component.
      // You can adjust this value as needed (e.g., '250px').
      sx={{ width: '240px' }}
      selected={dateFilter}
      onChange={date => setDateFilter(date)}
      dateFormat="yyyy-MM-dd"
      isClearable 
      placeholderText="Select date to filter attendance"
    />
  </Box>
  
  {dateFilter && (
    <Chip 
      icon={<CalendarIcon />}
      label={`Filtering: ${dateFilter.toISOString().split("T")[0]}`}
      onDelete={clearDateFilter}
      color="primary"
    />
  )}
</Box>


              {dateFilter && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Showing attendance data for selected date only. Clear the filter to see all data.
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Subject-wise Table */}
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead sx={{ bgcolor: "primary.main" }}>
                <TableRow>
                  <TableCell sx={{ color: "primary.contrastText", fontWeight: "bold" }}>
                    Subject Name
                  </TableCell>
                  <TableCell sx={{ color: "primary.contrastText", fontWeight: "bold" }}>
                    Total Periods Marked
                  </TableCell>
                  <TableCell sx={{ color: "primary.contrastText", fontWeight: "bold" }}>
                    Present
                  </TableCell>
                  <TableCell sx={{ color: "primary.contrastText", fontWeight: "bold" }}>
                    Absent
                  </TableCell>
                  <TableCell sx={{ color: "primary.contrastText", fontWeight: "bold" }}>
                    On Duty
                  </TableCell>
                  <TableCell sx={{ color: "primary.contrastText", fontWeight: "bold" }}>
                    Attendance %
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {summaryData.map((sub) => (
                  <TableRow 
                    key={sub.id}
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight="medium">{sub.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={sub.total} variant="outlined" size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        icon={<EventAvailableIcon />}
                        label={sub.present}
                        color="success"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        icon={<EventBusyIcon />}
                        label={sub.absent}
                        color="error"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={sub.onDuty}
                        color="info"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Chip 
                          label={`${sub.percentage}%`}
                          color={getAttendanceColor(sub.percentage)}
                          size="small"
                        />
                        <AttendanceProgress 
                          variant="determinate" 
                          value={sub.percentage} 
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {summaryData.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No attendance data found for the selected criteria.
            </Alert>
          )}
        </Box>
      )}
    </Container>
  );
};

export default StudentDashboard;