// Componente principal de la aplicación
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { MenuProvider } from './contexts/MenuContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { VerifyEmail } from './pages/VerifyEmail';
import { RequestPasswordRecovery } from './pages/RequestPasswordRecovery';
import { ResetPassword } from './pages/ResetPassword';
import { VerifySecurityQuestions } from './pages/VerifySecurityQuestions';
import { EmailAlreadyVerified } from './pages/EmailAlreadyVerified';
import { RequestVerification } from './pages/RequestVerification';
import { Dashboard } from './pages/Dashboard';
import { TicketsList } from './pages/TicketsList';
import { CreateTicket } from './pages/CreateTicket';
import { TicketDetail } from './pages/TicketDetail';
import { TicketsDashboard } from './pages/TicketsDashboard';
import { TechnicianDashboard } from './pages/TechnicianDashboard';
import { AdminConfig } from './pages/AdminConfig';
import { Profile } from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <MenuProvider>
        <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/verificar-email" element={<VerifyEmail />} />
          <Route path="/email-ya-verificado" element={<EmailAlreadyVerified />} />
          <Route path="/solicitar-verificacion" element={<RequestVerification />} />
          <Route path="/recuperar-password" element={<RequestPasswordRecovery />} />
          <Route path="/verificar-preguntas-seguridad" element={<VerifySecurityQuestions />} />
          <Route path="/restablecer-password" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <TicketsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/crear"
            element={
              <ProtectedRoute>
                <CreateTicket />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/:id"
            element={
              <ProtectedRoute>
                <TicketDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/:id/editar"
            element={
              <ProtectedRoute>
                <TicketDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <TicketsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tecnico/dashboard"
            element={
              <ProtectedRoute>
                <TechnicianDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/config"
            element={
              <ProtectedRoute>
                <AdminConfig />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
      </MenuProvider>
    </AuthProvider>
  );
}

export default App;


