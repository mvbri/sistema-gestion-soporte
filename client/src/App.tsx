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
import { SetSecurityQuestions } from './pages/SetSecurityQuestions';
import { EmailAlreadyVerified } from './pages/EmailAlreadyVerified';
import { RequestVerification } from './pages/RequestVerification';
import { Dashboard } from './pages/Dashboard';
import { TicketsList } from './pages/TicketsList';
import { CreateTicket } from './pages/CreateTicket';
import { TicketDetail } from './pages/TicketDetail';
import { TicketsDashboard } from './pages/TicketsDashboard';
import { TechnicianDashboard } from './pages/TechnicianDashboard';
import { AdminConfig } from './pages/AdminConfig';
import { AdminUsers } from './pages/AdminUsers';
import { AdminFrequentIssues } from './pages/AdminFrequentIssues';
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
import { ToolsDashboard } from './pages/ToolsDashboard';
import { ReportsPage } from './pages/ReportsPage';
import { LoansList } from './pages/LoansList';
import { CreateLoanRequest } from './pages/CreateLoanRequest';
import { LoanApproval } from './pages/LoanApproval';
import { LoanHandoverReturn } from './pages/LoanHandoverReturn';
import { LoanHistory } from './pages/LoanHistory';
import { LoanReportsPage } from './pages/LoanReportsPage';
import { MaterialRequestsList } from './pages/MaterialRequestsList';
import { CreateMaterialRequest } from './pages/CreateMaterialRequest';
import { MaterialRequestDetail } from './pages/MaterialRequestDetail';

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
          <Route path="/configurar-preguntas-seguridad" element={<SetSecurityQuestions />} />
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
              <ProtectedRoute allowedRoles={['administrator', 'technician']}>
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
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/frequent-issues"
            element={
              <ProtectedRoute allowedRoles={['administrator']}>
                <AdminFrequentIssues />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['administrator']}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loans"
            element={
              <ProtectedRoute>
                <LoansList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loans/create"
            element={
              <ProtectedRoute>
                <CreateLoanRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loans/approval"
            element={
              <ProtectedRoute allowedRoles={['administrator']}>
                <LoanApproval />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loans/:id"
            element={
              <ProtectedRoute>
                <LoanHandoverReturn />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loans/history"
            element={
              <ProtectedRoute>
                <LoanHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loans/reports"
            element={
              <ProtectedRoute allowedRoles={['administrator', 'technician']}>
                <LoanReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/material-requests"
            element={
              <ProtectedRoute>
                <MaterialRequestsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/material-requests/create"
            element={
              <ProtectedRoute>
                <CreateMaterialRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/material-requests/:id"
            element={
              <ProtectedRoute>
                <MaterialRequestDetail />
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
              <ProtectedRoute allowedRoles={['administrator', 'technician', 'end_user']}>
                <EquipmentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/equipment/crear"
            element={
              <ProtectedRoute allowedRoles={['administrator', 'technician']}>
                <CreateEquipment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/equipment/:id"
            element={
              <ProtectedRoute allowedRoles={['administrator', 'technician', 'end_user']}>
                <EquipmentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/equipment/:id/editar"
            element={
              <ProtectedRoute allowedRoles={['administrator', 'technician']}>
                <EquipmentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/equipment/analytics"
            element={
              <ProtectedRoute allowedRoles={['administrator', 'technician']}>
                <EquipmentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumables"
            element={
              <ProtectedRoute allowedRoles={['administrator', 'technician', 'end_user']}>
                <ConsumablesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumables/crear"
            element={
              <ProtectedRoute allowedRoles={['administrator', 'technician']}>
                <CreateConsumable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumables/:id"
            element={
              <ProtectedRoute allowedRoles={['administrator', 'technician', 'end_user']}>
                <ConsumableDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumables/:id/editar"
            element={
              <ProtectedRoute allowedRoles={['administrator', 'technician']}>
                <ConsumableDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumables/analytics"
            element={
              <ProtectedRoute allowedRoles={['administrator', 'technician']}>
                <ConsumablesDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tools"
            element={
              <ProtectedRoute allowedRoles={['administrator', 'technician', 'end_user']}>
                <ToolsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tools/crear"
            element={
              <ProtectedRoute allowedRoles={['administrator', 'technician']}>
                <CreateTool />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tools/:id"
            element={
              <ProtectedRoute allowedRoles={['administrator', 'technician', 'end_user']}>
                <ToolDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tools/:id/editar"
            element={
              <ProtectedRoute allowedRoles={['administrator', 'technician']}>
                <ToolDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tools/analytics"
            element={
              <ProtectedRoute allowedRoles={['administrator', 'technician']}>
                <ToolsDashboard />
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


