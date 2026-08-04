import { Navigate, Route, Routes } from 'react-router-dom';

import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import ExamPage from '../pages/ExamPage';
import ResultPage from '../pages/ResultPage';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminLayout from '../components/admin/AdminLayout';
import { useAuth } from '../context/AuthContext';

import Dashboard from '../components/admin/Dashboard';
import ExamManagement from '../components/admin/ExamManagement';
import QuestionBank from '../components/admin/QuestionBank';
import Roster from '../components/admin/Roster';
import LiveMonitor from '../components/admin/LiveMonitor';
import Results from '../components/admin/Results';
import AuditLog from '../components/admin/AuditLog';

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'admin') {
    return <Navigate to="/home" replace />;
  }
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/home"
      element={
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/exam/:examId"
      element={
        <ProtectedRoute>
          <ExamPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/result"
      element={
        <ProtectedRoute>
          <ResultPage />
        </ProtectedRoute>
      }
    />
    
    <Route
      path="/admin"
      element={
        <ProtectedRoute>
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="exams" element={<ExamManagement />} />
      <Route path="questions" element={<QuestionBank />} />
      <Route path="roster" element={<Roster />} />
      <Route path="monitor" element={<LiveMonitor />} />
      <Route path="monitor/:examId" element={<LiveMonitor />} />
      <Route path="results" element={<Results />} />
      <Route path="results/:examId" element={<Results />} />
      <Route path="audit" element={<AuditLog />} />
    </Route>

    <Route path="/" element={<Navigate to="/home" replace />} />
    <Route path="*" element={<Navigate to="/home" replace />} />
  </Routes>
);

export default AppRoutes;
