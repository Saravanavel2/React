// src/services/api.js
import axios from "axios";

const API_URL = "http://localhost:3001";

// 🔹 Backup Static Data (used if server not running)
const staticData = {
  students: [
    {
      id: "1",
      name: "saravana",
      regNo: "CSE1001",
      department: "CSE",
      section: "A",
      semester: 5,
    },
    {
      id: "2",
      name: "Jane Smith",
      regNo: "CSE1002",
      department: "CSE",
      section: "A",
      semester: 5,
    },
    {
      id: "3",
      name: "Alice Johnson",
      regNo: "ECE1001",
      department: "ECE",
      section: "B",
      semester: 3,
    },
    {
      id: "4",
      name: "Bob Williams",
      regNo: "MECH1001",
      department: "MECH",
      section: "C",
      semester: 4,
    },
  ],
  subjects: [
    { id: "1", name: "Maths", department: "CSE", section: "A" },
    { id: "2", name: "Physics", department: "CSE", section: "A" },
    { id: "3", name: "Electronics", department: "ECE", section: "B" },
    { id: "4", name: "Mechanics", department: "MECH", section: "C" },
  ],
  attendance: [
    {
      id: "a1",
      studentId: "1",
      subjectId: "1",
      date: "2025-09-24",
      period: 1,
      status: "onDuty",
    },
    {
      id: "a2",
      studentId: "2",
      subjectId: "1",
      date: "2025-09-24",
      period: 1,
      status: "onDuty",
    },
    {
      id: "a3",
      studentId: "1",
      subjectId: "2",
      date: "2025-09-25",
      period: 2,
      status: "onDuty",
    },
  ],
};

// 🔹 Utility function: fetch from server, else return fallback data
const fetchWithFallback = async (url, fallback) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.warn(`⚠️ Server not reachable, using static data for ${url}`);
    return fallback;
  }
};

// 🔹 API Functions
export const getStudents = () =>
  fetchWithFallback(`${API_URL}/students`, staticData.students);

export const getSubjects = () =>
  fetchWithFallback(`${API_URL}/subjects`, staticData.subjects);

export const getAttendance = () =>
  fetchWithFallback(`${API_URL}/attendance`, staticData.attendance);

export const markAttendance = (attendanceId, data) =>
  axios.put(`${API_URL}/attendance/${attendanceId}`, data);

export const addAttendance = (data) =>
  axios.post(`${API_URL}/attendance`, data);
