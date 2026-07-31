import { Navigate, Route, Routes } from 'react-router-dom';

import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import ExamPage from '../pages/ExamPage';
import ResultPage from '../pages/ResultPage';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminLayout from '../components/admin/AdminLayout';
import { useAuth } from '../context/AuthContext';

import QuestionBank from '../components/admin/QuestionBank';

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
      <Route index element={<div>Admin Dashboard Home</div>} />
      <Route path="exams" element={<div>Exam Management</div>} />
      <Route path="questions" element={<QuestionBank />} />
      <Route path="roster" element={<div>Student Roster</div>} />
    </Route>

    <Route path="/" element={<Navigate to="/home" replace />} />
    <Route path="*" element={<Navigate to="/home" replace />} />
  </Routes>
);

export default AppRoutes;
