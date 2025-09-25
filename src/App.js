// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import Login from "./components/Login";
import TeacherDashboard from "./components/Teacher/Attendance";
import TeacherSummary from "./components/Teacher/Summary";
import CounsellorDashboard from "./components/ClassCouncillor/CounsellorSummary";
import StudentDashboard from "./components/Student/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* Teacher Routes */}
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/summary" element={<TeacherSummary />} />

        <Route path="/counsellor" element={<CounsellorDashboard />} />

        
        {/* Student Route */}
        <Route path="/student" element={<StudentDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
