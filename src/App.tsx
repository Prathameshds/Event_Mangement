import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import ParticipantDashboard from './pages/Dashboard/ParticipantDashboard';
import OrganizerDashboard from './pages/Dashboard/OrganizerDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import EventForm from './pages/EventForm';

// Protected Route Component
const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="events" element={<Events />} />
            <Route path="events/:id" element={<EventDetails />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            
            {/* Participant Routes */}
            <Route path="participant/dashboard" element={
              <ProtectedRoute roles={['participant', 'organizer', 'admin']}>
                <ParticipantDashboard />
              </ProtectedRoute>
            } />

            {/* Organizer Routes */}
            <Route path="organizer/dashboard" element={
              <ProtectedRoute roles={['organizer', 'admin']}>
                <OrganizerDashboard />
              </ProtectedRoute>
            } />
            <Route path="events/create" element={
              <ProtectedRoute roles={['organizer', 'admin']}>
                <EventForm />
              </ProtectedRoute>
            } />
            <Route path="events/edit/:id" element={
              <ProtectedRoute roles={['organizer', 'admin']}>
                <EventForm />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="admin/dashboard" element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Redirects */}
            <Route path="profile" element={
              <ProtectedRoute>
                <div className="max-w-4xl mx-auto py-20 text-center">
                  <h1 className="text-3xl font-bold mb-4">Profile Page</h1>
                  <p className="text-gray-500">Profile management coming soon in Part 2.</p>
                  <Link to="/" className="text-indigo-600 font-bold underline mt-4 inline-block">Go Home</Link>
                </div>
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
