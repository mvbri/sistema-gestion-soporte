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
import { BackupRestore } from './pages/BackupRestore';
import { Profile } from './pages/Profile';
import { EquipmentList } from './pages/EquipmentList';
import { CreateEquipment } from './pages/CreateEquipment';
import { EquipmentDetail } from './pages/EquipmentDetail';
import { EquipmentDashboard } from './pages/EquipmentDashboard';
import { ConsumablesList } from './pages/ConsumablesList';
import { CreateConsumable } from './pages/CreateConsumable';
import { ConsumableDetail } from './pages/ConsumableDetail';
import { ConsumablesDashboard } from './pages/ConsumablesDashboard';
import { ToolsList } from './pages/ToolsList';
import { CreateTool } from './pages/CreateTool';
import { ToolDetail } from './pages/ToolDetail';

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
            path="/admin/backup"
            element={
              <ProtectedRoute>
                <BackupRestore />
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
          <Route
            path="/equipment"
            element={
              <ProtectedRoute>
                <EquipmentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/equipment/crear"
            element={
              <ProtectedRoute>
                <CreateEquipment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/equipment/:id"
            element={
              <ProtectedRoute>
                <EquipmentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/equipment/:id/editar"
            element={
              <ProtectedRoute>
                <EquipmentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/equipment/analytics"
            element={
              <ProtectedRoute>
                <EquipmentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumables"
            element={
              <ProtectedRoute>
                <ConsumablesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumables/crear"
            element={
              <ProtectedRoute>
                <CreateConsumable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumables/:id"
            element={
              <ProtectedRoute>
                <ConsumableDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumables/:id/editar"
            element={
              <ProtectedRoute>
                <ConsumableDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumables/analytics"
            element={
              <ProtectedRoute>
                <ConsumablesDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tools"
            element={
              <ProtectedRoute>
                <ToolsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tools/crear"
            element={
              <ProtectedRoute>
                <CreateTool />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tools/:id"
            element={
              <ProtectedRoute>
                <ToolDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tools/:id/editar"
            element={
              <ProtectedRoute>
                <ToolDetail />
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


