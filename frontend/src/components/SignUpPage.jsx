import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Check, X } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import './SignUpPage.css';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password) => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  });

  const getPasswordStrength = (password) => {
    const checks = validatePassword(password);
    const strength = Object.values(checks).filter(Boolean).length;
    return (strength / 5) * 100;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSignUp = async () => {
    setErrors({});
    setSuccessMessage("");

    const newErrors = {};
    if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    const passwordChecks = validatePassword(formData.password);
    if (!Object.values(passwordChecks).every(Boolean)) {
      newErrors.password = "Password doesn't meet all requirements.";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/signup/", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      setSuccessMessage(response.data.message || "Account created successfully!");
      setFormData({ username: "", email: "", password: "", confirmPassword: "" });
    } catch (error) {
      const backendErrors = error.response?.data || {};
      setErrors({
        email: backendErrors.email || "",
        username: backendErrors.username || "",
        password: backendErrors.password || "",
        submit: backendErrors.message || "Failed to create account. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="signup-container">
      <div className="signup-background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <Paper elevation={3} className="signup-paper">
        <Typography variant="h4" className="signup-title">
          Create Account
        </Typography>

        {successMessage && (
          <Alert
            severity="success"
            className="signup-alert"
            onClose={() => setSuccessMessage("")}
          >
            {successMessage}
          </Alert>
        )}

        {errors.submit && (
          <Alert
            severity="error"
            className="signup-alert"
            onClose={() => setErrors((prev) => ({ ...prev, submit: "" }))}
          >
            {errors.submit}
          </Alert>
        )}

        <TextField
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          fullWidth
          className="signup-input"
          error={!!errors.username}
          helperText={errors.username}
          disabled={isLoading}
        />

        <TextField
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          fullWidth
          className="signup-input"
          error={!!errors.email}
          helperText={errors.email}
          disabled={isLoading}
        />

        <TextField
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={handleInputChange}
          fullWidth
          className="signup-input"
          error={!!errors.password}
          helperText={errors.password}
          disabled={isLoading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {formData.password && (
          <div className="password-strength">
            <LinearProgress
              variant="determinate"
              value={passwordStrength}
              className="password-strength-bar"
            />
            <div className="password-requirements">
              {Object.entries(validatePassword(formData.password)).map(([key, valid]) => (
                <div key={key} className="requirement-item">
                  {valid ? (
                    <Check size={16} className="check-icon" />
                  ) : (
                    <X size={16} className="x-icon" />
                  )}
                  <Typography
                    variant="caption"
                    className={valid ? "requirement-met" : "requirement-unmet"}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Typography>
                </div>
              ))}
            </div>
          </div>
        )}

        <TextField
          label="Confirm Password"
          name="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          value={formData.confirmPassword}
          onChange={handleInputChange}
          fullWidth
          className="signup-input"
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          disabled={isLoading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          variant="contained"
          fullWidth
          onClick={handleSignUp}
          disabled={isLoading}
          className="signup-button"
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Create Account"}
        </Button>

        <Typography variant="body2" className="login-text">
          Already have an account?{" "}
          <Link to="/" className="login-link">
            Login
          </Link>
        </Typography>
      </Paper>
    </div>
  );
};

export default SignUpPage;