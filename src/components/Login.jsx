// src/components/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box, Button, FormControl, InputLabel, MenuItem,
  Select, TextField, Typography, Paper, InputAdornment,
  Fade, Container
} from "@mui/material";
import {
  Person as PersonIcon,
  School as TeacherIcon,
  Psychology as CounsellorIcon,
  Lock as LockIcon,
  EmojiPeople as StudentIcon
} from "@mui/icons-material";

const staticData = {
  students: [
    { id: "1", name: "saravana", regNo: "CSE1001", department: "CSE", section: "A", semester: 5 },
    { id: "2", name: "Jane Smith", regNo: "CSE1002", department: "CSE", section: "A", semester: 5 }
  ],
  teachers: [
    { id: "1", name: "hari", department: "CSE", subjects: ["1", "2"] }
  ],
  counsellors: [
    { id: "1", name: "cc", department: "CSE" }
  ]
};

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      let url = "";
      if (role === "teacher") url = `http://localhost:3001/teachers?name=${username}`;
      else if (role === "counsellor") url = `http://localhost:3001/counsellors?name=${username}`;
      else url = `http://localhost:3001/students?name=${username}`;

      let res;
      try {
        // Try fetching from backend
        res = await axios.get(url);
      } catch (serverErr) {
        console.warn("⚠️ Server down, using static data for login");

        // Fallback static check
        if (role === "teacher") {
          res = { data: staticData.teachers.filter((t) => t.name.toLowerCase() === username.toLowerCase()) };
        } else if (role === "counsellor") {
          res = { data: staticData.counsellors.filter((c) => c.name.toLowerCase() === username.toLowerCase()) };
        } else {
          res = { data: staticData.students.filter((s) => s.name.toLowerCase() === username.toLowerCase()) };
        }
      }

      if (res.data.length > 0) {
        if (role === "teacher") navigate("/teacher");
        else if (role === "counsellor") navigate("/counsellor");
        else navigate("/student");
      } else {
        setError("User not found");
      }
    } catch (err) {
      console.error(err);
      setError("Unexpected error");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case "teacher": return <TeacherIcon sx={{ color: "#fff" }} />;
      case "counsellor": return <CounsellorIcon sx={{ color: "#fff" }} />;
      default: return <StudentIcon sx={{ color: "#fff" }} />;
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Video */}
      <Box
        component="video"
        autoPlay
        muted
        loop
        playsInline
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      >
        <source src="https://n6xuovvnbt9fbc6b.public.blob.vercel-storage.com/5551778-uhd_3840_2160_30fps.mp4" type="video/mp4" />
      </Box>

      {/* Dark Overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          zIndex: 1,
        }}
      />

      <Container component="main" maxWidth="sm" sx={{ position: "relative", zIndex: 2 }}>
        <Fade in timeout={800}>
          <Paper
            elevation={0}
            sx={{
              padding: { xs: 3, sm: 5 },
              borderRadius: 4,
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: "linear-gradient(90deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4), rgba(255,255,255,0.8))",
              }
            }}
          >
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  margin: "0 auto 16px",
                  background: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                <LockIcon sx={{ fontSize: 40, color: "white" }} />
              </Box>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: "bold",
                  color: "white",
                  fontSize: { xs: "2rem", sm: "2.5rem" },
                  textShadow: "0 2px 10px rgba(0,0,0,0.3)"
                }}
              >
                Welcome Back
              </Typography>
              <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.8)", mt: 1, textShadow: "0 1px 5px rgba(0,0,0,0.3)" }}>
                Sign in to access your account
              </Typography>
            </Box>

            <form onSubmit={handleLogin}>
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                sx={{
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    transition: "all 0.3s",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    color: "white",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                    },
                    "& fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.8)",
                    }
                  },
                  "& .MuiInputLabel-root": {
                    color: "rgba(255, 255, 255, 0.8)",
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "rgba(255, 255, 255, 0.9)",
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: "rgba(255, 255, 255, 0.8)" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl variant="outlined" fullWidth margin="normal">
                <InputLabel sx={{ color: "rgba(255, 255, 255, 0.8)" }}>Role</InputLabel>
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  label="Role"
                  sx={{
                    borderRadius: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      transition: "all 0.3s",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 12px rgba(242, 224, 224, 0.2)",
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                      },
                      "& fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.3)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.5)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.8)",
                      }
                    },
                    "& .MuiSelect-icon": {
                      color: "rgba(255, 255, 255, 0.8)",
                    }
                  }}
                  startAdornment={
                    <InputAdornment position="start">
                      {getRoleIcon()}
                    </InputAdornment>
                  }
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: "rgba(30, 30, 30, 0.95)",
                        backdropFilter: "blur(10px)",
                        marginTop: 1,
                        "& .MuiMenuItem-root": {
                          color: "white",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                          },
                          "&.Mui-selected": {
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                          },
                          "&.Mui-selected:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.25)",
                          }
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="teacher">Teacher</MenuItem>
                  <MenuItem value="counsellor">Class Counsellor</MenuItem>
                </Select>
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isLoading}
                sx={{
                  marginTop: 3,
                  padding: 1.5,
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  background: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                  borderRadius: 2,
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                  transition: "all 0.3s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 25px rgba(0,0,0,0.3)",
                    background: "rgba(255, 255, 255, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.5)",
                  },
                  "&:disabled": {
                    transform: "none",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    background: "rgba(255, 255, 255, 0.1)",
                  }
                }}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>

              {error && (
                <Fade in>
                  <Typography
                    align="center"
                    sx={{
                      marginTop: 2,
                      fontWeight: "bold",
                      padding: 1,
                      background: "rgba(244, 67, 54, 0.2)",
                      color: "#ffcdd2",
                      borderRadius: 1,
                      border: "1px solid rgba(244, 67, 54, 0.3)",
                      textShadow: "0 1px 5px rgba(0,0,0,0.3)"
                    }}
                  >
                    {error}
                  </Typography>
                </Fade>
              )}
            </form>

            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.7)", textShadow: "0 1px 5px rgba(0,0,0,0.3)" }}>
                Demo: Enter any name to login
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login;