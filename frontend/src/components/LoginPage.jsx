import React, { useContext, useState } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { AuthContext } from "./AuthProvider";
import "./LoginPage.css";

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      setError("Both username and password are required.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/api/login/", credentials);
      login(response.data);
      navigate("/home");
    } catch (err) {
      const backendError = err.response?.data?.error || "Login failed. Please try again.";
      setError(backendError);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Box className="login-wrapper">
      <div className="animated-background">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <Container maxWidth="sm" className="login-container">
        <Paper elevation={3} className="login-paper">
          <Box>
            <Typography variant="h4" className="login-title">
              Welcome Back!
            </Typography>
            <Typography variant="body1" className="login-subtitle">
              Please login to continue
            </Typography>

            {error && (
              <Alert
                severity="error"
                className="login-alert"
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleLogin}>
              <TextField
                label="Username"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                fullWidth
                className="login-input"
                disabled={isLoading}
                required
              />

              <TextField
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                onChange={handleInputChange}
                fullWidth
                className="login-input"
                disabled={isLoading}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={togglePasswordVisibility}
                        edge="end"
                        className="password-toggle"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isLoading}
                className="login-button"
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : "Login"}
              </Button>
            </form>

            <Typography variant="body2" className="signup-text">
              Don't have an account?{" "}
              <MuiLink
                component={Link}
                to="/signup"
                className="signup-link"
              >
                Sign Up
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
