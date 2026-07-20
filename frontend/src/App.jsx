import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import JobApplications from './pages/JobApplications';
import Goals from './pages/Goals';
import Resumes from './pages/Resumes';
import AIAnalyzer from './pages/AIAnalyzer';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/applications" element={<ProtectedRoute><JobApplications /></ProtectedRoute>} />
            <Route path="/goals"        element={<ProtectedRoute><Goals /></ProtectedRoute>} />
            <Route path="/resumes"      element={<ProtectedRoute><Resumes /></ProtectedRoute>} />
            <Route path="/analyzer"     element={<ProtectedRoute><AIAnalyzer /></ProtectedRoute>} />
            <Route path="/profile"      element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
export default App;
