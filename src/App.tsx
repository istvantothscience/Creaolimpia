import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Leaderboard from './pages/Leaderboard';
import ProgramPage from './pages/ProgramPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import PointsForm from './pages/admin/PointsForm';
import { supabase } from './lib/supabase';

function AuthGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Betöltés...</div>;

  if (!user || !profile) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" />; // Or unauthorized page
  }

  return <>{children}</>;
}

export default function App() {
  if (!supabase) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gray-50">
        <div className="max-w-md p-8 bg-white rounded-xl shadow-lg">
          <h1 className="mb-4 text-2xl font-bold text-red-600">Hiányzó Supabase Konfiguráció</h1>
          <p className="mb-4 text-gray-600">Kérlek állítsd be a VITE_SUPABASE_URL és VITE_SUPABASE_ANON_KEY környezeti változókat az .env fájlban vagy a Secrets menüben.</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/leaderboard" />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/program" element={<ProgramPage />} />
            
            {/* Team Pages */}
            <Route path="/team" element={
              <AuthGuard allowedRoles={['student', 'teacher', 'admin']}>
                <div className="p-4">Csapat Dashboard (Hamarosan)</div>
              </AuthGuard>
            } />

            {/* Admin/Organizer Pages */}
            <Route path="/admin">
              <Route path="dashboard" element={
                <AuthGuard allowedRoles={['teacher', 'admin']}>
                  <AdminDashboard />
                </AuthGuard>
              } />
              <Route path="points" element={
                <AuthGuard allowedRoles={['teacher', 'admin']}>
                  <PointsForm />
                </AuthGuard>
              } />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

