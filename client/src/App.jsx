import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Subject from './pages/Subject';
import Chapter from './pages/Chapter';
import AiAssistant from './pages/AiAssistant';
import Analytics from './pages/Analytics';
import Planner from './pages/Planner';
import SubjectsList from './pages/SubjectsList';
import HowToUse from './pages/HowToUse';
import CustomCursor from './components/CustomCursor';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <CustomCursor />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="subjects" element={<SubjectsList />} />
          <Route path="subject/:id" element={<Subject />} />
          <Route path="chapter/:id" element={<Chapter />} />
          <Route path="ai" element={<AiAssistant />} />
          <Route path="planner" element={<Planner />} />
          <Route path="how-to-use" element={<HowToUse />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
