import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AddWebsite from './pages/AddWebsite';
import WebsiteLibrary from './pages/WebsiteLibrary';
import PixelTester from './pages/PixelTester';
import TrackingPage from './pages/TrackingPage';
import HowToUse from './pages/HowToUse';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import { TourProvider } from './context/TourContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <TourProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/go/:id" element={<TrackingPage />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route
                  path="/"
                  element={
                    <Layout>
                      <Dashboard />
                    </Layout>
                  }
                />
                <Route
                  path="/add"
                  element={
                    <Layout>
                      <AddWebsite />
                    </Layout>
                  }
                />
                <Route
                  path="/library"
                  element={
                    <Layout>
                      <WebsiteLibrary />
                    </Layout>
                  }
                />
                <Route
                  path="/tester"
                  element={
                    <Layout>
                      <PixelTester />
                    </Layout>
                  }
                />
                <Route
                  path="/guide"
                  element={
                    <Layout>
                      <HowToUse />
                    </Layout>
                  }
                />
              </Route>
            </Routes>
          </TourProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
