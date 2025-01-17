import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Box,
  Card,
  CardContent,
  IconButton,
  Snackbar,
  CircularProgress,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import HistoryIcon from '@mui/icons-material/History';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './App.css';

// Backend URL directly embedded here
const BACKEND_URL = "http://127.0.0.1:8000";

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [url, setUrl] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/history/`);
      if (!response.ok) throw new Error('Failed to fetch history');
      const data = await response.json();
      setHistory(data.history); // Access `history` from JSON response
    } catch (error) {
      showSnackbar('Error fetching history', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) {
      showSnackbar('Please enter a URL', 'error');
      return;
    }
  
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/upload/`, {
        method: 'POST', // Use POST to send URL in body
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }), // Send the URL in the body
      });
  
      if (!response.ok) throw new Error('Failed to process URL');
      await fetchHistory();
      setUrl('');
      showSnackbar('URL analyzed successfully!', 'success');
    } catch (error) {
      showSnackbar('Error processing URL', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (urlId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/history/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url_id: urlId }),
      });

      if (!response.ok) throw new Error('Failed to delete entry');
      await fetchHistory();
      showSnackbar('Entry deleted successfully!', 'success');
    } catch (error) {
      showSnackbar('Error deleting entry', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="app-background">
        <div className="animated-background">
          <div className="particle p1"></div>
          <div className="particle p2"></div>
          <div className="particle p3"></div>
          <div className="particle p4"></div>
          <div className="particle p5"></div>
        </div>
        
        <Box className="main-wrapper">
          <Container maxWidth="lg" className="main-container">
            <Paper elevation={24} className="main-content-card">
              <Box sx={{ p: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom align="center" className="title-gradient">
                  Social Media Forensic
                </Typography>
                <Typography variant="h6" color="textSecondary" align="center" sx={{ mb: 4 }}>
                  Enter a URL to get its summary
                </Typography>

                <Paper elevation={3} sx={{ p: 3, mb: 4 }} className="input-section">
                  <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        fullWidth
                        label="Enter URL"
                        variant="outlined"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={loading}
                        placeholder="https://example.com"
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <LinkIcon />}
                      >
                        Analyze
                      </Button>
                    </Box>
                  </form>
                </Paper>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HistoryIcon sx={{ mr: 1 }} />
                  <Typography variant="h5">Analysis History</Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {history.length === 0 ? (
                    <Typography variant="body1" color="textSecondary" align="center">
                      No history available yet. Start by analyzing a URL!
                    </Typography>
                  ) : (
                    history.map((item) => (
                      <Card key={item.url_id} elevation={2}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" component="div">
                                {item.url}
                              </Typography>
                              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                                {item.summary}
                              </Typography>
                            </Box>
                            <IconButton
                              onClick={() => handleDelete(item.url_id)}
                              color="error"
                              sx={{ ml: 2 }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </Box>
              </Box>
            </Paper>
          </Container>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </ThemeProvider>
  );
}

export default App;
